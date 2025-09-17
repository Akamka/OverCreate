// src/lib/services.config.ts
export type RGB = [number, number, number];

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  popular?: boolean;
  note?: string;
};

export type ServiceConfig = {
  title: string;
  desc: string;
  acc1: RGB;
  acc2: RGB;
  pricing?: PricingTier[];
};

// ✅ закрепляем единый слаг "printing"
export const SERVICES = {
  motion: {
    title: 'Моушн-дизайн',
    desc: 'Рилсы, анимации, product motion',
    acc1: [56, 189, 248],
    acc2: [168, 85, 247],
    pricing: [
      { name: 'Старт', price: 'от $490', period: 'проект', features: ['1–2 концепта', 'Базовая анимация', '5–7 дней'], ctaHref: '#contact' },
      { name: 'Pro',   price: 'от $1200', period: 'проект', features: ['3–4 концепта','UI-система','Интерактив','10–14 дней'], popular: true, ctaHref: '#contact' },
    ],
  },
  graphic: {
    title: 'Графический дизайн',
    desc: 'Айдентика, постеры, печать',
    acc1: [120, 255, 194],
    acc2: [241, 90, 255],
  },
  web: {
    title: 'Веб-дизайн',
    desc: 'UI/UX, лендинги, сайты',
    acc1: [78, 191, 255],
    acc2: [255, 170, 120],
  },
  dev: {
    title: 'Разработка',
    desc: 'Next.js, Laravel, интеграции',
    acc1: [139, 92, 246],
    acc2: [56, 189, 248],
  },
  printing: {
    title: 'Цифровая печать',
    desc: 'Визитки, плакаты, наружка',
    acc1: [255, 170, 120],
    acc2: [120, 255, 194],
  },
} as const satisfies Record<string, ServiceConfig>;

// строгий тип из реальных ключей
export type ServiceSlug = keyof typeof SERVICES;
