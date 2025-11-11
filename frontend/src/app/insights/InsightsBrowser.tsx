'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';

export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;      // ISO YYYY-MM-DD
  readTime: string;  // "6 min"
  tags: string[];
  theme?: 'service-web' | 'service-motion' | 'service-graphic' | 'service-dev' | 'service-printing' | string;
};

// красивый лейбл для темы
const THEME_LABEL: Record<string, string> = {
  'service-web': 'Web',
  'service-motion': 'Motion',
  'service-graphic': 'Graphic',
  'service-dev': 'Dev',
  'service-printing': 'Printing',
};

function themeLabel(t?: string) {
  return THEME_LABEL[t ?? ''] ?? (t ? t.replace('service-', '') : 'All');
}

export default function InsightsBrowser({
  insights,
  perPage = 6,
  scrollTargetId = 'all',
}: {
  insights: Insight[];
  perPage?: number;
  scrollTargetId?: string;
}) {
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // соберём список тем из данных
  const themes = useMemo(() => {
    const s = new Set<string>();
    for (const it of insights) if (it.theme) s.add(it.theme);
    return ['all', ...Array.from(s)];
  }, [insights]);

  // применим фильтр
  const filtered = useMemo(
    () => (filter === 'all' ? insights : insights.filter(i => i.theme === filter)),
    [insights, filter]
  );

  // пересчитываем страницы
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * perPage;
  const pageItems = filtered.slice(sliceStart, sliceStart + perPage);

  useEffect(() => { setPage(1); }, [filter]); // при смене фильтра — на первую страницу

  // плавная прокрутка к началу секции «All notes» при смене страницы
  const smoothJump = () => {
    const el = document.getElementById(scrollTargetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toPrev = () => { if (safePage > 1) { setPage(safePage - 1); smoothJump(); } };
  const toNext = () => { if (safePage < totalPages) { setPage(safePage + 1); smoothJump(); } };

  return (
    <div className="space-y-5">
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2">
        {themes.map(t => {
          const active = filter === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-semibold transition-all',
                'border backdrop-blur',
                active
                  ? 'text-white border-white/25 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,.28)]'
                  : 'text-white/75 border-white/12 bg-white/5 hover:text-white hover:border-white/20',
              ].join(' ')}
              style={active ? {
                backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))',
                borderColor: 'rgba(255,255,255,.22)',
              } : undefined}
            >
              {t === 'all' ? 'All' : themeLabel(t)}
            </button>
          );
        })}
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((it) => {
          const cover = it.cover || '/placeholder/cover.jpg';
          return (
            <article key={it.slug} className={`hlx-card ${it.theme ?? ''}`}>
              <div className="hlx-fx"><div className="hlx-spot" /></div>

              <div className="rounded-xl overflow-hidden mb-3 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="w-full h-[180px] object-cover" loading="lazy" />
              </div>

              <h3 className="font-semibold leading-tight">{it.title}</h3>
              <p className="hlx-desc">{it.excerpt}</p>

              <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-zinc-400">
                {!!it.date && <span className="chip">{it.date}</span>}
                <span className="chip">{it.readTime}</span>
                {it.tags.slice(0, 2).map((t) => (<span key={t} className="chip">{t}</span>))}
              </div>

              <div className="ins-card__cta">
                <Link href={`/insights/${it.slug}`} className="btn-acc btn-acc-primary">Read note</Link>
              </div>
            </article>
          );
        })}

        {!pageItems.length && (
          <div className="text-zinc-400 px-2 py-6">Nothing here yet for this filter.</div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={toPrev}
            disabled={safePage === 1}
            className={[
              'px-4 h-10 rounded-full font-semibold',
              'border border-white/14 bg-white/5 backdrop-blur',
              'text-white/85 hover:text-white hover:border-white/22',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all shadow-[0_8px_24px_rgba(0,0,0,.22)]',
            ].join(' ')}
          >
            Prev
          </button>

          {/* красивый индикатор страницы */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 h-10 border border-white/15 bg-white/7 backdrop-blur shadow-[0_8px_24px_rgba(0,0,0,.22)]"
          >
            <span className="font-extrabold text-white/95">Page {safePage}</span>
            <span className="text-white/60 font-semibold">/ {totalPages}</span>
            <div className="ml-2 flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const active = i + 1 === safePage;
                return (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: active
                        ? 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))'
                        : 'rgba(255,255,255,.28)',
                      boxShadow: active ? '0 0 10px rgba(255,255,255,.35)' : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={toNext}
            disabled={safePage === totalPages}
            className={[
              'px-4 h-10 rounded-full font-semibold',
              'border border-white/14 bg-white/5 backdrop-blur',
              'text-white/85 hover:text-white hover:border-white/22',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all shadow-[0_8px_24px_rgba(0,0,0,.22)]',
            ].join(' ')}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
