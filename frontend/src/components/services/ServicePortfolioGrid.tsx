'use client'

import { useState, type CSSProperties } from 'react'
import Image from 'next/image'
import type { Portfolio as PortfolioItem } from '@/types/portfolio'
import type { RGB } from '@/types/ui'
import PortfolioModal from './PortfolioModal'

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
const abs = (u?: string | null) =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${BASE}${u.startsWith('/') ? '' : '/'}${u}`

export default function ServicePortfolioGrid({
  items,
  accentFrom,
  accentTo,
}: {
  items: PortfolioItem[]
  accentFrom: RGB
  accentTo: RGB
}) {
  const [openId, setOpenId] = useState<number | null>(null)
    const vars: React.CSSProperties & { ['--acc1']?: string; ['--acc2']?: string } = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
}


  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-3xl font-semibold">Портфолио</h2>
        <div className="text-white/60 text-sm">найдено: {items.length}</div>
      </div>

      {items.length === 0 ? (
        <div className="text-neutral-400">
          Пока пусто. Добавьте работы в админ-панели.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const src = abs(it.cover_url)
            return (
              <button
                type="button"
                onClick={() => setOpenId(it.id)}
                key={it.id}
                className="hcard text-left"
                style={vars}
              >
                <div className="hcard-body p-0 overflow-hidden">
                  <div className="relative aspect-[4/3] w-full">
                    {src ? (
                      <Image
                        src={src}
                        alt={it.title}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-white/40">
                        no cover
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="hcard-title">{it.title}</div>
                    {it.excerpt && (
                      <p className="text-neutral-300 mt-1">{it.excerpt}</p>
                    )}
                    <div className="mt-3 hcard-cta">Смотреть →</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* модалка материалов */}
      <PortfolioModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
