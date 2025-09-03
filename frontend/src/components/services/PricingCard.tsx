'use client'

import Link from 'next/link'
import { Check, Stars, Crown } from 'lucide-react'
import clsx from 'clsx'

export type RGB = [number, number, number]

export type PricingTier = {
  name: string
  price: string
  period?: string
  features: string[]
  ctaLabel?: string
  ctaHref?: string
  popular?: boolean
  note?: string
}

type Props = {
  tier: PricingTier
  accentFrom: RGB
  accentTo: RGB
  className?: string
}

/**
 * Премиальная карточка тарифа на базе вашей .hcard
 * — мягкое голографическое кольцо, стекло, блик,
 * — бейдж “Рекомендуем”, аккуратные чек-списки.
 */
export default function PricingCard({ tier, accentFrom, accentTo, className }: Props) {
  const vars = {
    ['--acc1' as any]: accentFrom.join(' '),
    ['--acc2' as any]: accentTo.join(' '),
  }

  return (
    <div className={clsx('hcard hcard3d', className)} style={vars}>
      <div className="hcard-body p-6 md:p-7 relative">
        {/* декор */}
        <div className="hcard-engrave" />
        <div className="hcard-shard a" />
        <div className="hcard-shard b" />
        <div className="hcard-shine" />
        <div className="hcard-chip" />

        {/* бейдж популярного тарифа */}
        {tier.popular && (
          <div className="absolute -top-3 left-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <Crown size={14} className="text-yellow-300" />
              Рекомендуем
            </span>
          </div>
        )}

        {/* заголовок + цена */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 hcard-layer hcard-ico">
            <Stars className="text-white/70" size={18} />
            <h3 className="hcard-title text-lg">{tier.name}</h3>
          </div>

          <div className="mt-4 hcard-layer hcard-ttl">
            <div className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                {tier.price}
              </span>
              {tier.period && (
                <span className="ml-2 align-middle text-base text-white/50">
                  / {tier.period}
                </span>
              )}
            </div>
            {tier.note && (
              <div className="mt-1 text-xs text-white/45">{tier.note}</div>
            )}
          </div>

          {/* фичи */}
          <ul className="mt-5 space-y-2 hcard-layer hcard-dsc">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.95rem] text-white/85">
                <Check size={16} className="mt-[2px] text-emerald-300/90 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {tier.ctaHref && (
            <div className="mt-6 hcard-layer hcard-cta">
              <Link
                href={tier.ctaHref}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
              >
                {tier.ctaLabel ?? 'Оставить заявку'}
              </Link>
            </div>
          )}
        </div>

        {/* лёгкий сканлайн на ховере */}
        <div className="hcard-scan" />
      </div>
    </div>
  )
}
