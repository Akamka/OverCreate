'use client';

import { useRef, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import {
  Target,
  FlaskConical,
  Lightbulb,
  Cog,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type { RGB } from '@/types/ui';

// ключи иконок, как в services.config.ts
type ProcessIconKey = 'target' | 'flask' | 'lightbulb' | 'cog' | 'rocket';

// Маппер ключ -> компонент (на клиенте – безопасно)
const ICONS: Record<ProcessIconKey, LucideIcon> = {
  target: Target,
  flask: FlaskConical,
  lightbulb: Lightbulb,
  cog: Cog,
  rocket: Rocket,
};

// То, что приходит в пропсах из page.tsx (plain объект, без функций)
type StepIn = { title: string; desc: string; icon?: ProcessIconKey };

// Внутренний тип уже с компонентом-иконкой
type Step = { title: string; desc: string; Icon?: LucideIcon };

// Фолбэк (как у тебя было)
const FALLBACK: Step[] = [
  { title: 'Brief',      desc: 'Goals, audience, timeline',            Icon: Target },
  { title: 'Research',   desc: 'References and hypotheses',            Icon: FlaskConical },
  { title: 'Concept',    desc: 'First directions: static/motion',      Icon: Lightbulb },
  { title: 'Production', desc: 'Design, animation, integrations',      Icon: Cog },
  { title: 'Launch',     desc: 'Handoff, support and improvements',    Icon: Rocket },
];

type Props = {
  accentFrom: RGB;
  accentTo: RGB;
  className?: string;
  steps?: StepIn[];                    // ← сюда теперь приходят только строки и текст
  title?: string;
};

type VarKeys = '--acc1' | '--acc2' | '--p' | '--count';
type ProcessVars = CSSProperties & Record<VarKeys, string>;

export default function ServiceProcess({
  accentFrom,
  accentTo,
  className,
  steps,
  title = 'How we work',
}: Props) {
  // Преобразуем пришедшие шаги в шаги с икон-компонентами.
  const STEPS: Step[] =
    steps && steps.length
      ? steps.map((s, i) => ({
          title: s.title,
          desc: s.desc,
          Icon: s.icon ? ICONS[s.icon] : FALLBACK[i]?.Icon, // если ключа нет — берём из FALLBACK по индексу
        }))
      : FALLBACK;

  const [active, setActive] = useState(0);
  const resetTimer = useRef<number | null>(null);
  const HOLD_MS = 900;

  const clearReset = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  };
  const scheduleReset = () => {
    clearReset();
    resetTimer.current = window.setTimeout(() => {
      setActive(0);
      resetTimer.current = null;
    }, HOLD_MS);
  };
  const setActiveNow = (i: number) => {
    clearReset();
    setActive(i);
  };

  const p = (active / (STEPS.length - 1)) * 100;
  const vars: ProcessVars = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
    '--p': `${p}%`,
    '--count': String(STEPS.length),
  };

  return (
    <section
      className={clsx('oc-section px-6 md:px-16 relative section-soft', className)}
      style={vars}
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-white/90 text-2xl md:text-3xl font-semibold">{title}</h2>

        <div className="proc-wrap relative mt-6 md:mt-8">
          {/* Cards */}
          <div className="proc-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <button
                key={`${s.title}-${i}`}
                type="button"
                className="proc-card group text-left"
                onFocus={() => setActiveNow(i)}
                onMouseEnter={() => setActiveNow(i)}
                onMouseLeave={scheduleReset}
                onBlur={scheduleReset}
              >
                <span aria-hidden className="proc-ring" />
                <div className="flex items-start justify-between">
                  <span className="proc-num">{String(i + 1).padStart(2, '0')}</span>
                  {s.Icon ? (
                    <s.Icon
                      size={18}
                      className="opacity-80"
                      style={{ color: 'rgb(var(--acc2))' }}
                    />
                  ) : null}
                </div>
                <div className="mt-3">
                  <div className="text-white font-semibold">{s.title}</div>
                  <div className="proc-desc">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Track below the grid */}
          <div className="proc-track">
            <span className="proc-fill" />
            <span className="proc-runner" />
          </div>
        </div>
      </div>
    </section>
  );
}
