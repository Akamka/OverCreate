'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * Фиксированная кнопка «На главную», автоподстраивает цвета под текущую .oc-section.
 * Стрелка — SVG, идеально центрирована в круге.
 */
export default function BackToHome({
  href = '/',
  className,
  sectionSelector = '.oc-section',
  fallbackAcc1 = '168 85 247',
  fallbackAcc2 = '34 197 94',
}: {
  href?: string;
  className?: string;
  sectionSelector?: string;
  fallbackAcc1?: string; // 'r g b'
  fallbackAcc2?: string; // 'r g b'
}) {
  const [acc1, setAcc1] = useState<string>(fallbackAcc1);
  const [acc2, setAcc2] = useState<string>(fallbackAcc2);
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(sectionSelector)) as HTMLElement[];
    if (!sections.length) return;

    ioRef.current?.disconnect();
    ioRef.current = null;

    const pickAccents = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      const v1 = cs.getPropertyValue('--acc1').trim();
      const v2 = cs.getPropertyValue('--acc2').trim();
      setAcc1(/^\d+\s+\d+\s+\d+$/.test(v1) ? v1 : fallbackAcc1);
      setAcc2(/^\d+\s+\d+\s+\d+$/.test(v2) ? v2 : fallbackAcc2);
    };

    const io = new IntersectionObserver(
      (entries) => {
        let winner: HTMLElement | null = null;
        let ratio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > ratio) {
            ratio = e.intersectionRatio;
            winner = e.target as HTMLElement;
          }
        }
        if (winner) pickAccents(winner);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => io.observe(el));
    ioRef.current = io;

    // стартовые цвета
    pickAccents(sections[0]);

    return () => io.disconnect();
  }, [sectionSelector, fallbackAcc1, fallbackAcc2]);

  const ringGlow = useMemo(
    () =>
      `radial-gradient(60% 80% at 30% 50%, rgba(${acc1}, .36), transparent 60%),
       radial-gradient(60% 80% at 70% 50%, rgba(${acc2}, .32), transparent 60%)`,
    [acc1, acc2]
  );

  return (
    <div
      className={clsx('fixed left-3 top-3 md:left-6 md:top-6 z-[1000]', className)}
      style={{ pointerEvents: 'none' }}
    >
      <Link
        href={href}
        className={clsx(
          'group inline-flex items-center gap-2 rounded-xl px-3 py-1.5',
          'backdrop-blur-md border border-white/15 bg-white/7 text-white/90',
          'shadow-[0_8px_30px_rgba(0,0,0,.35)] ring-1 ring-white/10',
          'transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)]',
          'hover:border-white/25 hover:bg-white/10 hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-white/30',
          'active:scale-[.98]'
        )}
        style={{ pointerEvents: 'auto' }}
        aria-label="На главную"
      >
        {/* Кружок с идеальной центровкой стрелки */}
        <span
          className="shrink-0 grid h-5 w-5 place-items-center rounded-full shadow-[0_0_18px_rgba(0,0,0,.25)] transition-transform duration-300 group-hover:-translate-x-0.5"
          style={{ backgroundImage: `linear-gradient(135deg, rgb(${acc1}), rgb(${acc2}))` }}
          aria-hidden
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="block"
            fill="none"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* левый «chevron» + короткая линия — визуально ровно по центру */}
            <polyline points="14 6 8 12 14 18" />
            <line x1="9" y1="12" x2="16" y2="12" />
          </svg>
        </span>

        <span className="transition-colors duration-300" style={{ color: 'rgba(255,255,255,.95)' }}>
          На главную
        </span>
      </Link>

      {/* мягкая подсветка позади */}
      <span
        className="absolute -z-10 inset-0 blur-2xl rounded-2xl opacity-40 transition-opacity duration-300"
        style={{ background: ringGlow }}
      />
    </div>
  );
}
