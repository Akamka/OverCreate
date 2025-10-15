'use client';

import { useRef, useState, useEffect, useCallback, MouseEvent } from 'react';
import type { CSSVars, RGB } from '@/types/ui';

export type FAQItem = { q: string; a: string };

type Props = {
  accentFrom: RGB;
  accentTo: RGB;
  items?: FAQItem[];
  title?: string;
};

const FALLBACK: FAQItem[] = [
  { q: 'How long does a project take?', a: 'Typically between one and two weeks depending on scope.' },
  { q: 'Do you provide sources?', a: 'Yes. We can hand off design and motion sources on request.' },
];

/* ─────────────────────── Один FAQ-элемент (дизайн как раньше) ─────────────────────── */
function Row({ i, q, a }: { i: number; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const EASE = 'cubic-bezier(.22,.7,.2,1)';
  const OPEN_MS = 220;
  const CLOSE_MS = 190;

  const animateHeight = useCallback((toPx: number, ms: number) => {
    const panel = panelRef.current;
    if (!panel) return;

    const fromPx = panel.getBoundingClientRect().height;
    panel.style.transitionProperty = 'none';
    panel.style.height = `${fromPx}px`;
    // force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    panel.offsetHeight;

    panel.style.transitionProperty = 'height';
    panel.style.transitionDuration = `${ms}ms`;
    panel.style.transitionTimingFunction = EASE;
    panel.style.height = `${toPx}px`;
  }, [EASE]);

  const openPanel = useCallback(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    // вычисляем auto-высоту
    const prev = panel.style.height;
    panel.style.height = 'auto';
    const full = panel.getBoundingClientRect().height;
    panel.style.height = prev;

    animateHeight(full, OPEN_MS);
    inner.style.transition = `opacity ${OPEN_MS}ms ${EASE}, transform ${OPEN_MS}ms ${EASE}`;
    inner.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
  }, [animateHeight, EASE, OPEN_MS]);

  const closePanel = useCallback(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    const current = panel.getBoundingClientRect().height;
    animateHeight(current, 0);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    panel.offsetHeight;
    animateHeight(0, CLOSE_MS);

    inner.style.transition = `opacity ${CLOSE_MS - 40}ms ${EASE}, transform ${CLOSE_MS - 40}ms ${EASE}`;
    inner.style.opacity = '0';
    inner.style.transform = 'translateY(-6px)';
  }, [animateHeight, EASE, CLOSE_MS]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    next ? openPanel() : closePanel();
  };

  // после открытия переводим height в auto
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      if (open) {
        panel.style.transitionProperty = 'none';
        panel.style.height = 'auto';
      }
    };
    panel.addEventListener('transitionend', onEnd);
    return () => panel.removeEventListener('transitionend', onEnd);
  }, [open]);

  // стартовое состояние (закрыто)
  useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;
    panel.style.height = '0px';
    inner.style.opacity = '0';
    inner.style.transform = 'translateY(-6px)';
  }, []);

  // магнитный спотлайт — только при hover, на уходе просто исчезает
  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const host = e.currentTarget;
    const r = host.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    host.style.setProperty('--mx', `${mx}%`);
    host.style.setProperty('--my', `${my}%`);
  };

  return (
    <div className={`faq-item${hover ? ' glow-on' : ''}`}>
      {/* summary — оставляем прежнюю верстку и классы */}
      <button
        type="button"
        className="faq-summary cursor-pointer w-full text-left list-none px-5 md:px-6 py-4 md:py-5 flex items-center justify-between gap-4"
        aria-expanded={open}
        onClick={toggle}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex-1 font-medium">{q}</div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className="inline-block px-2 py-1 text-xs rounded-full border bg-white/5"
            style={{ borderColor: 'rgb(var(--acc2) / .35)', color: 'rgb(var(--acc2))' }}
          >
            {i + 1}
          </span>
          <svg
            className="faq-chevron opacity-80"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: `transform ${open ? OPEN_MS : CLOSE_MS}ms ${EASE}`,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* панель — те же классы, только анимируем height через JS */}
      <div ref={panelRef} className="faq-panel overflow-hidden will-change-[height]">
        <div ref={innerRef} className="faq-inner">
          <div className="px-5 md:px-6 pb-5 text-white/75 leading-relaxed">{a}</div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Секция FAQ ───────────────────────────── */
export default function ServiceFAQ({
  accentFrom,
  accentTo,
  items,
  title = 'Frequently asked questions',
}: Props) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };
  const list = items && items.length ? items : FALLBACK;

  return (
    <section className="oc-section section-soft" style={vars}>
      <div className="max-w-[1000px] mx-auto px-5 md:px-8">
        <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-white/95">FAQ</h2>
        <p className="text-sm text-white/50">{title}</p>
        

        <div className="faq-list mt-6 rounded-2xl border border-white/10 overflow-hidden">
          {list.map(({ q, a }, i) => (
            <Row key={`${i}-${q}`} i={i} q={q} a={a} />
          ))}
        </div>
      </div>

      {/* только поведение, без изменения твоего визуального CSS */}
      <style jsx global>{`
        /* glow включаем только на .glow-on и выключаем мгновенно при уходе */
        .faq-item::before {
          transition: opacity 100ms ease;
        }
        .faq-item.glow-on::before { opacity: .9; }
        .faq-item .faq-summary::after {
          transition: opacity 90ms ease;
          opacity: 0;
        }
        .faq-item.glow-on .faq-summary::after { opacity: .95; }

        /* панель управляется высотой — изначально закрыта */
        .faq-panel { height: 0; }
      `}</style>
    </section>
  );
}
