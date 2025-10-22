'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type MutableRefObject,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { fetchPortfolioItem } from '@/lib/api';
import type { Portfolio } from '@/types/portfolio';
import type { RGB } from '@/types/ui';
import { toMediaUrl } from '@/lib/mediaUrl';

/* =========================
   Helpers
   ========================= */

type AnyObj = Record<string, unknown>;

function getStrProp(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === 'object') {
    const v = (obj as AnyObj)[key];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

function getGalleryStrict(obj: unknown): string[] {
  if (obj && typeof obj === 'object' && 'gallery' in (obj as AnyObj)) {
    const v = (obj as { gallery?: unknown }).gallery;
    if (Array.isArray(v)) {
      return v.filter((x): x is string => typeof x === 'string');
    }
  }
  return [];
}

function ytId(u?: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1) || null;
    if (url.hostname.includes('youtube.com')) {
      return (
        url.searchParams.get('v') ||
        url.pathname.match(/\/embed\/([^/?#]+)/)?.[1] ||
        null
      );
    }
  } catch {
    // ignore bad url
  }
  return null;
}

/* =========================
   Lenis guard
   ========================= */
type LenisLike = { stop: () => void; start: () => void; isStopped?: boolean };
function getLenisFromWindow(): LenisLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = (window as unknown as { lenis?: unknown }).lenis;
  if (
    raw &&
    typeof (raw as Record<string, unknown>).stop === 'function' &&
    typeof (raw as Record<string, unknown>).start === 'function'
  ) {
    return raw as LenisLike;
  }
  return undefined;
}

/* =========================
   Types
   ========================= */
type MediaType = 'image' | 'video' | 'youtube';
type Media = { url: string; type: MediaType };

export default function PortfolioModal({
  id,
  onClose,
  accFrom,
  accTo,
}: {
  id: number | null;
  onClose: () => void;
  /** Акцентные цвета сервиса (RGB), чтобы модалка совпадала по теме */
  accFrom?: RGB;
  accTo?: RGB;
}) {
  const [item, setItem] = useState<Portfolio | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ===== fetch ===== */
  useEffect(() => {
    if (!id) return;
    setItem(null);
    setErr(null);
    setIdx(0);
    fetchPortfolioItem(id)
      .then((data) => setItem(data))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [id]);

  /* ===== строим медиа-лист ===== */
  const media: Media[] = useMemo(() => {
    if (!item) return [];

    // 1) если есть YouTube — показываем его первым и отключаем галерею
    const yid = ytId(getStrProp(item, 'video_url'));
    if (yid) {
      return [
        {
          url: `https://www.youtube.com/embed/${yid}?rel=0&modestbranding=1`,
          type: 'youtube',
        },
      ];
    }

    // 2) иначе собираем картинки/видео
    const uniq = new Set<string>();
    const list: Media[] = [];

    const push = (u?: string | null) => {
      if (!u) return;
      const abs = toMediaUrl(u);
      if (!abs || uniq.has(abs)) return;
      uniq.add(abs);
      list.push({
        url: abs,
        type: /\.(mp4|webm|mov|avi)$/i.test(abs) ? 'video' : 'image',
      });
    };

    push(getStrProp(item, 'cover_url'));
    push(getStrProp(item, 'preview_url'));
    push(getStrProp(item, 'thumbnail_url'));

    getGalleryStrict(item).forEach((u) => push(u));

    return list;
  }, [item]);

  const total = media.length;

  /* ===== навигация (зависит от total) ===== */
  const next = useCallback(() => {
    if (!total) return;
    setIdx((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (!total) return;
    setIdx((i) => (i - 1 + total) % total);
  }, [total]);

  /* ===== применяем акцентные цвета на :root на время модалки ===== */
  useEffect(() => {
    if (!id) return;
    const root = document.documentElement;

    const prevAcc1 = root.style.getPropertyValue('--acc1');
    const prevAcc2 = root.style.getPropertyValue('--acc2');

    if (accFrom)
      root.style.setProperty('--acc1', `${accFrom[0]} ${accFrom[1]} ${accFrom[2]}`);
    if (accTo)
      root.style.setProperty('--acc2', `${accTo[0]} ${accTo[1]} ${accTo[2]}`);

    return () => {
      if (prevAcc1) root.style.setProperty('--acc1', prevAcc1);
      else root.style.removeProperty('--acc1');

      if (prevAcc2) root.style.setProperty('--acc2', prevAcc2);
      else root.style.removeProperty('--acc2');
    };
  }, [id, accFrom, accTo]);

  /* ===== ПОЛНАЯ блокировка скролла + Lenis stop ===== */
  useEffect(() => {
    if (!id) return;

    const root = document.documentElement;
    const body = document.body;

    root.classList.add('oc-no-vert-scroll');
    body.classList.add('oc-no-vert-scroll');
    root.setAttribute('data-lenis-lock', '1');

    const lenis = getLenisFromWindow();
    const wasRunning = !!lenis && !lenis.isStopped;
    lenis?.stop();

    const prevent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('wheel', prevent, { passive: false, capture: true });
    window.addEventListener('touchmove', prevent, { passive: false, capture: true });

    dialogRef.current?.focus();

    return () => {
      window.removeEventListener('wheel', prevent, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener('touchmove', prevent, {
        capture: true,
      } as EventListenerOptions);
      root.classList.remove('oc-no-vert-scroll');
      body.classList.remove('oc-no-vert-scroll');
      root.removeAttribute('data-lenis-lock');
      if (wasRunning) lenis?.start();
    };
  }, [id]);

  /* ===== esc / arrows ===== */
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose, next, prev]);

  /* ===== свайпы по viewer ===== */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let sx = 0;
    let sy = 0;
    let dx = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      dx = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const ax = e.clientX - sx;
      const ay = e.clientY - sy;
      if (Math.abs(ax) > Math.abs(ay)) {
        e.preventDefault();
        dx = ax;
      }
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    };

    el.addEventListener('pointerdown', onDown, { passive: true });
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [idx, next, prev]);

  if (!id) return null;

  const title = item?.title ?? 'Loading…';
  const excerpt = getStrProp(item, 'excerpt');
  const tags = getStrProp(item, 'tags');

  // Цвет стрелок/индикаторов — из --acc1/--acc2
  const accGradient =
    'linear-gradient(135deg, rgb(var(--acc1, 255 255 255)), rgb(var(--acc2, 170 170 170)))';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      ref={dialogRef}
      tabIndex={-1}
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* card */}
      <div
        className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-950/85 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <h3 className="text-white/95 font-semibold text-base sm:text-lg truncate">
              {title}
            </h3>
            <div className="text-xs text-white/50">{total ? `${idx + 1} / ${total}` : '—'}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous"
              className="inline-grid place-items-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-95 transition"
              style={{
                color: 'transparent',
                backgroundImage: accGradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="inline-grid place-items-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-95 transition"
              style={{
                color: 'transparent',
                backgroundImage: accGradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              ›
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-grid place-items-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:scale-95 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-4 sm:gap-5 p-4 sm:p-6">
            {/* viewer */}
            <div className="relative">
              <div
                ref={trackRef}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-black"
              >
                <div className="relative w-full" style={{ height: 'min(68vh, 700px)' }}>
                  {err ? (
                    <div className="absolute inset-0 grid place-items-center text-red-300 text-sm">
                      {err}
                    </div>
                  ) : !item || total === 0 ? (
                    <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                      Loading…
                    </div>
                  ) : (
                    <MediaSlide key={media[idx].url} m={media[idx]} />
                  )}
                </div>
              </div>

              {/* thumbs */}
              {total > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {media.map((m, i) => (
                    <button
                      key={m.url}
                      onClick={() => setIdx(i)}
                      className={`relative shrink-0 rounded-lg border ${
                        i === idx ? 'border-white/60' : 'border-white/10 hover:border-white/25'
                      } overflow-hidden`}
                      style={{ width: 72, height: 48 }}
                      aria-label={`Open media ${i + 1}`}
                    >
                      {m.type === 'image' ? (
                        <Image
                          src={m.url}
                          alt={`thumb-${i}`}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-white/80 text-xs">
                          ▶
                        </div>
                      )}
                      {i === idx && (
                        <span
                          className="absolute inset-x-0 bottom-0 h-0.5"
                          style={{ backgroundImage: accGradient }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* meta */}
            <aside className="lg:max-h-[68vh] lg:overflow-auto pr-1">
              {!!excerpt && <p className="text-white/80 leading-relaxed">{excerpt}</p>}
              {!!tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.split(',').map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="px-2.5 py-1 rounded-full text-xs text-white/80 border border-white/10"
                      style={{
                        backgroundImage:
                          'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
                      }}
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );

  // Рендерим поверх всего — через портал в body
  return id ? createPortal(modalContent, document.body) : null;
}

/* --------- один слайд с плавным появлением --------- */
function MediaSlide({ m }: { m: Media }) {
  const [loaded, setLoaded] = useState(m.type !== 'image');
  useEffect(() => setLoaded(m.type !== 'image'), [m]);

  if (m.type === 'youtube') {
    return (
      <div className="absolute inset-0">
        <iframe
          src={m.url}
          title="YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  if (m.type === 'video') {
    return (
      <video
        src={m.url}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        controls
        playsInline
      />
    );
  }

  // image
  return (
    <div className="absolute inset-0">
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
          Loading…
        </div>
      )}
      <Image
        src={m.url}
        alt="media"
        fill
        sizes="(min-width:1024px) 60vw, 100vw"
        className={`object-contain transition duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.01]'
        }`}
        onLoad={() => setLoaded(true)}
        priority
      />
    </div>
  );
}
