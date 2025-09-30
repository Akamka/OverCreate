'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { fetchPortfolioItem } from '@/lib/api';
import type { Portfolio } from '@/types/portfolio';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const toAbs = (u?: string | null): string | null =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

/* ---------- helpers без any ---------- */
type AnyObj = Record<string, unknown>;

function getStrProp(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === 'object') {
    const v = (obj as AnyObj)[key];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

function getGallery(obj: unknown): string[] {
  if (obj && typeof obj === 'object') {
    const v = (obj as AnyObj)['gallery'];
    if (Array.isArray(v)) {
      return v.filter((x): x is string => typeof x === 'string');
    }
  }
  return [];
}

type Media = { url: string; type: 'image' | 'video' };

export default function PortfolioModal({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const [item, setItem] = useState<Portfolio | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* fetch */
  useEffect(() => {
    if (!id) return;
    setItem(null);
    setErr(null);
    setIdx(0);
    fetchPortfolioItem(id)
      .then((data) => setItem(data))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [id]);

  /* строим медиа-лист */
  const media: Media[] = useMemo(() => {
    if (!item) return [];
    const uniq = new Set<string>();

    const pushMaybe = (u?: string | null) => {
      const abs = toAbs(u ?? null);
      if (!abs || uniq.has(abs)) return;
      uniq.add(abs);
    };

    pushMaybe(getStrProp(item, 'cover_url'));
    pushMaybe(getStrProp(item, 'preview_url'));
    pushMaybe(getStrProp(item, 'thumbnail_url'));

    const gal = getGallery(item);
    gal.forEach((u) => pushMaybe(u));

    return Array.from(uniq).map((u) => ({
      url: u,
      type: isVideo(u) ? 'video' : 'image',
    }));
  }, [item]);

  const total = media.length;

  /* Блокировка скролла без «скачка» страницы */
  useEffect(() => {
    if (!id) return;
    const body = document.body;
    const y = window.scrollY;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      // возвращаемся туда же
      window.scrollTo(0, y);
    };
  }, [id]);

  /* esc / arrows / фокус */
  useEffect(() => {
    if (!id) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* свайпы по viewer (оставляем — без стрелок поверх изображения) */
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
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = useCallback(() => {
    if (!total) return;
    setIdx((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (!total) return;
    setIdx((i) => (i - 1 + total) % total);
  }, [total]);

  if (!id) return null;

  const title = (item?.title as unknown as string) || 'Loading…';
  const excerpt = getStrProp(item as unknown, 'excerpt');
  const tags = getStrProp(item as unknown, 'tags');

  const accGradient =
    'linear-gradient(135deg, rgb(var(--acc1, 255 255 255)), rgb(var(--acc2, 170 170 170)))';

  return (
    <div
      className="fixed inset-0 z-[999] grid place-items-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      ref={dialogRef}
      tabIndex={-1}
    >
      {/* затемнение */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* карточка модалки */}
      <div
        className="relative w-full max-w-6xl max-h[90vh] max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-950/85 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header + стрелки (только тут!) */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <h3 className="text-white/95 font-semibold text-base sm:text-lg truncate">{title}</h3>
            <div className="text-xs text-white/50">
              {total ? `${idx + 1} / ${total}` : '—'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous"
              className="inline-grid place-items-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-95 transition"
              style={{ color: 'transparent', backgroundImage: accGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="inline-grid place-items-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 active:scale-95 transition"
              style={{ color: 'transparent', backgroundImage: accGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
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

        {/* content (прокручиваемая при нехватке места) */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-4 sm:gap-5 p-4 sm:p-6">
            {/* viewer — без стрелок на самом изображении */}
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
}

/* --------- один слайд с плавным появлением --------- */
function MediaSlide({ m }: { m: Media }) {
  const [loaded, setLoaded] = useState(m.type === 'video');
  useEffect(() => setLoaded(m.type === 'video'), [m]);

  return (
    <div className="absolute inset-0">
      {m.type === 'image' ? (
        <>
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
        </>
      ) : (
        <video
          src={m.url}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          controls
          playsInline
        />
      )}
    </div>
  );
}
