'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  logo?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

type Props = {
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

const DEFAULTS: Testimonial[] = [
  {
    id: 't1',
    quote:
      'OverCreate shipped our website and motion package in record time. Communication was crystal clear and the handoff was immaculate.',
    author: 'Anna M.',
    role: 'Product Marketing Lead',
    company: 'Kinetiq',
    avatar: '/avatars/a1.png',
    logo: '/logos/kinetiq.svg',
    rating: 5,
  },
  {
    id: 't2',
    quote:
      'They blended bold visuals with precise frontend implementation. Our conversion rate jumped 27% within the first month.',
    author: 'Trevor H.',
    role: 'Head of Growth',
    company: 'Lumio',
    avatar: '/avatars/a2.png',
    logo: '/logos/lumio.svg',
    rating: 5,
  },
  {
    id: 't3',
    quote:
      'The team handled brand, web, and animation as one story. It felt like an in-house crew who just “got” our product.',
    author: 'Sofia R.',
    role: 'Founder',
    company: 'Harbor',
    avatar: '/avatars/a3.png',
    logo: '/logos/harbor.svg',
    rating: 5,
  },
];

export default function Testimonials({
  title = 'What clients say',
  subtitle = 'A few words from people who shipped with OverCreate.',
  items = DEFAULTS,
}: Props) {
  return (
    <section id="testimonials" className="oc-section px-6 md:px-16 py-20">
      <div className="max-w-[1120px] mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
          <p className="mt-2 text-white/65 max-w-2xl">{subtitle}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {items.map((t, i) => (
            <Card key={t.id} index={i} data={t} />
          ))}
        </div>

        <div className="mt-10 overflow-hidden">
          <motion.div
            className="flex items-center gap-10 opacity-70"
            initial={{ x: 0 }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            {[...items, ...items].map((t, i) => (
              <div key={`logo-${t.id}-${i}`} className="h-8 flex items-center">
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={`${t.company} logo`}
                    className="h-8 w-auto opacity-70"
                    draggable={false}
                  />
                ) : (
                  <span className="text-sm text-white/60">{t.company}</span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Card with “light from above” that glides onto card on hover         */
/* and returns back smoothly when leaving                              */
/* ------------------------------------------------------------------ */

function Card({ data, index }: { data: Testimonial; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  // CSS vars: spotlight position and alpha
  const [vars, setVars] = useState<{ ['--x']?: string; ['--y']?: string; ['--a']?: string }>({
    '--x': '50%',
    '--y': '-20%', // ✨ стартуем выше карточки
    '--a': '0.45', // лёгкая подсветка в покое
  });

  // Target/current pos in normalized coords (0..1 horizontally, can be <0 vertically to stay above)
  const target = useRef({ x: 0.5, y: -0.2 }); // ✨ над карточкой по умолчанию
  const current = useRef({ x: 0.5, y: -0.2 });
  const hovering = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // сглаживание: при ховере быстрее, вне — плавнее
      const k = hovering.current ? 0.14 : 0.10;

      current.current.x = lerp(current.current.x, target.current.x, k);
      current.current.y = lerp(current.current.y, target.current.y, k);

      // переводим нормализованные координаты в %
      const px = `${(clamp01(current.current.x) * 100).toFixed(2)}%`;
      // y допускает отрицательные значения (свет реально “над” карточкой)
      const py = `${(current.current.y * 100).toFixed(2)}%`;

      setVars((v) => ({ ...v, '--x': px, '--y': py }));
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      if (!hovering.current) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      target.current.x = Math.max(0, Math.min(1, x));
      // Чуть ограничим Y, чтобы не проваливалось за края
      target.current.y = Math.max(0.02, Math.min(0.98, y));
    };

    const onEnter = () => {
      hovering.current = true;
      // плавно “спустим” свет на карточку и сделаем его ярче
      setVars((v) => ({ ...v, '--a': '1' }));
      // если были выше карточки — мягко направим в верхнюю треть
      target.current = { x: current.current.x, y: 0.12 };
    };

    const onLeave = () => {
      hovering.current = false;
      // возвращаем свет над карточку и уменьшаем интенсивность
      setVars((v) => ({ ...v, '--a': '0.45' }));
      target.current = { x: 0.5, y: -0.2 };
    };

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const s: CSSProperties = vars as CSSProperties;

  return (
    <motion.article
      ref={ref}
      style={s}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
      className={[
        'relative rounded-2xl p-5 md:p-6',
        'border border-white/10 glass',
        'shadow-[0_10px_40px_-18px_rgba(0,0,0,.5)]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_25px_80px_-35px_rgba(59,130,246,.45)]',
        'bg-gradient-to-br from-white/[.02] to-white/[.03]',
        // Слой подсветки: большой радиус, чтобы быть видимым над карточкой при отрицательном Y
        "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none",
        "before:[background:radial-gradient(360px_240px_at_var(--x)_var(--y),rgba(255,255,255,0.12),transparent_65%)]",
        // Альфа управляется переменной и плавно меняется между состояниями
        'before:opacity-[var(--a)] before:transition-[opacity] before:duration-300',
      ].join(' ')}
    >
      {/* company */}
      <div className="flex items-center gap-3 mb-3">
        {data.logo ? (
          <img
            src={data.logo}
            alt={`${data.company} logo`}
            className="h-6 w-auto opacity-80"
            draggable={false}
          />
        ) : (
          <span className="text-xs uppercase tracking-widest text-white/60">
            {data.company}
          </span>
        )}
      </div>

      {/* quote */}
      <blockquote className="text-[15px] leading-relaxed text-white/90">
        “{data.quote}”
      </blockquote>

      {/* footer */}
      <div className="mt-5 flex items-center gap-3">
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.author}
            className="size-9 rounded-full border border-white/15 object-cover"
            draggable={false}
          />
        ) : (
          <div className="size-9 rounded-full border border-white/15 grid place-items-center text-sm text-white/70">
            {initials(data.author)}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium">{data.author}</div>
          <div className="text-xs text-white/60 truncate">
            {data.role} • {data.company}
          </div>
        </div>

        {data.rating ? (
          <div className="ml-auto flex items-center gap-1 text-amber-300">
            {Array.from({ length: data.rating }).map((_, i) => (
              <Star key={i} />
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

/* ------------------------------ UI bits ------------------------------ */

function Star() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 fill-current drop-shadow-[0_2px_8px_rgba(251,191,36,.35)]"
      aria-hidden
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
