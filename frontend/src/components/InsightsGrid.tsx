// components/InsightsGrid.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type InsightItem = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  readTime: string;
  tags: string[];
  theme?: string;
};

export default function InsightsGrid({ items }: { items: InsightItem[] }) {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  const go = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <>
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

        {!items.length && (
          <div className="text-zinc-400 px-2 py-6">Nothing yet. Add a post in the admin.</div>
        )}
      </div>

{/* Pagination */}
<div className="mt-8 flex items-center justify-center gap-3 select-none">
  {/* Prev */}
  <button
    type="button"
    onClick={() => setPage((p) => Math.max(1, p - 1))}
    disabled={page === 1}
    className={[
      "group inline-flex items-center gap-2 rounded-full px-4 py-2",
      "border border-white/15 bg-white/[.06] backdrop-blur",
      "ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,.25)]",
      "transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)]",
      "hover:border-white/25 hover:bg-white/[.10] hover:translate-y-[-1px]",
      "disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
    ].join(" ")}
    aria-label="Previous page"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100">
      <polyline points="14 6 8 12 14 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="font-semibold">Prev</span>
  </button>

{/* Page indicator – clean pill with dots, no underline */}
<div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5
                border border-white/15 bg-white/[.07] backdrop-blur
                shadow-[0_8px_24px_rgba(0,0,0,.22)]">
  <span className="font-extrabold text-white/95">Page {page}</span>
  <span className="text-white/60 font-semibold">/ {totalPages}</span>

  {/* dots */}
  <div className="ml-2 flex items-center gap-1.5">
    {Array.from({ length: totalPages }).map((_, i) => {
      const active = i + 1 === page;
      return (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: active
              ? `linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))`
              : 'rgba(255,255,255,.28)',
            boxShadow: active ? '0 0 10px rgba(255,255,255,.35)' : 'none',
          }}
        />
      );
    })}
  </div>
</div>


  {/* Next */}
  <button
    type="button"
    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
    disabled={page === totalPages}
    className={[
      "group inline-flex items-center gap-2 rounded-full px-4 py-2",
      "border border-white/15 bg-white/[.06] backdrop-blur",
      "ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,.25)]",
      "transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)]",
      "hover:border-white/25 hover:bg-white/[.10] hover:translate-y-[-1px]",
      "disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed",
    ].join(" ")}
    aria-label="Next page"
  >
    <span
      className="font-extrabold bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))` }}
    >
      Next
    </span>
    <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100">
      <polyline points="10 6 16 12 10 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>

    </>
  );
}
