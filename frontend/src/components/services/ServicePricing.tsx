// src/components/services/ServicePricing.tsx
import PricingCard, { type PricingTier, type RGB } from './PricingCard';

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
    name: 'Starter',
    price: 'from $100',
    period: 'project',
    features: ['1–2 concepts', 'Basic animation', '3–7 days'],
    ctaHref: '#contact',
  },
  {
    name: 'Pro',
    price: 'from $200',
    period: 'project',
    features: ['3–4 concepts', 'UI motion system', 'Interactive details', '7–10 days'],
    popular: true,
    note: 'Best for small/medium businesses',
    ctaHref: '#contact',
  },
  {
    name: 'Enterprise',
    price: 'custom',
    features: ['R&D', 'Design system', 'Advanced animation', 'Support & growth'],
    ctaHref: '#contact',
  },
];

function normalizeToThree(src?: PricingTier[]): PricingTier[] {
  const base = (src?.length ? src : FALLBACK).slice(0, 3);
  if (base.length === 1) return [...base, FALLBACK[1], FALLBACK[2]];
  if (base.length === 2) return [...base, FALLBACK[2]];
  return base;
}

export default function ServicePricing({
  pricing,
  accentFrom,
  accentTo,
  title = 'Pricing',
  subtitle = 'Transparent packages that fit your scope',
}: Props) {
  const tiers = normalizeToThree(pricing);

  return (
    <section id="pricing" className="oc-section section-soft">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="mb-6 md:mb-8">
          <p className="text-sm text-white/50">{subtitle}</p>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold">{title}</h2>
        </div>

        <div className="grid gap-6 md:gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <PricingCard
              key={`${t.name}-${i}`}
              tier={t}
              accentFrom={accentFrom}
              accentTo={accentTo}
              className="min-h-[380px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
