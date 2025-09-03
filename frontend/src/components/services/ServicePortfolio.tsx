import Image from 'next/image'
import { fetchPortfolioByService } from '@/lib/api'
import type { CSSVars, RGB } from '@/types/ui'

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
const abs = (u?: string | null) =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${BASE}${u.startsWith('/') ? '' : '/'}${u}`

export default async function ServicePortfolio({
  service, accentFrom, accentTo,
}: { service: string; accentFrom: RGB; accentTo: RGB }) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') }
  const page = await fetchPortfolioByService(service, 1, 12, { revalidate: 60 })

  return (
    <section id="portfolio" className="oc-section px-6 md:px-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-3xl font-semibold">Портфолио</h2>
          <div className="text-white/60 text-sm">найдено: {page.total}</div>
        </div>

        {page.data.length === 0 ? (
          <div className="text-neutral-400">
            Пока пусто. Добавьте работы в админ-панели → «Портфолио» (service_type: {service}).
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {page.data.map((it) => {
              const src = abs(it.cover_url)
              return (
                <div key={it.id} className="hcard" style={vars}>
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
                      {it.excerpt && <p className="text-neutral-300 mt-1">{it.excerpt}</p>}
                      <div className="mt-3 hcard-cta">Смотреть →</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
