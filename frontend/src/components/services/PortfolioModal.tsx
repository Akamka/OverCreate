'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchPortfolioItem } from '@/lib/api';
import type { Portfolio } from '@/types/portfolio';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
const abs = (u?: string | null) =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${BASE}${u.startsWith('/') ? '' : '/'}${u}`;

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(url);
}

export default function PortfolioModal({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const [item, setItem] = useState<Portfolio | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setItem(null);
    setErr(null);
    fetchPortfolioItem(id)
      .then(setItem)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [id]);

  if (!id) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4" onClick={onClose}>
      <div
        className="max-w-5xl w-full bg-neutral-900 border border-neutral-700 rounded-2xl p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{item?.title || 'Загрузка…'}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700">
            ✕
          </button>
        </div>

        {err && <div className="text-red-300 text-sm mb-3">{err}</div>}

        {!item ? (
          <div className="text-neutral-400">Загрузка…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* обложка */}
            {item.cover_url && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-neutral-700">
                <Image
                  src={abs(item.cover_url)!}
                  alt={item.title}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            )}

            {/* описание */}
            <div className="text-neutral-300">
              {item.excerpt && <p className="mb-2">{item.excerpt}</p>}
              {item.tags && <div className="text-neutral-500 text-sm">Теги: {item.tags}</div>}
            </div>

            {/* галерея */}
            {item.gallery && item.gallery.length > 0 && (
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                {item.gallery.map((u, i) => {
                  const src = abs(u)!;
                  const isVid = isVideo(src);
                  return (
                    <div key={i} className="rounded-lg overflow-hidden border border-neutral-700">
                      {isVid ? (
                        <video src={src} controls className="w-full h-full object-contain bg-black aspect-video" />
                      ) : (
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={src}
                            alt={`media-${i}`}
                            fill
                            sizes="(min-width:1024px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
