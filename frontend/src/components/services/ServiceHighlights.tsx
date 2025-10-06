'use client';

import { useRef, useState } from 'react';
import type { CSSVars, RGB } from '@/types/ui';
import {
  Workflow,
  Palette,
  MonitorSmartphone,
  Gauge,
  Sparkles,
  Rocket,
} from 'lucide-react';

type IconMapKey = 'workflow' | 'palette' | 'monitor' | 'gauge' | 'sparkles' | 'rocket';

const ICONS: Record<IconMapKey, React.ComponentType<{ size?: number }>> = {
  workflow: Workflow,
  palette: Palette,
  monitor: MonitorSmartphone,
  gauge: Gauge,
  sparkles: Sparkles,
  rocket: Rocket,
};

type Item = { title: string; desc: string; icon?: IconMapKey };

type Props = {
  accentFrom: RGB;
  accentTo: RGB;
  items?: Item[];
  title?: string;
  subtitle?: string;
};

const FALLBACK: Item[] = [
  { title: 'Systematic', desc: 'Consistent visuals you can scale', icon: 'workflow' },
  { title: 'Style', desc: 'Clean grids, colors and types', icon: 'palette' },
  { title: 'Responsive', desc: 'Looks great on any screen', icon: 'monitor' },
  { title: 'Fast', desc: 'We move quickly and iterate', icon: 'gauge' },
  { title: 'Details', desc: 'Small touches that matter', icon: 'sparkles' },
  { title: 'Handoff', desc: 'Clear sources and specs', icon: 'rocket' },
];

export default function ServiceHighlights({
  accentFrom,
  accentTo,
  items,
  title = 'What you get',
  subtitle = 'Value that compounds',
}: Props) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };
  const list = items && items.length ? items : FALLBACK;

  return (
    <section className="oc-section px-6 md:px-16 section-soft" style={vars}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-sm text-white/60">{subtitle}</p>
        <h2 className="text-3xl md:text-4xl font-semibold mt-1">{title}</h2>

        <div className="hlx-grid grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {list.map(({ title: t, desc, icon }, i) => {
            const Icon = icon ? ICONS[icon] : undefined;
            return (
              <Tile
                key={`${t}-${i}`}
                title={t}
                desc={desc}
                icon={Icon ? <Icon size={16} /> : null}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- interactive tile ---------- */
function Tile({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripKey, setRipKey] = useState(0);
  const [hovering, setHovering] = useState(false);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    // обновляем координаты только когда реально ховерим,
    // чтобы при уходе курсора они не «прыгали» в центр
    if (!hovering) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--mx', `${mx.toFixed(2)}%`);
    el.style.setProperty('--my', `${my.toFixed(2)}%`);
  };

  const onEnter = () => {
    setHovering(true);
  };

  const onLeave = () => {
    setHovering(false); // ← сразу гасим свечение (opacity: 0), позицию НЕ трогаем
    // Никаких setProperty('--mx/--my', '50%') — ничего не «едет» к центру
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // обновим координаты, чтоб ripple стартовал из точки клика
    if (hovering) onMove(e);
    setRipKey((k) => k + 1);
  };

  return (
    <article
      ref={cardRef}
      className="hlx-card group"
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      tabIndex={0}
    >
      {/* FX layer */}
      <div aria-hidden className="hlx-fx">
        {/* спотлайт: при отсутствии ховера принудительно скрываем без «поездки» к центру */}
        <div
          className="hlx-spot"
          style={{
            opacity: hovering ? undefined : 0,
            transition: 'opacity 100ms ease', // быстрое гашение
          }}
        />
        <div className="hlx-orbit">
          <span className="hlx-comet a" />
          <span className="hlx-comet b" />
        </div>
        <div key={ripKey} className="hlx-ripple" />
      </div>

      {/* content */}
      <header className="flex items-center gap-3">
        <div className="hlx-ico">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </header>
      <p className="hlx-desc">{desc}</p>
    </article>
  );
}
