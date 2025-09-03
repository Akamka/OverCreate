'use client'

import NavBar from '@/components/NavBar'
import Hero from '@/components/Hero'
import ServicesGrid from '@/components/ServicesGrid'
import Testimonials from '@/components/Testimonials'
import OrderForm from '@/components/OrderForm'
import type { Portfolio } from '@/types/portfolio'

export default function HomeClient({ items }: { items: Portfolio[] }){
  return (
    <main className="relative z-10">
      <NavBar />
      <Hero />
      <ServicesGrid />

      {/* блок "О студии" */}
      <section id="about" className="py-20 px-6 md:px-16">
        <div className="max-w-[1200px] w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold">OverCreate — студия дизайна</h2>
            <p className="mt-4 text-neutral-300">
              Мы ценим ясный визуальный язык и точные детали. Работаем гибко, быстро и прозрачно, не жертвуя качеством.
              Используем современный стек: Next.js, Laravel, Docker. Публикуем проекты без боли.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              {[
                ['6+','лет опыта'], ['120+','выпущенных макетов'],
                ['40+','брендов'], ['∞','итераций, если нужно'],
              ].map(([n,t])=>(
                <div key={t} className="glass rounded-2xl p-5 text-center">
                  <div className="text-3xl font-semibold">{n}</div>
                  <div className="text-sm text-neutral-400">{t}</div>
                </div>
              ))}
            </div>
          </div>
          {/* сюда можно вставить видео/шоурил */}
          <div className="glass rounded-2xl aspect-[4/3]" />
        </div>
      </section>

      <Testimonials />

      {/* Контакты / Заявка */}
      <section id="contact" className="py-20 px-6 md:px-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-semibold mb-6">Расскажите о задаче</h2>
          <OrderForm />
          <div className="mt-6 text-neutral-400 text-sm">
            Или напишите: <a className="underline" href="mailto:hello@overcreate.studio">hello@overcreate.studio</a>
          </div>
        </div>
      </section>
    </main>
  )
}
