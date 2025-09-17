'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type React from 'react';
import clsx from 'clsx';
import type { CSSVars, RGB } from '@/types/ui';

type Props = {
  href?: string;
  title: string;
  desc?: string;
  accentFrom?: RGB;
  accentTo?: RGB;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  /** кастомная высота карточки (tailwind-класс) */
  minH?: string;
};

/** clamp helper */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function HoloCard({
  href,
  title,
  desc,
  accentFrom = [56, 189, 248],
  accentTo = [168, 85, 247],
  icon,
  className,
  children,
  minH = 'min-h-[180px]',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  // состояние
  const state = useRef({
    w: 0,
    h: 0,
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    mx: 50,
    my: 50,
    sx: 50,
    sy: 50,
  });

  // постоянный rAF-цикл (убираем «мигание» на hover)
  const loop = () => {
    const el = cardRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(loop);
      return;
    }

    const s = state.current;
    s.cx += (s.tx - s.cx) * 0.12;
    s.cy += (s.ty - s.cy) * 0.12;
    s.sx += (s.mx - s.sx) * 0.16;
    s.sy += (s.my - s.sy) * 0.16;

    const rx = clamp(-(s.cy / (s.h || 1)) * 9, -7, 7);
    const ry = clamp((s.cx / (s.w || 1)) * 9, -7, 7);

    el.style.setProperty('--dx', `${s.cx.toFixed(2)}px`);
    el.style.setProperty('--dy', `${s.cy.toFixed(2)}px`);
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--mx', `${s.sx.toFixed(2)}%`);
    el.style.setProperty('--my', `${s.sy.toFixed(2)}%`);

    rafId.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = e.currentTarget;
    const r = wrap.getBoundingClientRect();
    state.current.w = r.width;
    state.current.h = r.height;

    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;

    state.current.tx = dx;
    state.current.ty = dy;
    state.current.mx = mx;
    state.current.my = my;
  };

  const onPointerLeave = () => {
    state.current.tx = 0;
    state.current.ty = 0;
    state.current.mx = 50;
    state.current.my = 50;
  };

  const onPointerDown = () => cardRef.current?.classList.add('hcard-pressed');
  const onPointerUp = () => cardRef.current?.classList.remove('hcard-pressed');

  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };

  const Content = (
    <div
      ref={rootRef}
      className={clsx('hcard3d', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div ref={cardRef} className="hcard will-change-transform" style={vars}>
        <div className={clsx('hcard-body p-6 relative', minH)}>
          {/* декоративные слои */}
          <div className="hcard-engrave pointer-events-none" />
          <div className="hcard-shard a pointer-events-none" />
          <div className="hcard-shard b pointer-events-none" />
          <div className="hcard-shine pointer-events-none" />
          {/* <div className="hcard-chip" />  ← если нужно — верни */}

          {/* контент */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 hcard-layer hcard-ico">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="hcard-title text-lg hcard-layer hcard-ttl">{title}</div>
            </div>
            {desc && <div className="hcard-desc mt-2 hcard-layer hcard-dsc">{desc}</div>}
            {children && <div className="mt-6 hcard-cta hcard-layer">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block will-change-transform">
      {Content}
    </Link>
  ) : (
    Content
  );
}
