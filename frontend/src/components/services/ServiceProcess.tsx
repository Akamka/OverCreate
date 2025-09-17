'use client'

import { useRef, useState, type CSSProperties } from 'react'
import clsx from 'clsx'
import { Target, FlaskConical, Lightbulb, Cog, Rocket, type LucideIcon } from 'lucide-react'
import type { RGB } from '@/types/ui'

type Step = { n: string; title: string; desc: string; Icon: LucideIcon }

const STEPS: Step[] = [
  { n: '01', title: 'Бриф',         desc: 'Цели, аудитория, дедлайны',                   Icon: Target },
  { n: '02', title: 'Исследование', desc: 'Рефы, мудборды, гипотезы',                    Icon: FlaskConical },
  { n: '03', title: 'Концепт',      desc: 'Первые варианты: статика/движ',               Icon: Lightbulb },
  { n: '04', title: 'Производство', desc: 'Дизайн, анимация, интеграции',                Icon: Cog },
  { n: '05', title: 'Запуск',       desc: 'Передача исходников, поддержка и улучшения',  Icon: Rocket },
]

type Props = { accentFrom: RGB; accentTo: RGB; className?: string }
type VarKeys = '--acc1' | '--acc2' | '--p' | '--count'
type ProcessVars = CSSProperties & Record<VarKeys, string>

export default function ServiceProcess({ accentFrom, accentTo, className }: Props) {
  const [active, setActive] = useState(0)
  const resetTimer = useRef<number | null>(null)

  // сколько держим ползунок после ухода курсора
  const HOLD_MS = 900

  const clearReset = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }
  const scheduleReset = () => {
    clearReset()
    resetTimer.current = window.setTimeout(() => {
      setActive(0)
      resetTimer.current = null
    }, HOLD_MS)
  }
  const setActiveNow = (i: number) => {
    clearReset()
    setActive(i)
  }

  const p = (active / (STEPS.length - 1)) * 100
  const vars: ProcessVars = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
    '--p': `${p}%`,
    '--count': String(STEPS.length),
  }

  return (
    <section className={clsx('oc-section px-6 md:px-16 relative', className)} style={vars}>
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-white/90 text-2xl md:text-3xl font-semibold">Как мы работаем</h2>

        <div className="proc-wrap relative mt-6 md:mt-8">
          {/* Карточки */}
          <div className="proc-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className="proc-card group text-left"
                onFocus={() => setActiveNow(i)}
                onMouseEnter={() => setActiveNow(i)}
                onMouseLeave={scheduleReset}
                onBlur={scheduleReset}
              >
                <span aria-hidden className="proc-ring" />
                <div className="flex items-start justify-between">
                  <span className="proc-num">{s.n}</span>
                  <s.Icon size={18} className="opacity-80" style={{ color: 'rgb(var(--acc2))' }} />
                </div>
                <div className="mt-3">
                  <div className="text-white font-semibold">{s.title}</div>
                  <div className="proc-desc">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Трек теперь сразу под сеткой */}
          <div className="proc-track">
            <span className="proc-fill" />
            <span className="proc-runner" />
          </div>
        </div>
      </div>
    </section>
  )
}
