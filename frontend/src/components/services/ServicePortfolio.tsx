'use client';

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
} from 'react';
import Image from 'next/image';
import PortfolioModal from './PortfolioModal';

/* ---------- types ---------- */
export type RGB = [number, number, number];

export type ServicePortfolioItem = {
  id: number | string;
  title: string;
  cover_url?: string | null;
  coverFit?: 'cover' | 'contain';
  excerpt?: string | null;
  href?: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  items: ServicePortfolioItem[];
  accentFrom?: RGB;
  accentTo?: RGB;
};

type AccVars = Record<'--acc1' | '--acc2', string>;
type BleedVars = CSSProperties & { ['--pf-bleed']?: string };

/* ====================================================================== */

export default function ServicePortfolio({
  title = 'Portfolio',
  subtitle = 'Selected work',
  items,
  accentFrom,
  accentTo,
}: Props) {
  const perView = 3;
  const GAP = 25;
  const BLEED = 18;
  const NAV_SIZE = 52;
  const NAV_OUT = 24;

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState<number>(0);
  const [cardW, setCardW] = useState<number>(320);
  const [openedId, setOpenedId] = useState<number | null>(null);

  const pages = Math.max(1, Math.ceil(items.length / perView));
  const controlsDisabled = items.length <= perView;

  const accVars = useMemo<AccVars | undefined>(() => {
    if (!accentFrom || !accentTo) return undefined;
    return { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };
  }, [accentFrom, accentTo]);

  const bleedVars = useMemo<BleedVars>(() => ({ ['--pf-bleed']: `${BLEED}px` }), []);

  /* ======================== Smooth scroll helpers ======================= */
  const supportsNativeSmooth = useMemo<boolean>(() => {
    try {
      const el = document.createElement('div');
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      el.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      return true;
    } catch {
      return false;
    }
  }, []);

  const rafId = useRef<number | null>(null);
  const cancelAnim = useCallback(() => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const rAFScrollTo = useCallback(
    (left: number, duration = 560) => {
      const vp = viewportRef.current;
      if (!vp) return;
      cancelAnim();

      const start = vp.scrollLeft;
      const delta = left - start;
      if (Math.abs(delta) < 1) {
        vp.scrollLeft = left;
        return;
      }
      const t0 = performance.now();

      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        vp.scrollLeft = start + delta * easeInOutCubic(p);
        if (p < 1) rafId.current = requestAnimationFrame(step);
        else rafId.current = null;
      };
      rafId.current = requestAnimationFrame(step);
    },
    [cancelAnim]
  );

  const smoothTo = useCallback(
    (left: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      cancelAnim();
      if (supportsNativeSmooth) vp.scrollTo({ left, behavior: 'smooth' });
      else rAFScrollTo(left);
    },
    [supportsNativeSmooth, rAFScrollTo, cancelAnim]
  );
  /* ==================================================================== */

  const getVpPadLeft = (): number => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    const cs = getComputedStyle(vp);
    const val = parseFloat(cs.paddingLeft || '0');
    return Number.isFinite(val) ? val : 0;
  };

  const getPageWidth = useCallback((): number => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    return Math.max(0, vp.clientWidth - 2 * BLEED);
  }, [BLEED]);

  const recalcCardWidth = useCallback(() => {
    const pageW = getPageWidth();
    if (pageW <= 0) return;
    const w = (pageW - GAP * (perView - 1)) / perView;
    setCardW(Math.max(200, Math.round(w)));
  }, [GAP, perView, getPageWidth]);

  const getPagePositions = useCallback((): number[] => {
    const track = trackRef.current;
    if (!track) return [0];

    const pad = getVpPadLeft();
    const arr: number[] = [];
    for (let p = 0; p < pages; p++) {
      const i = p * perView;
      const el = track.children[i] as HTMLElement | undefined;
      arr.push(el ? Math.max(0, Math.round(el.offsetLeft - pad)) : 0);
    }
    return arr;
  }, [pages, perView]);

  const goTo = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(0, Math.min(targetPage, pages - 1));
      setPage(clamped);
      requestAnimationFrame(() => {
        const positions = getPagePositions();
        smoothTo(positions[clamped] ?? 0);
      });
    },
    [pages, getPagePositions, smoothTo]
  );

  const next = (): void => goTo(page + 1);
  const prev = (): void => goTo(page - 1);

  /* ---------- resize: удерживаем текущую страницу (без анимации) ---------- */
  useEffect(() => {
    const onResize = () => {
      recalcCardWidth();
      const vp = viewportRef.current;
      if (!vp) return;
      const positions = getPagePositions();
      cancelAnim();
      vp.scrollLeft = positions[page] ?? 0;
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [page, recalcCardWidth, getPagePositions, cancelAnim]);

  useEffect(() => {
    recalcCardWidth();
  }, [recalcCardWidth]);

  /* ------------------- drag / swipe с инерцией/снапом ------------------- */
  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;

    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    const isInteractive = (el: EventTarget | null): boolean =>
      el instanceof Element &&
      Boolean(el.closest('button, a, [role="button"], input, select, textarea, label'));

    const down = (e: PointerEvent) => {
      if (isInteractive(e.target)) return;

      dragging = true;
      startX = e.clientX;
      startLeft = vp.scrollLeft;
      lastX = e.clientX;
      lastT = e.timeStamp;
      track.setPointerCapture(e.pointerId);
      (track.style as CSSStyleDeclaration).cursor = 'grabbing';
      cancelAnim();
    };

    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      vp.scrollLeft = startLeft - dx;

      const dt = e.timeStamp - lastT || 1;
      velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = e.timeStamp;
    };

    const up = () => {
      if (!dragging) return;
      dragging = false;
      track.style.removeProperty('cursor');

      const positions = getPagePositions();
      let curr = 0;
      let best = Number.POSITIVE_INFINITY;
      positions.forEach((pos, i) => {
        const d = Math.abs(vp.scrollLeft - pos);
        if (d < best) {
          best = d;
          curr = i;
        }
      });

      const threshold = 0.25;
      const target =
        velocity > threshold ? curr - 1 : velocity < -threshold ? curr + 1 : curr;
      goTo(target);
    };

    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);

    return () => {
      track.removeEventListener('pointerdown', down);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
    };
  }, [goTo, getPagePositions, cancelAnim]);

  /* стрелки с клавиатуры */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* ------------------------------ render -------------------------------- */
  return (
    <section id="portfolio"  className="oc-section section-soft" style={accVars as CSSProperties}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">
            {title}
          </h2>
          <p className="mt-1 text-sm md:text-base text-white/60">{subtitle}</p>
        </div>

        <div
          className="relative"
          style={{
            marginLeft: 'calc(var(--pf-bleed, 0px) * -1)',
            marginRight: 'calc(var(--pf-bleed, 0px) * -1)',
            paddingBottom: 'var(--pf-bleed, 0px)',
            overflow: 'visible',
            ...bleedVars,
          }}
        >
          {!controlsDisabled && (
            <>
              <button
                aria-label="Prev"
                onClick={prev}
                className="group hidden md:grid place-items-center rounded-full border border-white/10 bg-black/10 text-white/80 shadow-lg backdrop-blur-sm transition will-change-transform hover:scale-105 active:scale-95"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `-${NAV_SIZE + NAV_OUT}px`,
                  width: NAV_SIZE,
                  height: NAV_SIZE,
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                }}
              >
                <span
                  className="text-2xl leading-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  ‹
                </span>
              </button>

              <button
                aria-label="Next"
                onClick={next}
                className="group hidden md:grid place-items-center rounded-full border border-white/10 bg-black/10 text-white/80 shadow-lg backdrop-blur-sm transition will-change-transform hover:scale-105 active:scale-95"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: `-${NAV_SIZE + NAV_OUT}px`,
                  width: NAV_SIZE,
                  height: NAV_SIZE,
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                }}
              >
                <span
                  className="text-2xl leading-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  ›
                </span>
              </button>
            </>
          )}

          <div
            ref={viewportRef}
            className="no-scrollbar pf-viewport"
            /* Раньше было data-lenis-prevent — блокировало wheel вертикальный.
               Оставляем только тач: горизонтальные свайпы работают, колесо — скроллит страницу. */
            data-lenis-prevent-touch=""
            style={{
              paddingLeft: 'var(--pf-bleed)',
              paddingRight: 'var(--pf-bleed)',
              overflowX: 'auto',
              overflowY: 'visible',
              scrollBehavior: 'smooth',
            }}
          >
            <div
              ref={trackRef}
              className="pf-track flex select-none touch-pan-x"
              style={{ gap: GAP }}
            >
              {items.map((it) => (
                <Card key={String(it.id)} item={it} cardW={cardW} onOpen={setOpenedId} />
              ))}
              <div style={{ flex: `0 0 ${BLEED}px` }} aria-hidden />
            </div>
          </div>
        </div>

        {!controlsDisabled && <Dots pages={pages} page={page} goTo={goTo} />}

        {/* страховочный спейсер, чтобы скролл точно доходил до конца */}
        <div aria-hidden style={{ height: 24 }} />
      </div>

      {openedId != null && (
        <PortfolioModal
          id={openedId}
          onClose={() => setOpenedId(null)}
          accFrom={accentFrom}
          accTo={accentTo}
        />
      )}

    </section>
  );
}

/* --------------------------- Вспомогательное --------------------------- */

function Dots({
  pages,
  page,
  goTo,
}: {
  pages: number;
  page: number;
  goTo: (i: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 select-none">
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to page ${i + 1}`}
          onClick={() => goTo(i)}
          className="h-2 rounded-full transition"
          style={{
            width: i === page ? 22 : 8,
            background: i === page ? 'rgb(var(--acc2))' : 'rgba(255,255,255,.25)',
            opacity: i === page ? 1 : 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ Card ----------------------------------- */

function Card({
  item,
  cardW,
  onOpen,
}: {
  item: ServicePortfolioItem;
  cardW: number;
  onOpen: (id: number) => void;
}) {
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [hover, setHover] = useState<boolean>(false);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top) / r.height;
    setTilt({ rx: -(cy - 0.5) * 8, ry: (cx - 0.5) * 10 });
  };

  const cover = item.cover_url ?? undefined;
  const fit: 'cover' | 'contain' = item.coverFit ?? 'contain';

  // конвертируем id в число для модалки (ожидает number)
  const numericId: number | null =
    typeof item.id === 'number'
      ? item.id
      : typeof item.id === 'string'
      ? Number.parseInt(item.id, 10) || null
      : null;

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (numericId !== null && Number.isFinite(numericId)) {
      onOpen(numericId);
    }
  };

  return (
    <div
      className="pf-card"
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setTilt({ rx: 0, ry: 0 });
        setHover(false);
      }}
      style={
        {
          width: `${cardW}px`,
          flex: `0 0 ${cardW}px`,
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          zIndex: hover ? 20 : 1,
          position: 'relative',
          willChange: 'transform',
        } as CSSProperties
      }
    >
      <div className="pf-ring" />
      <div className="pf-cover relative">
        {cover ? (
          <Image
            src={cover}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 33vw, 90vw"
            style={{ objectFit: fit }}
            className="pf-img"
          />
        ) : (
          <div className="pf-nopreview">no preview</div>
        )}

        <div className="pf-spot" />
        <div className="pf-vignette" />

        <div className="pf-meta-on">
          <div className="min-w-0">
            <div className="pf-title">{item.title}</div>
            {item.excerpt && <div className="pf-sub">{item.excerpt}</div>}
          </div>

          {/* View открывает модалку */}
          <button
            type="button"
            onClick={handleOpen}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="pf-cta"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
