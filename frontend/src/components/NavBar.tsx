'use client'
const items = [
  {id:'home',label:'Главная'},
  {id:'services',label:'Услуги'},
  {id:'testimonials',label:'Отзывы'},
  {id:'about',label:'О студии'},
  {id:'contact',label:'Контакты'},
]
export default function NavBar(){
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
      <div className="glass rounded-full px-2 py-1 border border-white/10">
        <nav className="flex gap-1">
          {items.map(i=>(
            <button key={i.id}
              onClick={()=>document.getElementById(i.id)?.scrollIntoView({behavior:'smooth',block:'start'})}
              className="px-3 py-1.5 rounded-full text-sm text-neutral-200 hover:bg-white/10 transition">
              {i.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
