'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchPortfolioItem } from '@/lib/api';
import type { Portfolio } from '@/types/portfolio';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const toAbs = (u?: string | null): string | null =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

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
      .then((data) => setItem(data))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [id]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!id) return null;

  const coverUrl = (() => {
    if (!item) return null;
    const gallery = (item as unknown as { gallery?: string[] | null }).gallery ?? [];
    const galleryImg = Array.isArray(gallery)
      ? gallery.find((u) => !isVideo(u)) ?? null
      : null;

    const candidates: Array<string | null | undefined> = [
      (item as unknown as { cover_url?: string | null }).cover_url,
      (item as unknown as { preview_url?: string | null }).preview_url,
      (item as unknown as { thumbnail_url?: string | null }).thumbnail_url,
      galleryImg,
    ];

    for (const c of candidates) {
      const abs = toAbs(c ?? null);
      if (abs) return abs;
    }
    return null;
  })();

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/70 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-5xl w-full bg-neutral-900/95 border border-neutral-700 rounded-2xl p-4 md:p-6 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {item?.title || 'Loading…'}
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {err && <div className="text-red-300 text-sm mb-3">{err}</div>}

        {!item ? (
          <div className="text-neutral-400">Loading…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* cover */}
            {coverUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-neutral-700">
                <Image
                  src={coverUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* description */}
            <div className="text-neutral-300">
              {'excerpt' in item && item.excerpt ? (
                <p className="mb-2">{item.excerpt as string}</p>
              ) : null}
              {'tags' in item && item.tags ? (
                <div className="text-neutral-500 text-sm">
                  Теги: {item.tags as string}
                </div>
              ) : null}
            </div>

            {/* gallery */}
            {Array.isArray(
              (item as unknown as { gallery?: string[] | null }).gallery
            ) &&
              ((item as unknown as { gallery: string[] }).gallery.length ?? 0) >
                0 && (
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {(item as unknown as { gallery: string[] }).gallery.map(
                    (u, i) => {
                      const abs = toAbs(u);
                      if (!abs) return null;
                      const vid = isVideo(abs);
                      return (
                        <div
                          key={`${i}-${u}`}
                          className="rounded-lg overflow-hidden border border-neutral-700"
                        >
                          {vid ? (
                            <video
                              src={abs}
                              controls
                              className="w-full h-full object-contain bg-black aspect-video"
                            />
                          ) : (
                            <div className="relative w-full aspect-[4/3]">
                              <Image
                                src={abs}
                                alt={`media-${i}`}
                                fill
                                sizes="(min-width:1024px) 50vw, 100vw"
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
