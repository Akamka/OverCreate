'use client'
import HoloCard from '@/components/ui/HoloCard'

type RGB = [number, number, number]
const rgb = (r:number,g:number,b:number): RGB => [r,g,b]

const items = [
  {
    slug:'motion',
    title:'Motion Design',
    desc:'Reels, animations, product motion',
    // violet 500 — #8B5CF6
    acc1: rgb(139, 92, 246), acc2: rgb(139, 92, 246),
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-90">
        <path fill="currentColor" d="M3 7h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/>
      </svg>
    ),
  },
  {
    slug:'graphic',
    title:'Graphic Design',
    desc:'Branding, posters, printing',
    // emerald 500 — #10B981
    acc1: rgb(16, 185, 129), acc2: rgb(16, 185, 129),
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-90">
        <path fill="currentColor" d="M12 2L2 7l10 5l10-5zm0 7l10 5l-10 5L2 14z"/>
      </svg>
    ),
  },
  {
    slug:'web',
    title:'Web Design',
    desc:'UI/UX, landing pages, websites',
    // blue 500 — #3B82F6
    acc1: rgb(59, 130, 246), acc2: rgb(59, 130, 246),
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-90">
        <path fill="currentColor" d="M3 4h18v4H3zm0 6h10v10H3zM15 10h6v10h-6z"/>
      </svg>
    ),
  },
  {
    slug:'dev',
    title:'Development',
    desc:'Next.js, Laravel, интеграции',
    // amber 500 — #F59E0B (тёплый оранжевый)
    acc1: rgb(245, 158, 11), acc2: rgb(245, 158, 11),
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-90">
        <path fill="currentColor" d="M8 5l-6 7l6 7v-4l-3-3l3-3zm8 14l6-7l-6-7v4l3 3l-3 3z"/>
      </svg>
    ),
  },
  {
    slug:'printing',
    title:'Digital Printing',
    desc:'Business cards, posters, outdoor ads',
    // pink 500 — #EC4899
    acc1: rgb(236, 72, 153), acc2: rgb(236, 72, 153),
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-90">
        <path fill="currentColor" d="M6 2h12v4H6zM4 7h16v7H4zM6 15h12v7H6z"/>
      </svg>
    ),
  },
]

export default function ServicesGrid(){
  return (
    <section id="services" className="oc-section px-6 md:px-16 -mt-2">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-semibold mb-8">Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(s=>(
            <HoloCard
              key={s.slug}
              href={`/services/${s.slug}`}
              title={s.title}
              desc={s.desc}
              accentFrom={s.acc1}
              accentTo={s.acc2}    
              icon={s.icon}
            >
              <div className="mt-6 hcard-cta">Learn more →</div>
            </HoloCard>
          ))}
        </div>
      </div>
    </section>
  )
}
