'use client';

import { useRef, useState, useEffect, FormEvent, useCallback } from 'react';
import { Howl } from 'howler';
import type { Message, Attachment } from '@/types/message';
import Image from 'next/image';

const ding = new Howl({ src: ['/ding.mp3'] });

type Props = {
  messages: Message[];
  onSend: (text: string, files?: File[]) => Promise<void>;
  meId?: number;
};

export default function ProjectChat({ messages, onSend, meId }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [atBottom, setAtBottom] = useState(true);

  const fileInput = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

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

  useEffect(() => {
    if (messages.length) ding.play();
    if (atBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => { scrollToBottom(false); }, [scrollToBottom]);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = e.deltaY;
    const atTop = el.scrollTop <= 0;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    if ((delta < 0 && !atTop) || (delta > 0 && !atEnd)) {
      e.preventDefault();
      el.scrollTop += delta;
    }
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body && files.length === 0) return;
    await onSend(body, files);
    setText(''); setFiles([]);
    if (fileInput.current) fileInput.current.value = '';
    scrollToBottom();
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  return (
    <div className="rounded-2xl p-0 bg-white/70 shadow border overflow-hidden">
      <div className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-white to-white/60 border-b">
        Чат проекта
      </div>

      <div
        ref={scrollerRef}
        onWheel={handleWheel}
        className="h-[480px] md:h-[560px] overflow-y-auto overscroll-y-contain px-3 py-4 bg-[radial-gradient(closest-side,rgba(255,255,255,0.85),rgba(255,255,255,0.6))]"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m) => {
            const mine = m.sender?.id === meId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end`}
              >
                <div className={`max-w-[82%] sm:max-w-[72%] ${mine ? 'text-right' : 'text-left'}`}>
                  <div className="px-1 text-[10px] text-gray-500">
                    <span>{m.sender?.name ?? '—'}</span>
                    {m.created_at && (
                      <span className="ml-1 opacity-70">
                        • {new Date(m.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {m.body && (
                    <div
                      className={[
                        'inline-flex text-left px-3 py-2 rounded-2xl shadow-sm backdrop-blur break-words align-bottom',
                        'max-w-full',
                        mine
                          ? 'bg-neutral-900 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 rounded-bl-sm',
                      ].join(' ')}
                    >
                      {m.body}
                    </div>
                  )}

                  {!!m.attachments?.length && (
                    <div
                      className={[
                        'mt-2 flex flex-wrap gap-2',
                        mine ? 'justify-end' : 'justify-start',
                      ].join(' ')}
                    >
                      {m.attachments.map((a) => (
                        <AttachmentCard key={a.id} a={a} />
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
              onClick={() => { setFiles([]); if (fileInput.current) fileInput.current.value = ''; }}
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
    </div>
  );
}

/* ---- Attachment card: одинаковая сетка и выравнивание ---- */
function AttachmentCard({ a }: { a: Attachment }) {
  // единый контейнер, чтобы ширины совпадали
  const cardClass =
    'relative rounded-xl border bg-white overflow-hidden max-w-[280px] w-full sm:w-auto';

  if (a.type === 'image') {
    const w = a.width ?? 1200;
    const h = a.height ?? 800;
    return (
      <div className={cardClass}>
        <Image
          src={a.url}
          alt={a.original_name ?? ''}
          width={w}
          height={h}
          sizes="(max-width: 640px) 60vw, 280px"
          className="h-auto w-full object-cover"
          priority={false}
        />
      </div>
    );
  }

  if (a.type === 'audio') {
    return (
      <div className={`${cardClass} p-2`}>
        <audio controls src={a.url} className="w-full" />
      </div>
    );
  }

  if (a.type === 'video') {
    return (
      <div className={cardClass}>
        <video controls src={a.url} className="w-full max-h-56" />
      </div>
    );
  }

  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardClass} px-3 py-2 text-sm truncate hover:bg-gray-50`}
      title={a.original_name ?? 'Файл'}
    >
      {a.original_name ?? 'Файл'}
    </a>
  );
}
