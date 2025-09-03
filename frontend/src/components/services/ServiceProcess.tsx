import type React from 'react';
import { Sparkles, Target, FlaskConical, PenTool, Rocket } from 'lucide-react';
import clsx from 'clsx';
import type { RGB } from './PricingCard';

type CSSVarKeys = '--acc1' | '--acc2' | '--ring-w' | '--holo-alpha';
type CSSVars = React.CSSProperties & Partial<Record<CSSVarKeys, string>>;

type Step = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

type Props = {
  accentFrom: RGB;
  accentTo: RGB;
  title?: string;
  steps?: Step[];
  className?: string;
};

/**
 * Секция «Процесс» — компактные .hcard-карточки шагов
 */
export default function ServiceProcess({
  accentFrom,
  accentTo,
  title = 'Как мы работаем',
  steps,
  className,
}: Props) {
  const vars: CSSVars = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
  };

  const items: Step[] =
    steps ??
    [
      { title: 'Бриф', desc: 'Цели, аудитория, дедлайны', icon: <Target size={18} /> },
      { title: 'Исследование', desc: 'Рефы, мудборды, гипотезы', icon: <FlaskConical size={18} /> },
      { title: 'Концепт', desc: 'Первые варианты: статик/движ', icon: <PenTool size={18} /> },
      { title: 'Производство', desc: 'Дизайн, анимация, интеграции', icon: <Sparkles size={18} /> },
      { title: 'Запуск', desc: 'Поддержка, улучшения', icon: <Rocket size={18} /> },
    ];

  return (
    <section id="process" className={clsx('oc-section', className)}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 md:mb-10">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
          {items.map((s, i) => (
            <div key={`${s.title}-${i}`} className="hcard group" style={vars}>
              <div className="hcard-body p-5 md:p-6 relative min-h-[150px]">
                <div className="hcard-engrave" />
                <div className="hcard-shine" />

                <div className="absolute right-3 top-3 opacity-70">{s.icon}</div>

                <div className="relative z-10">
                  <div className="text-sm text-white/60">0{i + 1}</div>
                  <div className="mt-1.5 text-lg font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-white/70 leading-relaxed">{s.desc}</div>
                </div>

                {/* мягкие «искры» при ховере */}
                <div
                  className={clsx(
                    'pointer-events-none absolute -inset-8 rounded-[26px] opacity-0',
                    'bg-[radial-gradient(40px_30px_at_70%_30%,rgba(255,255,255,.14),transparent_70%)]',
                    'group-hover:opacity-100 transition-opacity duration-500'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
