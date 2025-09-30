'use client';

import Image from 'next/image';
import { useMemo, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import type { RGB } from '@/types/ui';
import type { Portfolio as PortfolioItem } from '@/types/portfolio';
import PortfolioModal from './PortfolioModal';

type Props = {
  items: PortfolioItem[];
  accentFrom: RGB;
  accentTo: RGB;
  className?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const toAbs = (u?: string | null): string | null =>
  !u ? null : /^https?:\/\//i.test(u)
    ? u
    : `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

function pickCover(it: PortfolioItem): string | null {
  const gallery = (it as unknown as { gallery?: string[] | null }).gallery ?? [];
  const firstImg =
    Array.isArray(gallery) ? gallery.find((u) => !isVideo(u)) ?? null : null;

  const candidates: Array<string | null | undefined> = [
    (it as unknown as { cover_url?: string | null }).cover_url,
    (it as unknown as { preview_url?: string | null }).preview_url,
    (it as unknown as { thumbnail_url?: string | null }).thumbnail_url,
    firstImg,
  ];

  for (const c of candidates) {
    const abs = toAbs(c ?? null);
    if (abs) return abs;
  }
  return null;
}

type Vars = CSSProperties & Record<'--acc1' | '--acc2', string>;
type CardVars = CSSProperties & Record<'--cardW' | '--mx' | '--my', string>;
type WrapVars = CSSProperties & Record<'--pf-bleed', string>;

export default function ServicePortfolioGrid({
  items,
  accentFrom,
  accentTo,
  className,
}: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  const vars: Vars = useMemo(
    () => ({
      '--acc1': accentFrom.join(' '),
      '--acc2': accentTo.join(' '),
    }),
    [accentFrom, accentTo]
  );

  // «кровля»/запас для 3D-анимации у краёв вьюпорта
  const BLEED_PX = 32;
  const wrapVars: WrapVars = { '--pf-bleed': `${BLEED_PX}px` };

  return (
    <>
      {/* ВНУТРЕННИЙ ВЬЮПОРТ С BLEED */}
      <div
        className={clsx(
          // pf-wrap — контейнер-вьюпорт; НЕ меняем ширину карточек,
          // добавляем только внутреннюю «кровлю» паддингом,
          // чтобы наклон/тень не резались у левого/правого края.
          'pf-wrap relative',
          className
        )}
        style={{
          ...vars,
          ...wrapVars,
          // важное: по X у нас скролл, по Y — видим всё (не обрезаем тени)
          overflowX: 'auto',
          overflowY: 'visible',
          paddingLeft: 'var(--pf-bleed)',
          paddingRight: 'var(--pf-bleed)',
          // Safari любит маску скролла — явно отключим
          WebkitMaskImage: 'none',
        }}
      >
        {/* ТРЕК КАРТОЧЕК: отриц. маргины компенсируют bleed,
            поэтому визуально карточки стоят как раньше */}
        <div
          className="pf-track hsnap flex gap-5 md:gap-6 px-1"
          style={{
            marginLeft: 'calc(var(--pf-bleed) * -1)',
            marginRight: 'calc(var(--pf-bleed) * -1)',
          }}
        >
          {items.map((it, i) => {
            const cover = pickCover(it);
            const idNum =
              typeof it.id === 'number'
                ? it.id
                : Number(typeof it.id === 'string' ? it.id : i);

            const cardVars: CardVars = {
              '--cardW': 'clamp(260px, 30vw, 420px)', // как у тебя
              '--mx': '50%',
              '--my': '50%',
            };

            const onMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width;
              const ny = (e.clientY - r.top) / r.height;
              e.currentTarget.style.setProperty('--mx', `${(nx * 100).toFixed(2)}%`);
              e.currentTarget.style.setProperty('--my', `${(ny * 100).toFixed(2)}%`);
            };

            const resetSpot: React.PointerEventHandler<HTMLDivElement> = (e) => {
              e.currentTarget.style.setProperty('--mx', '50%');
              e.currentTarget.style.setProperty('--my', '50%');
            };

            return (
              <article
                key={(it.id ?? i).toString()}
                className={clsx(
                  'pf-card hpanel snap-center',
                  // карточка поверх соседей при ховере, чтобы ничего не перекрывало
                  'transition-[transform,box-shadow] will-change-transform'
                )}
                style={cardVars}
                onPointerMove={onMove}
                onPointerLeave={resetSpot}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.zIndex = '20')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.zIndex = '1')}
              >
                {/* неоновая обводка */}
                <span aria-hidden className="pf-ring" />

                {/* превью + спотлайт */}
                <div className="pf-cover">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={it.title ?? 'preview'}
                      fill
                      sizes="(min-width:1024px) 30vw, 92vw"
                      className="pf-img"
                    />
                  ) : (
                    <div className="pf-nopreview">no preview</div>
                  )}
                  <span aria-hidden className="pf-spot" />
                  <span aria-hidden className="pf-vignette" />
                </div>

                {/* подпись поверх превью */}
                <div className="pf-meta-on">
                  <div className="min-w-0">
                    <h3 className="pf-title">{it.title ?? 'Untitled'}</h3>
                    {'excerpt' in it && it.excerpt ? (
                      <p className="pf-sub">{(it.excerpt as string) || ''}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(idNum)}
                    className="pf-cta"
                    aria-label={`View “${it.title ?? 'item'}”`}
                  >
                    View →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <PortfolioModal id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
