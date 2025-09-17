'use client';

import { useEffect, useRef } from 'react';

type Opts = {
  tilt?: number;      // максимальный наклон (deg)
  parallax?: number;  // смещение слоёв (px)
  spring?: number;    // пружина 0..1 (0.1–0.2 = мягко)
};

export function useHoloHover<T extends HTMLElement>(opts: Opts = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxTilt = opts.tilt ?? 10;
    const parallax = opts.parallax ?? 18;
    const spring = opts.spring ?? 0.12;

    let rect = el.getBoundingClientRect();
    let raf = 0;

    let tx = 0, ty = 0, trx = 0, try_ = 0, tmx = 50, tmy = 50;
    let cx = 0, cy = 0, crx = 0, cry = 0, cmx = 50, cmy = 50;

    const step = () => {
      cx += (tx - cx) * spring;
      cy += (ty - cy) * spring;
      crx += (trx - crx) * spring;
      cry += (try_ - cry) * spring;
      cmx += (tmx - cmx) * spring;
      cmy += (tmy - cmy) * spring;

      el.style.setProperty('--dx', `${cx.toFixed(2)}px`);
      el.style.setProperty('--dy', `${cy.toFixed(2)}px`);
      el.style.setProperty('--rx', `${crx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${cry.toFixed(2)}deg`);
      el.style.setProperty('--mx', `${cmx.toFixed(2)}%`);
      el.style.setProperty('--my', `${cmy.toFixed(2)}%`);

      raf = requestAnimationFrame(step);
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = x / rect.width;
      const ny = y / rect.height;
      const sx = nx * 2 - 1;
      const sy = ny * 2 - 1;

      trx = -sy * maxTilt;
      try_ = sx * maxTilt;
      tx = sx * parallax;
      ty = sy * parallax;
      tmx = nx * 100;
      tmy = ny * 100;
    };
    const onLeave = () => {
      tx = ty = 0;
      trx = try_ = 0;
      tmx = 50;
      tmy = 50;
      setTimeout(() => cancelAnimationFrame(raf), 320);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [opts.tilt, opts.parallax, opts.spring]);

  return ref;
}
