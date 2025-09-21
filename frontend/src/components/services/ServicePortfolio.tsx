// серверный компонент (без useState!)
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
    <section id="portfolio" className="oc-section px-6 md:px-16">
      <ServicePortfolioGrid
        items={items}
        accentFrom={accentFrom}
        accentTo={accentTo}
      />
    </section>
  )
}
