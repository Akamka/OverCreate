'use client'

import Link from 'next/link'
import { Check, Crown, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useRef, useState } from 'react'

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
 * Сохраняем твои орбиты + ripple.
 * Добавляем: градиентную неоновую обводку по контуру, лёгкий lift карточки и
 * мягкий spotlight за курсором. Кнопка — легкий подъём.
 */
export default function PricingCard({ tier, accentFrom, accentTo, className }: Props) {
  const vars: Record<string, string> = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
  }

  const hasCta = Boolean(tier.ctaHref)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [rippleKey, setRippleKey] = useState(0)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = bodyRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height

    // позиция курсора для spotlight/ripple
    el.style.setProperty('--mx', `${(nx * 100).toFixed(2)}%`)
    el.style.setProperty('--my', `${(ny * 100).toFixed(2)}%`)

    // лёгкий сдвиг центра орбит
    const gx = (nx - 0.5) * 22
    const gy = (ny - 0.5) * 14
    el.style.setProperty('--gx', `${gx.toFixed(2)}px`)
    el.style.setProperty('--gy', `${gy.toFixed(2)}px`)
  }

  const onLeave = () => {
    const el = bodyRef.current
    if (!el) return
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '50%')
    el.style.setProperty('--gx', '0px')
    el.style.setProperty('--gy', '0px')
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onMove(e) // зафиксируем точку клика
    setRippleKey((k) => k + 1)
  }

  return (
    <div className={clsx('relative hcard hcard3d group', className)} style={vars}>
      <div
        ref={bodyRef}
        className="hcard-body relative p-7 md:p-8 overflow-visible min-h-[360px] prc-card"
        onPointerEnter={onMove}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
      >
        <div className="hcard-engrave" />
        <div className="hcard-shine" />

        {/* Неоновая рамка по контуру и мягкий спотлайт за курсором */}
        <span aria-hidden className="prc-ring" />
        <span aria-hidden className="prc-spot" />

        {/* === FX-оверлеи: твои орбиты + ripple === */}
        <div aria-hidden className="pcx-layers">
          <div className="pcx-orbits">
            <div className="pcx-orbit a" />
            <div className="pcx-orbit b" />
            <div className="pcx-orbit c" />
          </div>
          <div key={rippleKey} className="pcx-ripple" />
        </div>

        {/* Фоновые пятна/кольцо — как было */}
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 -inset-[20%] blur-[80px] opacity-20"
          style={{
            background: `
              radial-gradient(38% 34% at 18% 26%, rgb(var(--acc1) / .45), transparent 60%),
              radial-gradient(34% 34% at 82% 20%, rgb(var(--acc2) / .45), transparent 62%)
            `,
          }}
        />
        <div
          aria-hidden
          className="absolute -z-10 -right-10 -top-10 w-[260px] h-[260px] rounded-full opacity-24 blur-lg"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, rgb(var(--acc1)), rgb(var(--acc2)), rgb(var(--acc1)))',
            mask: 'radial-gradient(closest-side, transparent 58%, #000 59%)',
            WebkitMask: 'radial-gradient(closest-side, transparent 58%, #000 59%)',
            filter: 'saturate(112%)',
          }}
        />

        {tier.popular && (
          <div className="absolute top-3 right-4 z-20">
            <span className="recommend-badge inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold tracking-wide shadow-md">
              <Crown size={14} className="opacity-90" />
              Рекомендуем
            </span>
          </div>
        )}

        {/* Контент (без изменений) */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="opacity-90" style={{ color: 'rgb(var(--acc2))' }} />
            <h3 className="hcard-title text-lg">{tier.name}</h3>
          </div>

          <div className="mt-3">
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.5)]">
              {tier.price}
            </div>
            {tier.period && <div className="mt-1 text-sm text-white/60">/ {tier.period}</div>}
            {tier.note && <div className="mt-1 text-xs text-white/45">{tier.note}</div>}
          </div>

          <ul className="mt-5 space-y-2">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.95rem] text-white/85">
                <Check size={16} className="mt-[2px] shrink-0" style={{ color: 'rgb(var(--acc1))' }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {hasCta ? (
              <Link
                href={tier.ctaHref!}
                className="btn-elev inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-black"
                style={{ background: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
              >
                {tier.ctaLabel ?? 'Оставить заявку'}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-xl px-4 py-2 text-sm text-white/55 border border-white/10">
                Свяжитесь с нами
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
