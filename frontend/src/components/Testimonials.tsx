'use client'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const items = [
  { name:'Елена, Orion',    text:'С OverCreate мы перезапустили сайт и визуальную систему. Итог — +37% к конверсии.' },
  { name:'Артём, Mono',     text:'Чёткий процесс и очень аккуратный UI. Рекомендуем как сильную продуктовую студию.' },
  { name:'Сергей, Zetta',   text:'Сделали motion-гайд и видео. Команда реально слышит и быстро собирает опции.' },
  { name:'Мария, Violet',   text:'Докрутили айдентику и упаковку. Теперь коммуникации стали цельными.' },
]

export default function Testimonials(){
  return (
    <section id="testimonials" className="py-20 px-6 md:px-16">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-semibold mb-10">Отзывы клиентов</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((t, i)=> <TiltCard key={i} {...t} index={i} /> )}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ name, text, index }:{name:string; text:string; index:number}){
  const x = useMotionValue(0); const y = useMotionValue(0)
  const rX = useTransform(y, [-50,50], [8,-8]); const rY = useTransform(x, [-50,50], [-8,8])

  return (
    <motion.div
      className="relative p-6 rounded-2xl glass border border-white/10"
      style={{ rotateX: rX, rotateY: rY, transformStyle:'preserve-3d' }}
      onMouseMove={(e)=>{ const b=(e.currentTarget as HTMLDivElement).getBoundingClientRect(); x.set(e.clientX - (b.left+b.width/2)); y.set(e.clientY - (b.top+b.height/2)); }}
      onMouseLeave={()=>{ x.set(0); y.set(0) }}
    >
      <div className="absolute -z-10 inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
      <div className="text-neutral-300">{text}</div>
      <div className="mt-4 text-sm text-white/60">{name}</div>

      {/* «странички» как стопка */}
      <div className="absolute inset-0 -z-20 rounded-2xl translate-x-1 translate-y-1 bg-white/5" />
      <div className="absolute inset-0 -z-30 rounded-2xl translate-x-2 translate-y-2 bg-white/5" />
    </motion.div>
  )
}
