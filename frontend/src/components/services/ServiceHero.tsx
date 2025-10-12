'use client';

import Link from 'next/link';
import { useRef, useCallback } from 'react';
import type { CSSVars, RGB } from '@/types/ui';
import ServiceTheme from './ServiceTheme';

type Props = { slug: string; title: string; desc: string; acc1: RGB; acc2: RGB };

export default function ServiceHero({ slug, title, desc, acc1, acc2 }: Props) {
  const vars: CSSVars = { '--acc1': acc1.join(' '), '--acc2': acc2.join(' ') };

  const c1 = `rgb(${acc1.join(' ')})`;
  const c2 = `rgb(${acc2.join(' ')})`;

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // ---------- плавный скролл к якорю ----------
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // если наверху фикс-бар, у секции должен стоять класс tailwind: scroll-mt-24 (см. пункт 2)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const goToPricing = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('pricing');
  }, [scrollToId]);

  const goToPortfolio = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('portfolio');
  }, [scrollToId]);
  // --------------------------------------------

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;
    const r = stage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;

    const rx = (0.5 - ny) * 8;
    const ry = (nx - 0.5) * 8;
    const dx = (nx - 0.5) * 16;
    const dy = (ny - 0.5) * 12;

    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    card.style.setProperty('--dx', `${dx.toFixed(2)}px`);
    card.style.setProperty('--dy', `${dy.toFixed(2)}px`);
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--dx', '0px');
    card.style.setProperty('--dy', '0px');
  };

  return (
    <section
      key={`hero-${slug}-${acc1.join('_')}-${acc2.join('_')}`}
      className="oc-section px-6 md:px-16 relative"
      style={vars}
    >
      <ServiceTheme />

      <div className="max-w-[1200px] mx-auto">
        <div ref={cardRef} className="hcard hero-card">
          <div
            ref={stageRef}
            className="hcard-body p-8 md:p-10 relative overflow-hidden hero-stage"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            <div className="hcard-engrave" />
            <div className="hcard-shard a" />
            <div className="hcard-shard b" />

            <div className="hero-ring-wrap absolute -z-0 -top-36 -right-20 w-[520px] h-[520px] pointer-events-none">
              <div
                className="hero-ring rounded-full blur-2xl"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, ${c1}, ${c2}, ${c1})`,
                  mask: 'radial-gradient(closest-side, transparent 56%, #000 57%)',
                  WebkitMask: 'radial-gradient(closest-side, transparent 56%, #000 57%)',
                  filter: 'saturate(1.04)',
                  opacity: 0.34,
                }}
              />
              <div
                className="hero-ring-shadow"
                style={{
                  boxShadow: `0 0 120px 30px ${c2.replace('rgb', 'rgba').replace(')', ', .16)')}, 0 0 220px 90px ${c1.replace('rgb', 'rgba').replace(')', ', .08)')}`,
                }}
              />
            </div>

            <div className="relative z-10">
              <p className="text-white/60 text-xs md:text-sm uppercase tracking-[.28em]">
                Service / <span style={{ color: c2 }}>{slug}</span>
              </p>

              <h1
                className="mt-3 md:mt-4 text-4xl md:text-6xl font-black leading-[1.06] bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, #fff, rgba(255,255,255,.82) 40%, ${c1} 70%, ${c2})`,
                }}
              >
                {title}
              </h1>

              <p className="mt-4 text-neutral-300 max-w-2xl">{desc}</p>

              <div className="mt-8 flex gap-3">
                <Link href="#pricing" onClick={goToPricing} className="btn-acc btn-acc-primary">
                  Pricing
                </Link>
                <Link href="#portfolio" onClick={goToPortfolio} className="btn-acc btn-acc-outline">
                  Cases
                </Link>
              </div>

              <div className="hero-metrics mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                {[
                  ['120+', 'videos/ animations'],
                  ['30+', 'brands'],
                  ['<14d', 'average delivery time'],
                  ['4.9/5', 'client rating'],
                ].map(([n, t]) => (
                  <div key={t} className="metric" tabIndex={0}>
                    <span aria-hidden className="metric__ring" />
                    <div className="metric__num">{n}</div>
                    <div className="metric__label">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
