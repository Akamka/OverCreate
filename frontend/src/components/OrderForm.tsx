'use client'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { OrderPayload } from '@/types/order'
import type { ServiceSlug } from '@/types/service'

export default function OrderForm({ service }: { service?: ServiceSlug }){
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: OrderPayload = {
      first_name: String(fd.get('first_name')||'').trim(),
      last_name:  String(fd.get('last_name')||'').trim(),
      email:      String(fd.get('email')||'').trim(),
      phone:      String(fd.get('phone')||'').trim(),
      message:    String(fd.get('message')||'').trim(),
      service_type: service, // ✅ без any
    }
    setSending(true)
    try{
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
      const res  = await fetch(`${base}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      })
      if(!res.ok) throw new Error('Failed')
      toast.success('Скоро с вами свяжутся!')
      e.currentTarget.reset()
    }catch{
      toast.error('Ошибка отправки, попробуйте ещё раз.')
    }finally{ setSending(false) }
  }

  return (
    <div>
      <Toaster position="bottom-center" />
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 w-[min(560px,90vw)]">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input name="first_name" required placeholder="Имя" className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30" />
            <input name="last_name"  required placeholder="Фамилия" className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30" />
          </div>
          <input name="email" type="email" required placeholder="Email" className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30" />
          <input name="phone" required placeholder="Телефон" className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30" />
          <textarea name="message" placeholder="Коротко о задаче…" rows={5} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30" />
          <button disabled={sending} className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-neutral-200 disabled:opacity-60">
            {sending?'Отправка…':'Отправить'}
          </button>
        </div>
      </form>
    </div>
  )
}
