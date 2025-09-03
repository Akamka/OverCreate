import { useEffect, useState } from 'react'
import { api, setAdminHeaders } from './api'
import type { Portfolio } from './types'

const services = [
  { key: 'motion', label: 'Моушн' },
  { key: 'graphic', label: 'Графический' },
  { key: 'web', label: 'Веб' },
  { key: 'business-card', label: 'Визитки' },
  { key: 'poster', label: 'Плакаты' },
  { key: 'dev', label: 'Разработка/верстка' }
]

function Login({ onLogin }: { onLogin: (email: string, token: string) => void }) {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #333', borderRadius: 12 }}>
      <h2>Вход в админку</h2>
      <p style={{ color: '#aaa' }}>Введите разрешённый e-mail и токен из backend .env</p>
      <div style={{ marginTop: 12 }}>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="admin token" style={{ width: '100%', padding: 8, marginBottom: 12 }} />
        <button onClick={()=>onLogin(email, token)} style={{ padding: '8px 14px' }}>Войти</button>
      </div>
    </div>
  )
}

function PortfolioForm({ initial, onSaved }:{ initial?: Partial<Portfolio>, onSaved: () => void }) {
  const [form, setForm] = useState<Portfolio>({
    title: '',
    service_type: 'web',
    excerpt: '',
    is_published: true,
    ...initial
  } as Portfolio)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null)

  const save = async () => {
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('service_type', form.service_type)
    if (form.excerpt) fd.append('excerpt', form.excerpt)
    if (form.client) fd.append('client', form.client)
    if (form.tags) fd.append('tags', form.tags)
    fd.append('is_published', String(!!form.is_published))
    if (typeof form.is_featured !== 'undefined') fd.append('is_featured', String(!!form.is_featured))
    if (typeof form.sort_order === 'number') fd.append('sort_order', String(form.sort_order))
    if (form.meta_title) fd.append('meta_title', form.meta_title)
    if (form.meta_description) fd.append('meta_description', form.meta_description)

    if (coverFile) fd.append('cover', coverFile)
    if (galleryFiles) {
      Array.from(galleryFiles).forEach(f => fd.append('gallery[]', f))
    }

    if (form.id) {
      // метод PUT через POST с _method (проще для multipart)
      await api.post(`/admin/portfolio/${form.id}?_method=PUT`, fd)
    } else {
      await api.post('/admin/portfolio', fd)
    }
    onSaved()
  }

  return (
    <div style={{ border: '1px solid #333', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <h3>{form.id ? 'Редактировать работу' : 'Новая работа'}</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Заголовок" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})}/>
        <select value={form.service_type} onChange={(e)=>setForm({...form, service_type: e.target.value})}>
          {services.map(s=> <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>

        {/* локальная загрузка */}
        <label>Обложка (изображение или видео)</label>
        <input type="file" accept="image/*,video/*" onChange={(e)=>setCoverFile(e.target.files?.[0] || null)} />

        <label>Галерея (несколько файлов)</label>
        <input type="file" accept="image/*,video/*" multiple onChange={(e)=>setGalleryFiles(e.target.files)} />

        <input placeholder="Короткое описание" value={form.excerpt || ''} onChange={(e)=>setForm({...form, excerpt: e.target.value})}/>
        <label><input type="checkbox" checked={!!form.is_published} onChange={(e)=>setForm({...form, is_published: e.target.checked})}/> Публиковать</label>
        <button onClick={save} style={{ padding: '8px 14px' }}>{form.id ? 'Сохранить' : 'Добавить'}</button>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [items, setItems] = useState<Portfolio[]>([])
  const [edit, setEdit] = useState<Portfolio | undefined>(undefined)

  const load = async () => {
    const res = await api.get('/portfolio', { params: { per_page: 100, published: false } })
    setItems(res.data.data ?? [])
  }

  const onLogin = (email: string, token: string) => {
    setAdminHeaders(email, token)
    localStorage.setItem('admin_email', email)
    localStorage.setItem('admin_token', token)
    setAuthed(true)
  }

  const del = async (id: number) => {
    await api.delete(`/admin/portfolio/${id}`)
    await load()
  }

  useEffect(() => {
    const email = localStorage.getItem('admin_email') || ''
    const token = localStorage.getItem('admin_token') || ''
    if (email && token) {
      setAdminHeaders(email, token)
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed])

  if (!authed) return <Login onLogin={onLogin} />

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', padding: 16 }}>
      <h2>Админ — Портфолио</h2>
      <PortfolioForm onSaved={()=>{ setEdit(undefined); load() }} initial={edit}/>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th>ID</th><th>Заголовок</th><th>Сервис</th><th>Опубликовано</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(it=>(
            <tr key={it.id} style={{ borderBottom: '1px solid #222' }}>
              <td>{it.id}</td>
              <td>{it.title}</td>
              <td>{it.service_type}</td>
              <td>{String(it.is_published)}</td>
              <td>
                <button onClick={()=>setEdit(it)} style={{ marginRight: 8 }}>Редакт.</button>
                <button onClick={()=>del(it.id!)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
