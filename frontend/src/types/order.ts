export type OrderPayload = {
  first_name: string
  last_name: string
  email: string
  phone: string
  message?: string
  service_type?: 'web'|'graphic'|'motion'|'dev'|'printing'
}
