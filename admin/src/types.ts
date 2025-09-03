export type Portfolio = {
  id?: number
  title: string
  slug?: string
  service_type: string
  cover_url?: string
  gallery?: string[]
  client?: string
  tags?: string
  excerpt?: string
  body?: string
  is_published?: boolean
  is_featured?: boolean
  sort_order?: number
  meta_title?: string
  meta_description?: string
}
