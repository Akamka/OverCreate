'use client'

import type { CSSVars, RGB } from '@/types/ui'
import { useCallback } from 'react'

const data: [string, string][] = [
  ['Сколько длится проект?', 'Обычно 5–14 дней: черновики за 2–3 дня, затем итерации и финал.'],
  ['В каких форматах сдаёте?', 'MP4/WebM, GIF для соцсетей, исходники After Effects/Figma по запросу.'],
  ['Можете работать по бренду/гайду?', 'Да. Настраиваем motion под существующую айдентику или быстро собираем микро-гайд.'],
  ['Как строится процесс?', 'Бриф → референсы → 1–2 концепта → согласование → продакшен → экспорт и хэнд-офф.'],
]

export default function ServiceFAQ({
  accentFrom,
  accentTo,
}: { accentFrom: RGB; accentTo: RGB }) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') }

  // Магнитный спотлайт — записываем координаты ховера в CSS-переменные элемента
  const trackPointer = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    el.style.setProperty('--mx', `${x.toFixed(2)}%`)
    el.style.setProperty('--my', `${y.toFixed(2)}%`)
  }, [])

  const resetPointer = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
  }, [])

  return (
    <section className="oc-section" style={vars}>
      <div className="max-w-[1000px] mx-auto px-5 md:px-8">
        <p className="text-sm text-white/50">FAQ</p>
        <h2 className="mt-1 text-3xl md:text-4xl font-semibold">Частые вопросы</h2>

        <div className="faq-list mt-6 rounded-2xl border border-white/10 overflow-hidden">
          {data.map(([q, a], i) => (
            <details key={i} className="group faq-item">
              <summary
                className="faq-summary cursor-pointer list-none px-5 md:px-6 py-4 md:py-5 flex items-center justify-between gap-4"
                onPointerMove={trackPointer}
                onPointerLeave={resetPointer}
              >
                <div className="flex-1 font-medium">{q}</div>

                {/* порядковый + «стрелка» */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="inline-block px-2 py-1 text-xs rounded-full border"
                    style={{
                      borderColor: 'rgb(var(--acc2) / .35)',
                      color: 'rgb(var(--acc2))',
                    }}
                  >
                    {i + 1}
                  </span>
                  <svg
                    className="faq-chevron transition-transform duration-300 opacity-80"
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </summary>

              {/* Панель с плавным раскрытием (grid-hack) */}
              <div className="faq-panel grid grid-rows-[0fr] transition-[grid-template-rows] duration-400 ease-out">
                <div className="faq-inner overflow-hidden">
                  <div className="px-5 md:px-6 pb-5 text-white/75">{a}</div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
