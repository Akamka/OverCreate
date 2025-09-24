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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const toAbs = (u?: string | null): string | null =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

function pickCover(it: PortfolioItem): string | null {
  const gallery = (it as unknown as { gallery?: string[] | null }).gallery ?? [];
  const firstImg = Array.isArray(gallery) ? gallery.find((u) => !isVideo(u)) ?? null : null;

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

  return (
    <>
      <div
        className={clsx(
          'pf-wrap hsnap flex gap-5 md:gap-6 overflow-x-auto px-1',
          className
        )}
        style={vars}
      >
        {items.map((it, i) => {
          const cover = pickCover(it);
          const idNum =
            typeof it.id === 'number'
              ? it.id
              : Number(typeof it.id === 'string' ? it.id : i);

          const cardVars: CardVars = {
            // компактнее: 2–3 в ряд
            '--cardW': 'clamp(260px, 30vw, 420px)',
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
              className="pf-card hpanel snap-center"
              style={cardVars}
              onPointerMove={onMove}
              onPointerLeave={resetSpot}
            >
              {/* неоновая обводка */}
              <span aria-hidden className="pf-ring" />

              {/* обложка + спотлайт */}
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
                {/* деликатная виньетка для читаемости подписи */}
                <span aria-hidden className="pf-vignette" />
              </div>

              {/* подпись на самом превью */}
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

      <PortfolioModal id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
