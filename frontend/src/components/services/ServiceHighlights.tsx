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

type Props = { accentFrom: RGB; accentTo: RGB };

const ITEMS = [
  { title: 'Motion-пакеты', desc: 'Рилсы, product motion, рекламные клипы под цели', icon: Workflow },
  { title: 'Стиль и гайд', desc: 'Градиенты, шумы, формы и ритм — единая система', icon: Palette },
  { title: 'Адаптация', desc: 'Версии для соцсетей, сайтов и презентаций', icon: MonitorSmartphone },
  { title: 'Скорость', desc: 'Итерации каждую неделю, демо по чекпоинтам', icon: Gauge },
  { title: 'Тонкие детали', desc: 'Микроанимация, параллакс, шум/зерно, преломления', icon: Sparkles },
  { title: 'Готово к продакшену', desc: 'Экспорт исходников и аккуратный хэнд-офф', icon: Rocket },
];

export default function ServiceHighlights({ accentFrom, accentTo }: Props) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };

  return (
    <section className="oc-section px-6 md:px-16" style={vars}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-sm text-white/60">Что вы получаете</p>
        <h2 className="text-3xl md:text-4xl font-semibold mt-1">Пакет на вырост</h2>

        <div className="hlx-grid grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {ITEMS.map(({ title, desc, icon: Icon }) => (
            <Tile key={title} title={title} desc={desc} icon={<Icon size={16} />} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- интерактивная плитка ---------- */
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

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--mx', `${mx.toFixed(2)}%`);
    el.style.setProperty('--my', `${my.toFixed(2)}%`);
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onMove(e);
    setRipKey((k) => k + 1);
  };

  return (
    <article
      ref={cardRef}
      className="hlx-card group"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      tabIndex={0}
    >
      {/* FX слой */}
      <div aria-hidden className="hlx-fx">
        <div className="hlx-spot" />
        <div className="hlx-orbit">
          <span className="hlx-comet a" />
          <span className="hlx-comet b" />
        </div>
        <div key={ripKey} className="hlx-ripple" />
      </div>

      {/* контент */}
      <header className="flex items-center gap-3">
        <div className="hlx-ico">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </header>
      <p className="hlx-desc">{desc}</p>
    </article>
  );
}
