import { fetchPortfolioByService } from '@/lib/api'
import type { RGB } from '@/types/ui'
import type { Portfolio as PortfolioItem } from '@/types/portfolio'
import ServicePortfolioGrid from './ServicePortfolioGrid'

export default async function ServicePortfolio({
  service,
  accentFrom,
  accentTo,
}: { service: string; accentFrom: RGB; accentTo: RGB }) {
  const page = await fetchPortfolioByService(service, 1, 12, { revalidate: 60 })
  const items = page.data as PortfolioItem[]

  return (
    <section id="portfolio" className="oc-section px-6 md:px-16 section-soft">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Portfolio</h2>
          <p className="mt-1 text-white/60 text-sm">
            Selected work — {items.length} item{items.length === 1 ? '' : 's'}
          </p>
        </div>

        <ServicePortfolioGrid
          items={items}
          accentFrom={accentFrom}
          accentTo={accentTo}
        />
      </div>
    </section>
  )
}
