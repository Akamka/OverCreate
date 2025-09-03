export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export async function fetchPortfolioByService(
  service: string,
  page = 1,
  perPage = 12,
  { revalidate = 60 }: { revalidate?: number } = {}
) {
  const url = new URL(`${BASE}/api/portfolio`)
  url.searchParams.set('service_type', service)
  url.searchParams.set('is_published', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(perPage))

  const res = await fetch(url.toString(), { next: { revalidate } })
  if (!res.ok) throw new Error('Failed to load portfolio')
  return (await res.json()) as Paginated<Portfolio>
}

export type Portfolio = {
  id: number
  title: string
  service_type: string
  cover_url?: string | null
  excerpt?: string | null
  is_published: boolean
  created_at?: string
}
