/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Howl } from 'howler';

import type { Message, Attachment } from '@/types/message';

type Props = {
  messages: Message[];
  onSend: (text: string, files?: File[]) => Promise<void>;
  meId?: number;

  /** Есть ли ещё старые сообщения на сервере */
  hasMore?: boolean;
  /** Запросить старые сообщения «до» firstId и prepend-нуть их в messages */
  onLoadOlder?: (beforeId: number) => Promise<void>;
};

const ding = new Howl({ src: ['/ding.mp3'] });

type GalleryCtx = { items: Attachment[]; index: number };

/** Безопасно вытащить id отправителя: бэки бывают разные :) */
function getSenderId(m: Message): number | string | null {
  // самый частый случай
  const fromSender = (m as unknown as { sender?: { id?: number | string } }).sender?.id;
  if (fromSender !== undefined && fromSender !== null) return fromSender;

  // иногда кладут плоско
  const fromFlat = (m as unknown as { sender_id?: number | string }).sender_id;
  if (fromFlat !== undefined && fromFlat !== null) return fromFlat;

  // иногда явно проставляют флаг владельца
  const isMine = (m as unknown as { isMine?: boolean }).isMine;
  if (isMine) return '__me__';

  return null;
}

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

  // локальный флаг, чтобы не инициировать несколько загрузок подряд
  const isLoadingOlder = useRef(false);

  /* ---------- скролл ---------- */

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // положение скролла — чтобы понимать, когда показывать кнопку «Вниз»
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      setAtBottom(nearBottom);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // перехват колёсика — чтобы не прокручивалась страница вне чата
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

  // звук + автоскролл (если внизу)
  useEffect(() => {
    if (messages.length) {
      try {
        ding.play();
      } catch {
        // браузер мог запретить до первого взаимодействия — ок
      }
    }
    if (atBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // первый рендер — вниз
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  /* ---------- подгрузка вверх ---------- */

  const canLoadOlder = useMemo(
    () => Boolean(onLoadOlder) && hasMore && messages.length > 0,
    [onLoadOlder, hasMore, messages.length]
  );

  const loadOlder = useCallback(async () => {
    if (!canLoadOlder || isLoadingOlder.current) return;

    const el = scrollerRef.current;
    if (!el) return;

    isLoadingOlder.current = true;

    // запоминаем текущую позицию скролла, чтобы после prepend-а не «прыгнуло»
    const prevScrollTop = el.scrollTop;
    const prevScrollHeight = el.scrollHeight;

    const firstId = messages[0]?.id as number; // предполагаем numeric id (подправь, если у тебя string)
    try {
      await onLoadOlder?.(firstId);
    } finally {
      // ждём, пока React дорисует DOM с новыми сообщениями
      requestAnimationFrame(() => {
        const newScrollHeight = el.scrollHeight;
        // сохраняем видимую позицию: двигаем ровно на прирост высоты
        el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        isLoadingOlder.current = false;
      });
    }
  }, [canLoadOlder, messages, onLoadOlder]);

  // триггерим загрузку, когда верхний «сторож» попадает в видимость
  useEffect(() => {
    if (!canLoadOlder) return;

    const el = scrollerRef.current;
    const sentinel = topSentinelRef.current;
    if (!el || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // небольшая «защита от дребезга»: грузим один раз за наблюдение
          loadOlder();
        }
      },
      {
        root: el,
        rootMargin: '200px 0px 0px 0px', // начнём подгружать чуть раньше, чем дошли до края
        threshold: 0,
      }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [canLoadOlder, loadOlder]);

  /* ---------- отправка ---------- */

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
    <div className="rounded-2xl p-0 bg-white/70 shadow border overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-white to-white/60 border-b">
        Чат проекта
      </div>

      {/* Лента */}
      <div
        ref={scrollerRef}
        onWheelCapture={onWheelCapture}
        onWheel={(e) => e.stopPropagation()}
        className="h-[480px] md:h-[560px] overflow-y-auto overscroll-contain px-3 py-4 bg-[radial-gradient(closest-side,rgba(255,255,255,0.85),rgba(255,255,255,0.6))]"
      >
        {/* sentinel для IntersectionObserver */}
        <div ref={topSentinelRef} />

        {/* Кнопка/индикатор ручной подгрузки (на всякий случай) */}
        {canLoadOlder && (
          <div className="mb-2 flex items-center justify-center">
            <button
              disabled={isLoadingOlder.current}
              onClick={loadOlder}
              className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 transition disabled:opacity-50"
            >
              {isLoadingOlder.current ? 'Загружаю…' : 'Показать ещё ↑'}
            </button>
          </div>
        )}

        <div className="w-full space-y-3">
          {messages.map((m) => {
            const sid = getSenderId(m);
            const mine =
              (sid !== null && String(sid) === String(meId)) ||
              (sid === '__me__') ||
              ((m as unknown as { isMine?: boolean }).isMine === true);

            const attachments = m.attachments ?? [];
            const gallery = attachments.filter((a) => a.type === 'image');

            return (
              <div key={m.id} className="w-full flex">
                <div className={`max-w-[78%] sm:max-w-[70%] ${mine ? 'ml-auto text-right' : ''}`}>
                  <div className={`px-2 text-[10px] ${mine ? 'text-right' : 'text-left'} text-gray-500`}>
                    <span>{m.sender?.name ?? '—'}</span>
                    {m.created_at ? (
                      <span className="ml-1 opacity-70">• {new Date(m.created_at).toLocaleString()}</span>
                    ) : null}
                  </div>

                  {m.body ? (
                    <div
                      className={[
                        'px-3 py-2 rounded-2xl shadow-sm backdrop-blur',
                        mine
                          ? 'bg-neutral-900 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 rounded-bl-sm',
                      ].join(' ')}
                    >
                      {m.body}
                    </div>
                  ) : null}

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
                                  setPreview({ items: gallery, index: Math.max(idx, 0) });
                                }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Кнопка «Вниз», если ушли наверх */}
      {!atBottom && (
        <div className="px-4 py-2">
          <button
            onClick={() => scrollToBottom()}
            className="mx-auto block text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 transition"
          >
            Вниз ▾
          </button>
        </div>
      )}

      {/* Поле ввода */}
      <form className="p-3 border-t bg-white/80 backdrop-blur" onSubmit={submit}>
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-600">
            {files.map((f, i) => (
              <span key={i} className="px-2 py-1 rounded-full bg-gray-100 border">
                {f.name}
              </span>
            ))}
            <button
              type="button"
              className="underline ml-auto"
              onClick={() => {
                setFiles([]);
                if (fileInput.current) fileInput.current.value = '';
              }}
            >
              очистить
            </button>
          </div>
        )}

        <div className="flex gap-2 items-start">
          <input
            className="flex-1 border rounded-xl px-3 py-2 bg-white/70 focus:bg-white outline-none focus:ring-2 ring-black/10"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать сообщение…"
          />

          <label className="shrink-0 cursor-pointer text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">
            Выбрать файлы
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,.zip,.rar,.7z,text/plain"
              onChange={onPickFiles}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="shrink-0 px-4 py-2 rounded-xl bg-black text-white hover:bg-black/90 transition"
          >
            Отправить
          </button>
        </div>
      </form>

      {/* Лайтбокс */}
      {preview && (
        <Lightbox
          ctx={preview}
          onClose={() => setPreview(null)}
          onNext={() =>
            setPreview((p) => (!p ? p : { ...p, index: (p.index + 1) % p.items.length }))
          }
          onPrev={() =>
            setPreview((p) => (!p ? p : { ...p, index: (p.index - 1 + p.items.length) % p.items.length }))
          }
        />
      )}
    </div>
  );
}

/* ---------- Attachment bubble ---------- */

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
          'relative w-full overflow-hidden rounded-xl border focus:outline-none focus:ring-2 ring-black/20 group',
          mine ? 'justify-self-end' : 'justify-self-start',
        ].join(' ')}
        title={a.original_name ?? 'Открыть'}
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
          Открыть
        </span>
      </button>
    );
  }

  if (a.type === 'audio') {
    return (
      <div className={mine ? 'justify-self-end w-full' : 'w-full'}>
        <audio controls src={a.url} className="w-full" />
      </div>
    );
  }

  if (a.type === 'video') {
    return (
      <div className={['rounded-xl border overflow-hidden w-full', mine ? 'justify-self-end' : ''].join(' ')}>
        <video controls src={a.url} className="w-full max-h-56" />
      </div>
    );
  }

  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'block px-3 py-2 rounded-xl bg-white border text-sm truncate hover:bg-gray-50 max-w-full',
        mine ? 'justify-self-end text-right' : 'justify-self-start',
      ].join(' ')}
      title={a.original_name ?? 'Файл'}
    >
      {a.original_name ?? 'Файл'}
    </a>
  );
}

/* ---------- Лайтбокс ---------- */

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
        <span className="text-sm truncate">{cur.original_name ?? 'Изображение'}</span>
        <span className="ml-auto text-xs opacity-70">
          {index + 1}/{items.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-2 rounded px-2 py-1 bg-white/10 hover:bg-white/20"
          aria-label="Закрыть"
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
            aria-label="Предыдущее"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="pointer-events-auto rounded-full w-10 h-10 grid place-items-center bg-white/10 hover:bg-white/20 text-white"
            aria-label="Следующее"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
