'use client';

import * as React from 'react';
import Image from 'next/image';

/* ====================== Data ====================== */

type Testimonial = {
  text: string;
  author: string;
  role: string;
  avatar: string;
};

const ALL: Testimonial[] = [
  {
    text:
      'OverCreate combined motion, brand and engineering into one consistent story. Clear process, clean UI — zero chaos.',
    author: 'Alex Johnson',
    role: 'Product Lead, Helix',
    avatar: '/avatars/Alex-Johnson.jpg',
  },
  {
    text:
      'We shipped a full redesign in weeks. Fast feedback loops, thoughtful decisions, strong craft.',
    author: 'Maria-Chen',
    role: 'Marketing Director, Nova',
    avatar: '/avatars/Maria-Chen.jpg',
  },
  {
    text:
      'Design language, component system and code quality — everything aligned. Launch day was boring (the best kind).',
    author: 'Igor Petrov',
    role: 'Founder, Loop',
    avatar: '/avatars/Avatar-1-girl.jpg',
  },
  {
    text:
      'Great communication and clear milestones. Modern stack, smooth delivery, zero headaches.',
    author: 'Jamie Lee',
    role: 'CEO, Orbit',
    avatar: '/avatars/Jamie-Lee.jpg',
  },
  {
    text:
      'Pixel-perfect visuals, performance is tight, codebase is clean. Team you can trust.',
    author: 'Nora White',
    role: 'COO, Finch',
    avatar: '/avatars/Nora-White.jpg',
  },
  {
    text:
      'Fast iterations and high attention to detail. Strong partners for long-term projects.',
    author: 'David Ruiz',
    role: 'Head of Product, Lumen',
    avatar: '/avatars/David-Ruiz.jpg',
  },
  {
    text:
      'Great synergy between design and development. Hand-off is painless, docs are tidy.',
    author: 'Greg Berg',
    role: 'CTO, Beacon',
    avatar: '/avatars/Greg-Berg.jpg',
  },
  {
    text:
      'From brief to launch — clear, fast, reliable. Highly recommend.',
    author: 'Olivia Park',
    role: 'Design Lead, Colect',
    avatar: '/avatars/Olivia-Park.jpg',
  },
    {
    text:
      'Clear communication, quick iterations, and a solid design system. Shipping with confidence became our default.',
    author: 'Sara Collins',
    role: 'Product Manager, Kite',
    avatar: '/avatars/Sara-Collins.jpg',
  },
  {
    text:
      'From rough idea to polished launch in record time. The team was proactive and detail-oriented throughout.',
    author: 'Michael Young',
    role: 'Founder, Flux',
    avatar: '/avatars/Michael-Young.jpg',
  },
  {
    text:
      'They translated complex requirements into a clean UX with zero friction. Dev handoff was the smoothest we had.',
    author: 'Priya Patel',
    role: 'Head of Design, Vertex',
    avatar: '/avatars/Priya-Patel.jpg',
  },
  {
    text:
      'Performance, accessibility, and visual quality — all first-class. We finally look like the product we are.',
    author: 'Liam Turner',
    role: 'CTO, Beacon Labs',
    avatar: '/avatars/Liam-Turner.jpg',
  },
  {
    text:
      'Consistent delivery week after week. Strong opinions when needed, and always backed by data.',
    author: 'Emily Rogers',
    role: 'Growth Lead, North',
    avatar: '/avatars/Emily-Rogers.jpg',
  },
  {
    text:
      'Their component library saved our team months. Clear docs, reliable patterns, easy to extend.',
    author: 'Tom Williams',
    role: 'Engineering Manager, Delta',
    avatar: '/avatars/Tom-Williams.jpg',
  },
  {
    text:
      'Sharp visuals and production-ready code in one package. We shipped the rebrand without a single surprise.',
    author: 'Julia Novak',
    role: 'Brand Director, Orbit',
    avatar: '/avatars/Julia-Novak.jpg',
  },
  {
    text:
      'Every milestone was hit on time. Transparent planning and zero last-minute chaos.',
    author: 'Daniel Kim',
    role: 'Operations Lead, Lumen',
    avatar: '/avatars/Daniel-Kim.jpg',
  },
  {
    text:
      'They elevated our product with thoughtful motion. Subtle, purposeful, and performant.',
    author: 'Ava Morales',
    role: 'Design Lead, Hubble',
    avatar: '/avatars/Ava-Morales.jpg',
  },
  {
    text:
      'Our admin UX went from clunky to obvious. Support tickets dropped immediately after launch.',
    author: 'Victor Almeida',
    role: 'Customer Success, Pulse',
    avatar: '/avatars/Victor-Almeida.jpg',
  },
  {
    text:
      'Great partner for a fast-moving startup. Pragmatic decisions, crisp execution, zero ego.',
    author: 'Zoe Fisher',
    role: 'CEO, Nook',
    avatar: '/avatars/Zoe-Fisher.jpg',
  },
  {
    text:
      'They built a robust design system that scales. New features feel native instead of bolted on.',
    author: 'Noah Bennett',
    role: 'VP Product, Alloy',
    avatar: '/avatars/Noah-Bennett.jpg',
  },
  {
    text:
      'The web experience finally matches our brand. Page speed is excellent and the details sing.',
    author: 'Hannah Schultz',
    role: 'Marketing Lead, Aurora',
    avatar: '/avatars/Hannah-Schultz.jpg',
  },
  {
    text:
      'Clear specs, clean pull requests, and thoughtful reviews. Collaboration felt effortless.',
    author: 'Ethan Bryant',
    role: 'Senior Engineer, Core',
    avatar: '/avatars/Ethan-Bryant.jpg',
  },
  {
    text:
      'Prototype on Monday, validated by Friday. They kept us focused on outcomes, not outputs.',
    author: 'Maya Singh',
    role: 'Research Lead, Atlas',
    avatar: '/avatars/Maya-Singh.jpg',
  },
  {
    text:
      'Motion guidelines and micro-interactions made our product feel alive — without hurting performance.',
    author: 'Lucas Romero',
    role: 'Design Engineer, Helio',
    avatar: '/avatars/Lucas-Romero.jpg',
  },
  {
    text:
      'We migrated to a modern stack with zero downtime. Monitoring and rollout were top-notch.',
    author: 'Isabella Costa',
    role: 'Platform Lead, Merge',
    avatar: '/avatars/Isabella-Costa.jpg',
  },

];

/* ======== детерминированный «рандом» (одинаковый на SSR и CSR) ======== */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number) {
  const rnd = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ====================== Card ====================== */

function Card({ t }: { t: Testimonial }) {
  return (
    <article
      className={[
        'relative z-0 w-[520px] max-w-full isolation-isolate',
        'rounded-3xl border border-white/10 bg-white/[.035] backdrop-blur-sm',
        'px-6 py-5 md:px-7 md:py-6',
        'shadow-[0_10px_40px_-15px_rgba(0,0,0,.55)]',
        'transition-all duration-400',
        'hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,.8)]',
        'group',
      ].join(' ')}
      style={{
        backgroundImage:
          'radial-gradient(120% 60% at 50% -20%, rgba(255,255,255,.06), transparent 60%)',
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 z-0 rounded-3xl opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(420px 260px at 30% 0%, rgba(255,255,255,.06), transparent 60%), radial-gradient(420px 260px at 70% 0%, rgba(255,255,255,.05), transparent 60%)',
        }}
        aria-hidden
      />
      <p className="relative z-10 pr-2 text-white/85">
        <span className="mr-2 text-xl align-text-top text-white/50">“</span>
        {t.text}
        <span className="ml-2 text-xl align-text-top text-white/50">”</span>
      </p>
      <div className="relative z-10 mt-5 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15">
          <Image
            src={t.avatar}
            alt={t.author}
            width={40}
            height={40}
            sizes="40px"
            className="h-10 w-10 object-cover"
            loading="lazy"
          />
        </div>
        <div className="leading-tight">
          <div className="font-medium text-white">{t.author}</div>
          <div className="text-xs text-white/60">{t.role}</div>
        </div>
      </div>
    </article>
  );
}

/* ====================== Row (seamless) ====================== */

type RowProps<T> = {
  items: T[];
  render: (t: T, i: number) => React.ReactNode;
  reverse?: boolean;
  speedPx?: number; // px/sec
  gap?: number; // px
  className?: string;
};

function Row<T>({
  items,
  render,
  reverse,
  speedPx = 48,
  gap = 24,
  className,
}: RowProps<T>) {
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const unitRef = React.useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = React.useState(6);

  useSeamlessMarquee({
    outerRef,
    railRef,
    unitRef,
    speedPx,
    reverse,
    gap,
    onCopiesNeeded: (unitW, wrapW) => {
      const need = Math.max(6, Math.ceil((wrapW + unitW * 2) / Math.max(1, unitW)));
      setCopies(need);
    },
  });

  const Unit = (
    <div ref={unitRef} className="flex shrink-0" style={{ columnGap: `${gap}px` }}>
      {items.map((it, i) => (
        <div key={i} className="shrink-0">
          {render(it, i)}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={outerRef}
      className={['relative overflow-x-hidden overflow-y-visible py-6', className || ''].join(' ')}
      style={{
        WebkitMaskImage:
          'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 3%, rgba(0,0,0,1) 97%, rgba(0,0,0,0) 100%)',
        maskImage:
          'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 3%, rgba(0,0,0,1) 97%, rgba(0,0,0,0) 100%)',
      }}
    >
      <div ref={railRef} className="flex will-change-transform" style={{ columnGap: `${gap}px` }}>
        {Array.from({ length: copies }).map((_, k) => (
          <React.Fragment key={k}>{Unit}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ====================== Marquee hook ====================== */

function useSeamlessMarquee({
  outerRef,
  railRef,
  unitRef,
  speedPx = 40,
  reverse,
  gap = 24,
  onCopiesNeeded,
}: {
  outerRef: React.RefObject<HTMLDivElement | null>;
  railRef: React.RefObject<HTMLDivElement | null>;
  unitRef: React.RefObject<HTMLDivElement | null>;
  speedPx?: number;
  reverse?: boolean;
  gap?: number;
  onCopiesNeeded?: (unitWidth: number, wrapperWidth: number) => void;
}) {
  const remeasure = React.useCallback(() => {
    const unit = unitRef.current;
    const outer = outerRef.current;
    if (!unit || !outer) return { unitW: 0, wrapW: 0 };

    const kids = Array.from(unit.children) as HTMLElement[];
    const widths = kids.map((el) => el.getBoundingClientRect().width);
    const unitW = widths.reduce((s, w) => s + w, 0) + Math.max(0, widths.length - 1) * gap;
    const wrapW = outer.clientWidth;

    onCopiesNeeded?.(unitW, wrapW);
    return { unitW: Math.max(1, unitW), wrapW };
  }, [gap, onCopiesNeeded]);

  React.useEffect(() => {
    let raf = 0;
    const tStart = performance.now();

    let unitW = 1;
    unitW = Math.max(1, remeasure().unitW);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pixelSnap = 1 / dpr;

    const ro = new ResizeObserver(() => {
      const m = remeasure();
      unitW = Math.max(1, m.unitW);
    });
    if (unitRef.current) ro.observe(unitRef.current);
    if (outerRef.current) ro.observe(outerRef.current);

    const imgs = unitRef.current?.querySelectorAll('img') || [];
    const onLoad = () => {
      const m = remeasure();
      unitW = Math.max(1, m.unitW);
    };
    imgs.forEach((img) => {
      if (img instanceof HTMLImageElement && !img.complete) {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });

    const tick = (t: number) => {
      const rail = railRef.current;
      if (!rail || unitW <= 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = (t - tStart) / 1000;
      const dist = (dt * speedPx) % unitW;

      // Всегда двигаем влево; reverse = начать с другого края
      const offset = reverse ? (unitW - dist) : dist;
      let x = -offset;

      x = Math.round(x / pixelSnap) * pixelSnap;
      rail.style.transform = `translate3d(${x}px,0,0)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      imgs.forEach((img) => {
        if (img instanceof HTMLImageElement) {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onLoad);
        }
      });
    };
  }, [gap, outerRef, railRef, remeasure, reverse, speedPx, unitRef]);
}

/* ====================== Section ====================== */

export default function Testimonials() {
  // детерминированный порядок — НЕТ случайностей => НЕТ ошибок гидрации
  const row1 = ALL;
  const row2 = seededShuffle(ALL, 1337);
  const row3 = seededShuffle(ALL, 424242);

  return (
    <section id="testimonials" className="oc-section oc-section--flat px-6 md:px-16 py-16">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-white">What clients say</h2>
        <p className="mt-2 text-white/65">
          A small selection of feedback from teams we helped ship and grow.
        </p>

        <div className="mt-8 space-y-6">
          <Row items={row1} speedPx={46} gap={24} render={(t) => <Card t={t} />} />
          <Row items={row2} reverse speedPx={54} gap={24} render={(t) => <Card t={t} />} />
          <Row items={row3} speedPx={40} gap={24} render={(t) => <Card t={t} />} />
        </div>
      </div>
    </section>
  );
}
