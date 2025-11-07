"use client";
import { useEffect, useState } from "react";
import { adminListPosts, adminDeletePost } from "../lib/adminApi";
import type { Post, Paginated } from "../types";

export default function PostsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [links, setLinks] = useState<Paginated<Post>["links"]>();
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load(pageUrl?: string) {
    setLoading(true);
    try {
      let page: number | undefined;
      if (pageUrl) page = Number(new URL(pageUrl).searchParams.get("page") || "1");
      const res = await adminListPosts({ q, page, per_page: 20 });
      setItems(res.data || []);
      setLinks(res.links);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск по названию"
               style={{ padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", minWidth: 260 }}/>
        <button onClick={()=>load()} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          Найти
        </button>
        <a href="#/posts/new" style={{ padding: "8px 12px", borderRadius: 8, background: "#111", color: "#fff" }}>
          + Новый пост
        </a>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
        {loading ? <div style={{ padding: 16 }}>Загрузка…</div> : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead><tr style={{ background:"#f8fafc" }}>
              {["ID","Заголовок","Слаг","Статус","Опубликован","Действия"].map(h =>
                <th key={h} style={{ textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} style={{ borderTop:"1px solid #e5e7eb" }}>
                  <td style={{ padding:8 }}>{p.id}</td>
                  <td style={{ padding:8, minWidth:260 }}>{p.title}</td>
                  <td style={{ padding:8 }}>{p.slug}</td>
                  <td style={{ padding:8 }}>{p.is_published ? "published" : "draft"}</td>
                  <td style={{ padding:8 }}>{p.published_at?.slice(0,10) || "—"}</td>
                  <td style={{ padding:8, whiteSpace:"nowrap" }}>
                    <a href={`#/posts/${p.id}`} style={{ marginRight:8 }}>Редакт.</a>
                    <button onClick={async ()=>{
                      if (!confirm("Удалить пост?")) return;
                      const prev = items; setItems(s => s.filter(x=>x.id!==p.id));
                      try { await adminDeletePost(p.id); } catch { setItems(prev); }
                    }} style={{ color:"#b91c1c" }}>Удалить</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={6} style={{ padding:16, textAlign:"center" }}>Пусто</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {!!links?.length && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {links.map((l,i)=>
            l.url ? <button key={i} onClick={()=>load(l.url!)} disabled={l.active}
              style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:l.active?"#e5e7eb":"#fff" }}
              dangerouslySetInnerHTML={{ __html:l.label }} /> : <span key={i}/>
          )}
        </div>
      )}
    </div>
  );
}
