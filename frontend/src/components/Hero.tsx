'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCallback } from 'react'

const marquee = [
  'Motion Design','Graphic Design','Web Design','Development',
  'Digital Printing','Branding','UI/UX Design','Posters','Flyers','Animation'
]

export default function Hero() {
  // плавная прокрутка к блоку контактов
  const goToContact = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('contact')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <section
      id="home"
      className="oc-section oc-section--flat relative px-6 md:px-16 min-h-[100svh] flex items-center"
    >
      {/* мягкие пятна */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[40vw] h-[40vw] bg-fuchsia-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-[40vw] h-[40vw] bg-sky-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] w-full mx-auto relative z-10">
        <p className="text-sm uppercase tracking-[.25em] text-white/60">
          Design × Code Studio
        </p>

        <h1 className="mt-3 text-5xl md:text-7xl font-semibold leading-[1.05]">
          OverCreate — design that<br/>ships, code that scales
        </h1>

        <p className="mt-6 text-neutral-300 max-w-2xl">
          From motion and brand identity to websites and full-stack apps —
          we turn business goals into clear interfaces, fast performance,
          and engaging visual stories.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="#services"
            className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-neutral-200"
          >
            View services
          </Link>

          {/* ведём к секции контактов */}
          <Link
            href="#contact"
            onClick={goToContact}
            className="rounded-2xl border border-white/20 px-6 py-3 font-medium hover:border-white/40"
            aria-label="Contact us"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* бренд-лента */}
      <div className="absolute -bottom-6 left-0 right-0 pointer-events-none">
        <motion.div
          className="flex gap-12 text-white/60 md:text-white/70 text-lg whitespace-nowrap will-change-transform"
          initial={{ x: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
        >
          {[...marquee, ...marquee].map((t, i) => (
            <span key={i} className="px-3 py-2 glass rounded-full border border-white/10">
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
