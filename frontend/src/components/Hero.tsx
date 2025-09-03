'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const marquee = ['Моушн-дизайн','Графический дизайн','Веб-дизайн','Разработка','Цифровая печать','Айдентика','UI/UX','Плакаты','Постеры','Анимация']

export default function Hero(){
  return (
    <section id="home" className="oc-section oc-section--flat relative px-6 md:px-16 min-h-[100svh] flex items-center">
      <div className="absolute inset-0 pointer-events-none">
        {/* мягкие пятна */}
        <div className="absolute -top-24 -left-24 w-[40vw] h-[40vw] bg-fuchsia-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-[40vw] h-[40vw] bg-sky-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] w-full mx-auto relative z-10">
        <p className="text-sm uppercase tracking-[.25em] text-white/60">Студия дизайна</p>
        <h1 className="mt-3 text-5xl md:text-7xl font-semibold leading-[1.05]">
          OverCreate — дизайн, который<br/>двигает бренд
        </h1>
        <p className="mt-6 text-neutral-300 max-w-2xl">
          Моушн, графика, веб и разработка. Мы превращаем бизнес-цели в ясные интерфейсы и живые визуальные истории.
        </p>
        <div className="mt-10 flex gap-4">
        <Link href="#services" className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-neutral-200">
            Смотреть услуги
        </Link>

        <Link href="/services/web" className="rounded-2xl border border-white/20 px-6 py-3 font-medium hover:border-white/40">
            Веб-дизайн
        </Link>
        </div>
      </div>

      {/* горизонтальная марка — «бренд-лента» */}
        <div className="absolute -bottom-6 left-0 right-0 pointer-events-none">
        <motion.div
            className="flex gap-12 text-white/60 md:text-white/70 text-lg whitespace-nowrap will-change-transform"
            initial={{ x: 0 }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
        >
            
          {[...marquee, ...marquee].map((t,i)=>(
            <span key={i} className="px-3 py-2 glass rounded-full border border-white/10">{t}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
