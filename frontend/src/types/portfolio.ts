export type Portfolio = {
  id: number
  title: string
  slug: string
  service_type: string
  cover_url?: string | null
  gallery?: string[] | null
  client?: string | null
  tags?: string | null
  excerpt?: string | null
  body?: string | null
  is_published: boolean
  is_featured: boolean
  sort_order: number
  meta_title?: string | null
  meta_description?: string | null
  created_at: string
}
