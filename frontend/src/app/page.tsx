import type { Portfolio } from '@/types/portfolio'
import HomeClient from '@/components/HomeClient'

async function getPortfolio(): Promise<Portfolio[]>{
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
  const res  = await fetch(`${base}/api/portfolio?per_page=12&published=true`, { cache:'no-store' })
  if(!res.ok) return []
  const json = await res.json()
  return json?.data ?? []
}

export default async function Page(){
  const items = await getPortfolio()
  return <HomeClient items={items}/>
}
