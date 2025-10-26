'use client'

import * as React from 'react'
import Image from 'next/image'

type Testimonial = {
  text: string
  author: string
  role: string
  avatar: string
}

const ALL: Testimonial[] = [
  { text: 'OverCreate combined motion, brand and engineering into one consistent story. Clear process, clean UI — zero chaos.', author: 'Alex Johnson', role: 'Product Lead, Helix', avatar: '/avatars/Alex-Johnson.jpg' },
  { text: 'We shipped a full redesign in weeks. Fast feedback loops, thoughtful decisions, strong craft.', author: 'Maria Chen', role: 'Marketing Director, Nova', avatar: '/avatars/Maria-Chen.jpg' },
  { text: 'Design language, component system and code quality — everything aligned. Launch day was boring (the best kind).', author: 'Igor Petrov', role: 'Founder, Loop', avatar: '/avatars/Igor-Petrov.jpg' },
  { text: 'Great communication and clear milestones. Modern stack, smooth delivery, zero headaches.', author: 'Jamie Lee', role: 'CEO, Orbit', avatar: '/avatars/Jamie-Lee.jpg' },
  { text: 'Pixel-perfect visuals, performance is tight, codebase is clean. Team you can trust.', author: 'Nora White', role: 'COO, Finch', avatar: '/avatars/Nora-White.jpg' },
  { text: 'Fast iterations and high attention to detail. Strong partners for long-term projects.', author: 'David Ruiz', role: 'Head of Product, Lumen', avatar: '/avatars/David-Ruiz.jpg' },
  { text: 'Great synergy between design and development. Hand-off is painless, docs are tidy.', author: 'Greg Berg', role: 'CTO, Beacon', avatar: '/avatars/Greg-Berg.jpg' },
  { text: 'From brief to launch — clear, fast, reliable. Highly recommend.', author: 'Olivia Park', role: 'Design Lead, Colect', avatar: '/avatars/Olivia-Park.jpg' },
  { text: 'Clear communication, quick iterations, and a solid design system. Shipping with confidence became our default.', author: 'Sara Collins', role: 'Product Manager, Kite', avatar: '/avatars/Sara-Collins.jpg' },
  { text: 'From rough idea to polished launch in record time. The team was proactive and detail-oriented throughout.', author: 'Michael Young', role: 'Founder, Flux', avatar: '/avatars/Michael-Young.jpg' },
  { text: 'Performance, accessibility, and visual quality — all first-class. We finally look like the product we are.', author: 'Liam Turner', role: 'CTO, Beacon Labs', avatar: '/avatars/Liam-Turner.jpg' },
  { text: 'Every milestone was hit on time. Transparent planning and zero last-minute chaos.', author: 'Daniel Kim', role: 'Operations Lead, Lumen', avatar: '/avatars/Daniel-Kim.jpg' },
  { text: 'They elevated our product with thoughtful motion. Subtle, purposeful, and performant.', author: 'Ava Morales', role: 'Design Lead, Hubble', avatar: '/avatars/Ava-Morales.jpg' },
]

/* ============== helpers ============== */
// Разбиваем ALL на N рядов без пересечений
function splitIntoRows<T>(items: T[], rows: number): T[][] {
  const out: T[][] = Array.from({ length: rows }, () => [])
  items.forEach((it, i) => {
    out[i % rows].push(it)
  })
  return out
}

/* ============== Card ============== */
function Card({ t }: { t: Testimonial }) {
  return (
    <article
      data-card
      className={[
        'relative z-0 w-[520px] max-w-full rounded-3xl border border-white/10 bg-white/[.035] backdrop-blur-sm',
        'px-6 py-5 md:px-7 md:py-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,.55)]',
        'transition-all duration-[400ms] hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,.8)] group'
      ].join(' ')}
      style={{
        backgroundImage:
          'radial-gradient(120% 60% at 50% -20%, rgba(255,255,255,.06), transparent 60%)',
      }}
    >
      <p className="relative z-10 pr-2 text-white/85">
        <span className="mr-2 text-xl align-text-top text-white/50">“</span>
        {t.text}
        <span className="ml-2 text-xl align-text-top text-white/50">”</span>
      </p>
      <div className="relative z-10 mt-5 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15">
          <Image
            src={t.avatar}
            alt={t.author}
            width={40}
            height={40}
            sizes="40px"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="leading-tight">
          <div className="font-medium text-white">{t.author}</div>
          <div className="text-xs text-white/60">{t.role}</div>
        </div>
      </div>
    </article>
  )
}

/* ============== MarqueeRow ============== */
function MarqueeRow({
  items,
  speed = 40,
  reverse = false,
  gap = 24,
}: {
  items: Testimonial[]
  speed?: number
  reverse?: boolean
  gap?: number
}) {
  const railRef = React.useRef<HTMLDivElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  const [unitW, setUnitW] = React.useState(0)
  const [cardW, setCardW] = React.useState(0)
  const [wrapW, setWrapW] = React.useState(0)
  const [visible, setVisible] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)

  // Видимость
  React.useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (wrapRef.current) io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  // Reduce motion
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Замеры
  React.useEffect(() => {
    const wrap = wrapRef.current
    const firstCard = railRef.current?.querySelector('[data-card]') as HTMLElement | null
    if (!wrap || !firstCard) return

    const measure = () => {
      setWrapW(wrap.clientWidth)
      setCardW(firstCard.offsetWidth)
    }

    const roWrap = new ResizeObserver(measure)
    const roCard = new ResizeObserver(measure)
    roWrap.observe(wrap)
    roCard.observe(firstCard)
    measure()

    return () => {
      roWrap.disconnect()
      roCard.disconnect()
    }
  }, [])

  React.useEffect(() => {
    const group = railRef.current?.firstElementChild as HTMLElement | null
    if (!group) return
    const ro = new ResizeObserver(() => setUnitW(group.scrollWidth))
    ro.observe(group)
    setUnitW(group.scrollWidth)
    return () => ro.disconnect()
  }, [])

  // Анимация
  React.useEffect(() => {
    if (reduced || !visible) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const rail = railRef.current
      if (!rail || !unitW) {
        raf = requestAnimationFrame(tick)
        return
      }
      const dt = (t - start) / 1000
      const dist = (dt * speed) % unitW
      const offset = reverse ? unitW - dist : dist
      rail.style.transform = `translate3d(${-offset}px,0,0)`
      if (!document.hidden && visible) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed, reverse, unitW, visible, reduced])

  // Вторая группа начинается не с начала, а после видимого окна
  const perScreen = cardW ? Math.max(1, Math.ceil((wrapW + gap) / (cardW + gap))) : 1
  const offset = Math.min(items.length - 1, perScreen)

  const rotate = <T,>(arr: T[], by: number) => {
    const n = arr.length
    const k = ((by % n) + n) % n
    return [...arr.slice(k), ...arr.slice(0, k)]
  }
  const shifted = rotate(items, offset)

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden py-6"
      style={{
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%)',
        maskImage:
          'linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%)',
      }}
    >
      <div
        ref={railRef}
        className="flex will-change-transform"
        style={{ columnGap: `${gap}px` }}
      >
        {/* группа A */}
        <div className="flex shrink-0" style={{ columnGap: `${gap}px` }}>
          {items.map((t) => (
            <Card key={`a-${t.author}`} t={t} />
          ))}
        </div>

        {/* группа B со сдвигом — для бесшовности */}
        <div className="flex shrink-0" style={{ columnGap: `${gap}px` }} aria-hidden="true">
          {shifted.map((t) => (
            <Card key={`b-${t.author}`} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============== Section ============== */
export default function Testimonials() {
  // делим ALL на 3 независимых ряда без пересечений
  const [row1, row2, row3] = splitIntoRows(ALL, 3)

  return (
    <section
      id="testimonials"
      className="oc-section oc-section--flat px-6 md:px-16 py-16"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-white">
          What clients say
        </h2>
        <p className="mt-2 text-white/65">
          A small selection of feedback from teams we helped ship and grow.
        </p>

        <div className="mt-8 space-y-6">
          <MarqueeRow items={row1} speed={45} />
          <MarqueeRow items={row2} reverse speed={55} />
          <MarqueeRow items={row3} speed={40} />
        </div>
      </div>
    </section>
  )
}
