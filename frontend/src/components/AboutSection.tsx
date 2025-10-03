'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const LOGO_SRC = '/transp-logo.svg';

/** CSS vars без any */
type CSSVarProps = CSSProperties & {
  ['--rx']?: string;
  ['--ry']?: string;
  ['--lift']?: string;
  ['--gx']?: string;
  ['--gy']?: string;
};

const cfg = {
  maxTiltX: 10,
  maxTiltY: 12,
  hoverLift: 22,
  idleAmpX: 2.2,
  idleAmpY: 2.8,
  idleSpeed: 0.7,
};

export default function AboutSection() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  // idle «дыхание» сцены
  useEffect(() => {
    let raf = 0;
    let t0 = performance.now();
    const step = (t: number) => {
      const _ = (t - t0) / 1000;
      t0 = t;
      if (!cardRef.current || hovered) {
        raf = requestAnimationFrame(step);
        return;
      }
      const ph = t * 0.001 * Math.PI * 2 * cfg.idleSpeed;
      const rx = Math.sin(ph) * cfg.idleAmpX;
      const ry = Math.cos(ph * 0.9) * cfg.idleAmpY;
      cardRef.current.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      cardRef.current.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      cardRef.current.style.setProperty('--gx', `50%`);
      cardRef.current.style.setProperty('--gy', `50%`);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const rx = (-dy * cfg.maxTiltX).toFixed(2);
    const ry = (dx * cfg.maxTiltY).toFixed(2);
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--gx', `${((dx + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((dy + 1) * 50).toFixed(1)}%`);
  }

  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    setHovered(false);
    el.style.setProperty('--rx', `0deg`);
    el.style.setProperty('--ry', `0deg`);
    el.style.setProperty('--gx', `50%`);
    el.style.setProperty('--gy', `50%`);
  }

  const sceneStyle: CSSVarProps = {
    '--rx': '0deg',
    '--ry': '0deg',
    '--lift': `${cfg.hoverLift}px`,
    '--gx': '50%',
    '--gy': '50%',
    perspective: '1200px',
  };

  return (
    <section id="about" className="py-20 px-6 md:px-16">
      <div className="max-w-[1200px] w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Левый блок */}
        <div>
          <h2 className="text-3xl font-semibold">
            OverCreate — Design and Development Studio
          </h2>
          <p className="mt-4 text-neutral-300">
            We craft motion, brand identities, websites and full-stack apps. Clear communication,
            fast delivery, modern stack (Next.js, Laravel, Docker). Smooth launches, zero headaches.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <StatCard
              value="6+"
              label="years of expertise"
              gradient="from-sky-400/20 to-fuchsia-400/20"
              ring="ring-sky-300/30"
            />
            <StatCard
              value="120+"
              label="launched designs"
              gradient="from-violet-400/20 to-indigo-400/20"
              ring="ring-violet-300/30"
            />
            <StatCard
              value="40+"
              label="brands served"
              gradient="from-emerald-400/20 to-teal-400/20"
              ring="ring-emerald-300/30"
            />
            <StatCard
              value="∞"
              label="iterations until it's perfect"
              gradient="from-amber-400/20 to-rose-400/20"
              ring="ring-amber-300/30"
            />
          </div>
        </div>

        {/* Правый блок — 3D карточка с логотипом */}
        <div
          ref={cardRef}
          style={sceneStyle}
          className={[
            'group relative glass rounded-2xl aspect-[4/3] overflow-hidden',
            'border border-white/10',
            'transition-all duration-300',
            'will-change-transform',
          ].join(' ')}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* мягкие пятна */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 60% at 15% 10%, rgba(59,130,246,.14), transparent 60%), ' +
                'radial-gradient(60% 60% at 85% 85%, rgba(168,85,247,.14), transparent 60%)',
              filter: 'blur(42px)',
            }}
          />

          {/* Вся сцена (внутренняя плоскость, которую наклоняем) */}
          <div className="absolute inset-0 [transform-style:preserve-3d] grid place-items-center">
            <div
              className={[
                'relative w-[88%] h-[78%] max-w-[880px]',
                '[transform:rotateX(var(--rx))_rotateY(var(--ry))_translateZ(0px)]',
                'transition-transform duration-200 ease-out will-change-transform',
              ].join(' ')}
            >
              {/* блик */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    'radial-gradient(380px 260px at var(--gx) var(--gy), rgba(255,255,255,.08), transparent 55%)',
                }}
              />

              {/* плитка */}
              <div
                className={[
                  'absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[.02] to-white/[.03]',
                  'border border-white/10 backdrop-blur-sm',
                  'shadow-[0_10px_40px_-15px_rgba(0,0,0,.45)]',
                  'transition-all duration-300',
                  'group-hover:shadow-[0_30px_80px_-30px_rgba(59,130,246,.55),0_0_0_1px_rgba(255,255,255,.15)_inset]',
                  'group-hover:[transform:translateZ(var(--lift))]',
                ].join(' ')}
              />

              {/* ЛОГО — ЖЁСТКО ПО ЦЕНТРУ */}
              <div className="absolute inset-0 [transform-style:preserve-3d] pointer-events-none">
                <div
                  className="
                    absolute top-1/2 left-1/2
                    -translate-x-1/2 -translate-y-1/2
                    w-[86%] md:w-[90%] max-w-none
                    [transform:translateZ(12px)]
                    drop-shadow-[0_16px_40px_rgba(0,0,0,.35)]
                  "
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* мягкое свечение вокруг лого */}
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-[36px] blur-2xl opacity-60"
                    style={{
                      background:
                        'radial-gradient(40% 40% at 30% 30%, rgba(59,130,246,.18), transparent 60%), ' +
                        'radial-gradient(45% 45% at 70% 70%, rgba(168,85,247,.18), transparent 60%)',
                    }}
                  />
                  <img
                    src={LOGO_SRC}
                    alt="OverCreate logo"
                    draggable={false}
                    className="relative w-full h-auto select-none"
                  />
                </div>
              </div>
            </div>

            {/* Подпись */}
            <div
              className={[
                'absolute bottom-4 text-white/80 text-sm',
                '[transform:translateZ(10px)]',
              ].join(' ')}
            >
              OverCreate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- НЕкликабельная карточка -------------------------- */
function StatCard({
  value,
  label,
  gradient,
  ring,
}: {
  value: string;
  label: string;
  gradient: string; // tailwind from-*/to-* для фона
  ring: string; // tailwind ring-*
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
      }}
      tabIndex={-1}
      draggable={false}
      className={[
        'relative rounded-2xl p-5 text-center select-none cursor-default',
        'border border-white/10 glass',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:border-white/20',
        'hover:shadow-[0_24px_70px_-34px_rgba(0,0,0,.7)]',
        `bg-gradient-to-br ${gradient}`,
        `ring-0 hover:${ring} hover:ring-2`,
      ].join(' ')}
    >
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm text-neutral-300">{label}</div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background:
            'radial-gradient(600px 240px at 50% 0%, rgba(255,255,255,.08), transparent 60%)',
        }}
      />
    </div>
  );
}
