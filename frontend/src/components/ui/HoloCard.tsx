'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import type { CSSVars } from '@/types/ui'

type RGB = [number, number, number]

type Props = {
  href?: string
  title: string
  desc?: string
  accentFrom?: RGB
  accentTo?: RGB
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/** clamp helper */
const clamp = (v:number, min:number, max:number) => Math.max(min, Math.min(max, v))

export default function HoloCard({
  href,
  title,
  desc,
  accentFrom = [56,189,248],
  accentTo   = [168,85,247],
  icon,
  className,
  children,
}: Props){
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // состояние для rAF-инерции
  const state = useRef({
    w: 0, h: 0,
    // target and current offsets (px from center)
    tx: 0, ty: 0, cx: 0, cy: 0,
    // target and current shine in %
    mx: 50, my: 50, sx: 50, sy: 50,
    running: false,
  })

  // запуск/стоп анимации
  const start = () => {
    if (state.current.running) return
    state.current.running = true
    loop()
  }
  const stop = () => { state.current.running = false }

  const loop = () => {
    if (!state.current.running) return
    const el = cardRef.current
    if (!el) return

    const s = state.current
    // было 0.14 / 0.18 → стало чуть медленнее и ровнее
    s.cx += (s.tx - s.cx) * 0.12
    s.cy += (s.ty - s.cy) * 0.12
    s.sx += (s.mx - s.sx) * 0.16
    s.sy += (s.my - s.sy) * 0.16

    // max-угол меньше (более «дорогое» поведение)
    const rx = clamp(-(s.cy / (s.h || 1)) * 9,  -7, 7)
    const ry = clamp( (s.cx / (s.w || 1)) * 9,  -7, 7)

    el.style.setProperty('--dx', `${s.cx.toFixed(2)}px`)
    el.style.setProperty('--dy', `${s.cy.toFixed(2)}px`)
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    el.style.setProperty('--mx', `${s.sx.toFixed(2)}%`)
    el.style.setProperty('--my', `${s.sy.toFixed(2)}%`)

    requestAnimationFrame(loop)
  }

  // события
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = e.currentTarget
    const r = wrap.getBoundingClientRect()
    state.current.w = r.width
    state.current.h = r.height

    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top  + r.height / 2)
    const mx = ((e.clientX - r.left) / r.width)  * 100
    const my = ((e.clientY - r.top)  / r.height) * 100

    state.current.tx = dx
    state.current.ty = dy
    state.current.mx = mx
    state.current.my = my

    start()
  }

  const onPointerLeave = () => {
    // отпускаем к центру
    state.current.tx = 0
    state.current.ty = 0
    state.current.mx = 50
    state.current.my = 50
    // догоним до покоя и затем остановим
    setTimeout(() => stop(), 300)
  }

  const onPointerDown = () => cardRef.current?.classList.add('hcard-pressed')
  const onPointerUp   = () => cardRef.current?.classList.remove('hcard-pressed')

  // cleanup при размонтаже
  useEffect(() => () => stop(), [])

  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') }

  const Content = (
    <div
      ref={rootRef}
      className={clsx('hcard3d', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div ref={cardRef} className="hcard" style={vars}>
        <div className="hcard-body p-6 relative">
          {/* декоративные слои */}
          <div className="hcard-engrave" />
          <div className="hcard-shard a" />
          <div className="hcard-shard b" />
          <div className="hcard-shine" />
          <div className="hcard-chip" />

          {/* контент (слои с глубиной) */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 hcard-layer hcard-ico">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="hcard-title text-lg hcard-layer hcard-ttl">{title}</div>
            </div>
            {desc && <div className="hcard-desc mt-2 hcard-layer hcard-dsc">{desc}</div>}
            {children && <div className="mt-6 hcard-cta hcard-layer">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  )

  return href ? (
    <Link href={href} className="block will-change-transform">
      {Content}
    </Link>
  ) : Content
}
