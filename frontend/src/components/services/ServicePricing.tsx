// src/components/services/ServicePricing.tsx
import PricingCard, { PricingTier, RGB } from './PricingCard';

type Props = {
  pricing?: PricingTier[];
  accentFrom: RGB;
  accentTo: RGB;
  title?: string;
  subtitle?: string;
  className?: string;
};

const FALLBACK: PricingTier[] = [
  {
    name: 'Старт',
    price: 'от $490',
    period: 'проект',
    features: ['1–2 концепта', 'Базовая анимация/модули', 'Срок 5–7 дней'],
    ctaHref: '#contact',
  },
  {
    name: 'Pro',
    price: 'от $1200',
    period: 'проект',
    features: ['3–4 концепта', 'UI-система, адаптив', 'Интерактив', '10–14 дней'],
    popular: true,
    note: 'Оптимально для малого/среднего бизнеса',
    ctaHref: '#contact',
  },
  {
    name: 'Enterprise',
    price: 'по запросу',
    features: ['R&D, исследование', 'Дизайн-система', 'Углубленная анимация', 'Поддержка и развитие'],
    ctaHref: '#contact',
  },
];

/** добиваем до трёх карточек */
function normalizeToThree(src?: PricingTier[]): PricingTier[] {
  const base = (src && src.length ? src : FALLBACK).slice(0, 3);
  if (base.length === 1) return [...base, FALLBACK[1], FALLBACK[2]];
  if (base.length === 2) return [...base, FALLBACK[2]];
  return base;
}

export default function ServicePricing({
  pricing,
  accentFrom,
  accentTo,
  title = 'Стоимость',
  subtitle = 'Прозрачные пакеты под задачи',
  className,
}: Props) {
  const tiers = normalizeToThree(pricing);

  return (
    <section id="pricing" className="oc-section">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm text-white/50">{subtitle}</p>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold">{title}</h2>
        </div>

        {/* ТРИ КОЛОНКИ уже с lg */}
        <div className="grid gap-6 md:gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <PricingCard
              key={`${t.name}-${i}`}
              tier={t}
              accentFrom={accentFrom}
              accentTo={accentTo}
              className="min-h-[280px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
