import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE
})

export function setAdminHeaders(email: string, token: string) {
  api.defaults.headers.common['X-Admin-Email'] = email
  api.defaults.headers.common['X-Admin-Token'] = token
}
