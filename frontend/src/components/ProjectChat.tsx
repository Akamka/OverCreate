/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Howl } from 'howler';
import type { Message, Attachment } from '@/types/message';

/* ---------- theme helpers (match dashboard accents if present) ---------- */
const ACC1 = 'var(--acc1, 59 130 246)';  // blue-500
const ACC2 = 'var(--acc2, 168 85 247)';  // purple-500
const ACC3 = 'var(--acc3, 45 212 191)';  // teal-400

/* ---------- Subtle noise bg ---------- */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")";

/* ---------- SFX (optional) ---------- */
const ding = new Howl({ src: [''] });

/* ---------- Types & utils ---------- */
type Props = {
  messages: Message[];
  onSend: (text: string, files?: File[]) => Promise<void>;
  meId?: number;
  hasMore?: boolean;
  onLoadOlder?: (beforeId: number) => Promise<void>;
};

type GalleryCtx = { items: Attachment[]; index: number };

function getSenderId(m: Message): number | string | null {
  const fromRel = (m as { sender?: { id?: number | string } }).sender?.id;
  if (fromRel !== undefined && fromRel !== null) return fromRel;
  const flat = (m as { sender_id?: number | string }).sender_id;
  if (flat !== undefined && flat !== null) return flat;
  const own = (m as { isMine?: boolean }).isMine;
  if (own) return '__me__';
  return null;
}
function getLocalState(m: Message): 'sending' | 'error' | null {
  const state = (m as Partial<Record<'state', unknown>>).state;
  return state === 'sending' || state === 'error' ? state : null;
}
function initials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U';
}
function groupByDate(msgs: Message[]): { day: string; items: Message[] }[] {
  const fmt = new Intl.DateTimeFormat('en-GB');
  const map = new Map<string, Message[]>();
  for (const m of msgs) {
    const d = m.created_at ? fmt.format(new Date(m.created_at)) : 'No date';
    const arr = map.get(d) ?? [];
    arr.push(m);
    map.set(d, arr);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}

/* ---------- Pretty atoms ---------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                 text-white/90 border border-white/15 bg-white/[.06]
                 shadow-[0_6px_20px_-12px_rgba(0,0,0,.6)]"
    >
      {children}
    </span>
  );
}

function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black',
        'bg-[linear-gradient(135deg,rgb(var(--acc1,59_130_246)),rgb(var(--acc2,168_85_247)))]',
        'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
        'motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-[2px] active:translate-y-0',
        className,
      ].join(' ')}
    />
  );
}

function GhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-white/90',
        'border border-white/12 bg-white/[.06] backdrop-blur',
        'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
        'motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-[2px] active:translate-y-0',
        className,
      ].join(' ')}
    />
  );
}

/* ============================== Component ============================== */

export default function ProjectChat({
  messages,
  onSend,
  meId,
  hasMore = false,
  onLoadOlder,
}: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [atBottom, setAtBottom] = useState(true);
  const [preview, setPreview] = useState<GalleryCtx | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingOlder = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      setAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const onWheelCapture = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 0;
    const atEnd = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atEnd)) {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    }
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (messages.length) {
      try {
        ding.play();
      } catch {}
    }
    if (atBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // pagination up
  const canLoadOlder = useMemo(
    () => Boolean(onLoadOlder) && hasMore && messages.length > 0,
    [onLoadOlder, hasMore, messages.length]
  );

  const loadOlder = useCallback(async () => {
    if (!canLoadOlder || isLoadingOlder.current) return;
    const el = scrollerRef.current;
    if (!el) return;

    isLoadingOlder.current = true;

    const prevTop = el.scrollTop;
    const prevHeight = el.scrollHeight;
    const firstId = messages[0]?.id as number | undefined;

    try {
      if (firstId !== undefined) await onLoadOlder?.(firstId);
    } finally {
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight + prevTop;
        isLoadingOlder.current = false;
      });
    }
  }, [canLoadOlder, messages, onLoadOlder]);

  useEffect(() => {
    if (!canLoadOlder) return;
    const root = scrollerRef.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (e.isIntersecting) loadOlder();
      },
      { root, rootMargin: '200px 0px 0px 0px', threshold: 0 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [canLoadOlder, loadOlder]);

  /* ---------- send ---------- */
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body && files.length === 0) return;
    await onSend(body, files);
    setText('');
    setFiles([]);
    if (fileInput.current) fileInput.current.value = '';
    scrollToBottom();
  }
  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
  }

  /* ---------- UI ---------- */
  return (
    <div className="rounded-2xl overflow-hidden border border-white/12 bg-white/[.035] backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] relative">
      {/* header */}
      <div className="relative px-4 py-2 border-b border-white/10 bg-gradient-to-r from-white/5 via-white/5 to-white/[0.03]">
        <div className="text-sm font-semibold">Project chat</div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {/* scroll area */}
      <div
        ref={scrollerRef}
        onWheelCapture={onWheelCapture}
        onWheel={(e) => e.stopPropagation()}
        className="h-[520px] md:h-[620px] overflow-y-auto px-3 py-4"
        style={{
          backgroundImage: [
            `radial-gradient(900px 600px at 20% 15%, rgb(${ACC2} / .10), transparent)`,
            `radial-gradient(900px 600px at 85% 85%, rgb(${ACC3} / .10), transparent)`,
            NOISE_BG,
          ].join(', '),
          backgroundAttachment: 'local, local, local',
          backgroundSize: 'cover, cover, 160px 160px',
        }}
      >
        <div ref={topSentinelRef} />

        {canLoadOlder && (
          <div className="mb-3 flex items-center justify-center">
            <GhostButton
              disabled={isLoadingOlder.current}
              onClick={loadOlder}
              aria-label="Load older messages"
            >
              {isLoadingOlder.current ? 'Loading…' : 'Load more ↑'}
            </GhostButton>
          </div>
        )}

        <div className="w-full space-y-5">
          {groupByDate(messages).map(({ day, items }) => (
            <div key={day}>
              <div className="sticky top-2 z-10 mx-auto w-fit">
                <Chip>{day}</Chip>
              </div>

              <div className="mt-2 space-y-3">
                {items.map((m) => {
                  const sid = getSenderId(m);
                  const mine =
                    (sid !== null && String(sid) === String(meId)) ||
                    sid === '__me__' ||
                    (m as { isMine?: boolean }).isMine === true;

                  const attachments = m.attachments ?? [];
                  const gallery = attachments.filter((a) => a.type === 'image');
                  const localState = getLocalState(m);

                  return (
                    <div key={m.id} className="w-full">
                      {/* meta line */}
                      <div
                        className={`px-2 mb-1 flex items-center ${
                          mine ? 'justify-end' : 'justify-start'
                        } text-[11px] text-white/60`}
                      >
                        {!mine && (
                          <div className="mr-2 grid place-items-center rounded-full w-6 h-6 bg-white/10 border border-white/10 text-[10px] shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]">
                            {initials(m.sender?.name)}
                          </div>
                        )}
                        <span className="opacity-80">{m.sender?.name ?? '—'}</span>
                        {m.created_at && (
                          <span className="ml-1 opacity-60">
                            •{' '}
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {/* bubble */}
                      <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] sm:max-w-[70%] ${mine ? 'text-right' : ''}`}>
                          {m.body && (
                            <div
                              className={[
                                'px-3 py-2 rounded-2xl',
                                'shadow-[0_10px_30px_-18px_rgba(0,0,0,.7)]',
                                mine
                                  ? 'bg-gradient-to-br from-white/10 to-white/5 text-white rounded-br-md border border-white/10'
                                  : 'bg-[#0f1116] text-white/90 rounded-bl-md border border-white/10',
                              ].join(' ')}
                            >
                              <div className="whitespace-pre-wrap break-words">{m.body}</div>
                              {localState && (
                                <div className="mt-1 text-[10px] opacity-70">
                                  {localState === 'sending' ? 'sending…' : 'error'}
                                </div>
                              )}
                              {!localState && mine && (
                                <div className="mt-1 text-[10px] opacity-50">✓</div>
                              )}
                            </div>
                          )}

                          {attachments.length > 0 && (
                            <div
                              className={[
                                'mt-2 grid gap-2',
                                attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
                              ].join(' ')}
                            >
                              {attachments.map((a) => (
                                <AttachmentView
                                  key={a.id}
                                  a={a}
                                  mine={mine}
                                  onPreview={
                                    a.type === 'image'
                                      ? () => {
                                          const idx = gallery.findIndex((g) => g.id === a.id);
                                          setPreview({
                                            items: gallery,
                                            index: Math.max(idx, 0),
                                          });
                                        }
                                      : undefined
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* jump to bottom */}
      {!atBottom && (
        <div className="px-4 py-2 bg-gradient-to-t from-black/20 to-transparent">
          <GhostButton onClick={() => scrollToBottom()} aria-label="Jump to newest">
            Jump to bottom ▾
          </GhostButton>
        </div>
      )}

      {/* composer */}
<form className="p-3 border-t border-white/10 bg-[#0c0e13]/80 backdrop-blur" onSubmit={submit}>
  {files.length > 0 && (
    <div className="mb-2 flex flex-wrap gap-2 text-xs text-white/80">
      {files.map((f, i) => (
        <span key={i} className="px-2 py-1 rounded-full bg-white/10 border border-white/12">
          {f.name}
        </span>
      ))}
      <button
        type="button"
        className="underline ml-auto hover:text-white"
        onClick={() => {
          setFiles([]);
          if (fileInput.current) fileInput.current.value = '';
        }}
      >
        clear files
      </button>
    </div>
  )}

  <div className="flex gap-2 items-start">
    <input
      className="flex-1 border border-white/12 rounded-xl px-3 py-2 bg-white/5 focus:bg-white/10 outline-none focus:ring-2 text-white shadow-inner transition-colors"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Write a message…"
      aria-label="Message"
    />

    {/* скрытый input ОТДЕЛЬНО, без label-обёртки */}
    <input
      id="chat-attachments"
      ref={fileInput}
      type="file"
      multiple
      accept="image/*,video/*,audio/*,application/pdf,.zip,.rar,.7z,text/plain"
      onChange={onPickFiles}
      className="hidden"
      aria-label="Attach files"
    />

    {/* обычная кнопка, которая триггерит .click() у input */}
    <GhostButton
      type="button"
      onClick={() => fileInput.current?.click()}
      aria-label="Attach files"
    >
      Attach
    </GhostButton>

    <PrimaryButton type="submit" aria-label="Send message">
      Send
    </PrimaryButton>
  </div>
</form>


      {/* lightbox */}
      {preview && (
        <Lightbox
          ctx={preview}
          onClose={() => setPreview(null)}
          onNext={() =>
            setPreview((p) =>
              !p ? p : { ...p, index: (p.index + 1) % p.items.length }
            )
          }
          onPrev={() =>
            setPreview((p) =>
              !p ? p : { ...p, index: (p.index - 1 + p.items.length) % p.items.length }
            )
          }
        />
      )}
    </div>
  );
}

/* -------- attachments -------- */

function AttachmentView({
  a,
  mine,
  onPreview,
}: {
  a: Attachment;
  mine?: boolean;
  onPreview?: () => void;
}) {
  if (a.type === 'image') {
    const w = a.width ?? 1200;
    const h = a.height ?? 800;

    return (
      <button
        type="button"
        onClick={onPreview}
        className={[
          'relative w-full overflow-hidden rounded-xl border border-white/10 focus:outline-none focus:ring-2 ring-emerald-400/30 group',
          mine ? 'justify-self-end' : 'justify-self-start',
        ].join(' ')}
        title={a.original_name ?? 'Open'}
        aria-label="Open image"
      >
        <Image
          src={a.url}
          alt={a.original_name ?? ''}
          width={w}
          height={h}
          sizes="(max-width: 640px) 100vw, 50vw"
          className="w-full h-auto max-h-60 object-cover rounded-xl transition group-hover:brightness-95 select-none"
          draggable={false}
        />
        <span className="absolute right-2 bottom-2 px-2 py-0.5 text-[10px] rounded bg-black/60 text-white">
          Open
        </span>
      </button>
    );
  }

  if (a.type === 'audio') {
    return (
      <div className={mine ? 'justify-self-end w-full' : 'w-full'}>
        <audio
          controls
          src={a.url}
          className="w-full rounded-lg bg-white/5 backdrop-blur border border-white/10"
        />
      </div>
    );
  }

  if (a.type === 'video') {
    return (
      <div
        className={[
          'rounded-xl border border-white/10 overflow-hidden w-full',
          mine ? 'justify-self-end' : '',
        ].join(' ')}
      >
        <video controls src={a.url} className="w-full max-h-56 bg-black" />
      </div>
    );
  }

  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'block px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm truncate hover:bg-white/10 transition max-w-full text-white/90',
        mine ? 'justify-self-end text-right' : 'justify-self-start',
      ].join(' ')}
      title={a.original_name ?? 'File'}
      aria-label="Open file"
    >
      {a.original_name ?? 'File'}
    </a>
  );
}

/* -------- lightbox -------- */

function Lightbox({
  ctx,
  onClose,
  onNext,
  onPrev,
}: {
  ctx: { items: Attachment[]; index: number };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { items, index } = ctx;
  const cur = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center gap-2 p-3 text-white/90">
        <span className="text-sm truncate">{cur.original_name ?? 'Image'}</span>
        <span className="ml-auto text-xs opacity-70">
          {index + 1}/{items.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-2 rounded px-2 py-1 bg-white/10 hover:bg-white/20"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-[96vw] max-w-[1600px] h-[80vh]">
          <Image
            src={cur.url}
            alt={cur.original_name ?? ''}
            fill
            sizes="100vw"
            className="object-contain select-none"
            priority={false}
            draggable={false}
          />
        </div>
      </div>

      {items.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 w-full flex items-center justify-between px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="pointer-events-auto rounded-full w-10 h-10 grid place-items-center bg-white/10 hover:bg-white/20 text-white"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="pointer-events-auto rounded-full w-10 h-10 grid place-items-center bg-white/10 hover:bg-white/20 text-white"
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
