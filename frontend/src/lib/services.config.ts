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

export type HighlightIcon =
  | 'workflow'
  | 'palette'
  | 'monitor'
  | 'gauge'
  | 'sparkles'
  | 'rocket';

export type ProcessIcon = 'target' | 'flask' | 'lightbulb' | 'cog' | 'rocket';

export type FAQItem = { q: string; a: string };

export type SectionTitles = {
  highlightsTitle?: string;
  highlightsSubtitle?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  processTitle?: string;
  faqTitle?: string;
  /** <-- добавлено: */
  faqSubtitle?: string;
};

export type ServiceConfig = {
  title: string;
  desc: string;
  acc1: RGB;
  acc2: RGB;

  pricing?: PricingTier[];
  highlights?: Array<{ title: string; desc: string; icon?: HighlightIcon }>;
  process?: Array<{ title: string; desc: string; icon?: ProcessIcon }>;
  faq?: FAQItem[];

  sectionTitles?: SectionTitles;
};

export const SERVICES = {
  /** Violet theme (already used) */
  motion: {
    title: 'Motion Design',
    desc: 'Short-form reels, 2D/3D animations and product motion for ads & socials.',
    acc1: [168, 85, 247], // purple
    acc2: [217, 70, 239], // fuchsia

    sectionTitles: {
      highlightsTitle: 'What you get',
      highlightsSubtitle: 'Designed motion system you can scale',
      pricingTitle: 'Pricing',
      pricingSubtitle: 'Transparent packages to match your goals',
      processTitle: 'How we work',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Short answers to common things',
    },

    pricing: [
      {
        name: 'Start',
        price: 'from $490',
        period: 'per project',
        features: ['1–2 concepts', 'Basic motion', '5–7 days'],
        ctaHref: '#contact',
      },
      {
        name: 'Pro',
        price: 'from $1200',
        period: 'per project',
        features: ['3–4 concepts', 'Design system', 'Interactive elements', '10–14 days'],
        popular: true,
        note: 'Best for SMB and product promo',
        ctaHref: '#contact',
      },
      {
        name: 'Enterprise',
        price: 'on request',
        features: ['R&D', 'Extended design system', 'Complex animation', 'Handoff & support'],
        ctaHref: '#contact',
      },
    ],

    highlights: [
      { title: 'Motion kit', desc: 'Reels, product motion and ad clips mapped to goals', icon: 'workflow' },
      { title: 'Style guide', desc: 'Gradients, grain, shapes and rhythm as a single system', icon: 'palette' },
      { title: 'Adaptations', desc: 'Versions for socials, websites and decks', icon: 'monitor' },
      { title: 'Speed', desc: 'Weekly iterations and checkpoint demos', icon: 'gauge' },
      { title: 'Fine details', desc: 'Micro-animation, parallax, grain and refractions', icon: 'sparkles' },
      { title: 'Production-ready', desc: 'Exported sources and tidy hand-off', icon: 'rocket' },
    ],

    process: [
      { title: 'Brief', desc: 'Goals, audience, deadlines', icon: 'target' },
      { title: 'Research', desc: 'References, moodboards, hypotheses', icon: 'flask' },
      { title: 'Concept', desc: 'First static/motion variants', icon: 'lightbulb' },
      { title: 'Production', desc: 'Design, animation, integrations', icon: 'cog' },
      { title: 'Launch', desc: 'Sources, hand-off, support', icon: 'rocket' },
    ],

    faq: [
      { q: 'How long does a project take?', a: 'Usually 5–14 days: rough cuts in 2–3 days, then iterations and final.' },
      { q: 'What delivery formats do you use?', a: 'MP4/WebM and GIF for socials, AE/Figma sources if needed.' },
      { q: 'Can you follow a brand guide?', a: 'Yes. We align motion to your brand or assemble a quick micro-guide.' },
      { q: 'What’s the workflow?', a: 'Brief → refs → 1–2 concepts → approval → production → export & handoff.' },
    ],
  } satisfies ServiceConfig,

  /** Green theme */
  graphic: {
    title: 'Graphic Design',
    desc: 'Branding, posters and print assets with consistent visual systems.',
    acc1: [34, 197, 94],   // emerald
    acc2: [120, 255, 194], // mint

    sectionTitles: {
      highlightsTitle: 'What you get',
      highlightsSubtitle: 'Consistent branding assets for print & digital',
      pricingTitle: 'Pricing',
      pricingSubtitle: 'Pick a package or request a custom scope',
      processTitle: 'How we work',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Guidance for print & identity',
    },

    pricing: [
      {
        name: 'Logo & Basics',
        price: 'from $450',
        period: 'per project',
        features: ['Logo + colors + typography', 'Simple brand usage', '2–3 days'],
        ctaHref: '#contact',
      },
      {
        name: 'Identity',
        price: 'from $900',
        period: 'per project',
        features: ['Logo system', 'Stationery kit', 'Social templates', '4–7 days'],
        popular: true,
        ctaHref: '#contact',
      },
      {
        name: 'Campaign',
        price: 'on request',
        features: ['Posters & OOH', 'Key visuals', 'Print production support'],
        ctaHref: '#contact',
      },
    ],

    highlights: [
      { title: 'Clear brand core', desc: 'Logo, palette, type and usage rules', icon: 'palette' },
      { title: 'Print-ready', desc: 'Bleeds, color profiles and prepress are covered', icon: 'workflow' },
      { title: 'Digital templates', desc: 'Social tiles and stories that match the brand', icon: 'monitor' },
      { title: 'Campaign visuals', desc: 'OOH and poster systems with hierarchy', icon: 'gauge' },
      { title: 'Care for details', desc: 'Kerning, grids and image treatment', icon: 'sparkles' },
      { title: 'Scalable system', desc: 'Files and guidelines for your team', icon: 'rocket' },
    ],

    process: [
      { title: 'Discovery', desc: 'Brand goals and constraints', icon: 'target' },
      { title: 'Exploration', desc: 'Moodboards and directions', icon: 'flask' },
      { title: 'Design', desc: 'Logo and key assets', icon: 'lightbulb' },
      { title: 'Systemization', desc: 'Templates and specs', icon: 'cog' },
      { title: 'Delivery', desc: 'Print-ready files & guide', icon: 'rocket' },
    ],

    faq: [
      { q: 'Do you handle print specs?', a: 'Yes, we prepare CMYK, bleeds and print-ready PDFs.' },
      { q: 'Can we iterate on the logo?', a: 'We include 2–3 concept rounds with revisions.' },
    ],
  } satisfies ServiceConfig,

  /** Blue theme */
  web: {
    title: 'Web Design',
    desc: 'UI/UX for landing pages and websites with clean systems and motion.',
    acc1: [59, 130, 246],  // blue
    acc2: [78, 191, 255],  // sky

    sectionTitles: {
      highlightsTitle: 'What you get',
      highlightsSubtitle: 'Systematic UI with fast hand-off',
      pricingTitle: 'Pricing',
      pricingSubtitle: 'From a single landing to multi-page sites',
      processTitle: 'How we work',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Design, motion and hand-off',
    },

    pricing: [
      {
        name: 'Landing',
        price: 'from $800',
        period: 'per project',
        features: ['Wireframes', 'UI kit', 'Responsive screens', 'Basic motion'],
        ctaHref: '#contact',
      },
      {
        name: 'Website',
        price: 'from $1800',
        period: 'per project',
        features: ['IA & flows', 'Design system', 'Animations', 'Handoff'],
        popular: true,
        ctaHref: '#contact',
      },
      {
        name: 'Web App',
        price: 'on request',
        features: ['Complex UX', 'Component library', 'Docs & tokens'],
        ctaHref: '#contact',
      },
    ],

    highlights: [
      { title: 'Information architecture', desc: 'Clear structure and conversion focus', icon: 'workflow' },
      { title: 'Design system', desc: 'Scalable components and tokens', icon: 'palette' },
      { title: 'Responsive', desc: 'Mobile → desktop with the same quality bar', icon: 'monitor' },
      { title: 'Performance', desc: 'Fast design patterns and assets', icon: 'gauge' },
      { title: 'Subtle motion', desc: 'Micro-interactions that guide the user', icon: 'sparkles' },
      { title: 'Handoff', desc: 'Well-documented specs for devs', icon: 'rocket' },
    ],

    process: [
      { title: 'Brief & goals', desc: 'KPIs and audience', icon: 'target' },
      { title: 'UX research', desc: 'Flows and wireframes', icon: 'flask' },
      { title: 'Visual design', desc: 'UI kit and screens', icon: 'lightbulb' },
      { title: 'Prototype', desc: 'Interaction and motion', icon: 'cog' },
      { title: 'Handoff', desc: 'Assets and docs', icon: 'rocket' },
    ],

    faq: [
      { q: 'Can you design in Figma?', a: 'Yes, we use Figma with components & variants.' },
      { q: 'Do you provide responsive screens?', a: 'We deliver mobile, tablet and desktop views.' },
    ],
  } satisfies ServiceConfig,

  /** Orange theme */
  dev: {
    title: 'Development',
    desc: 'Next.js, Laravel and integrations — production-ready delivery.',
    acc1: [245, 158, 11],   // amber
    acc2: [255, 170, 120],  // soft orange

    sectionTitles: {
      highlightsTitle: 'What you get',
      highlightsSubtitle: 'Modern stack and reliable delivery',
      pricingTitle: 'Pricing',
      pricingSubtitle: 'Scoping first, then fixed or time-&-materials',
      processTitle: 'How we work',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Tech & delivery details',
    },

    pricing: [
      {
        name: 'MVP',
        price: 'from $1500',
        period: 'per project',
        features: ['Next.js app', 'Tailwind/Design system', 'Auth & forms'],
        ctaHref: '#contact',
      },
      {
        name: 'Full Build',
        price: 'from $3500',
        period: 'per project',
        features: ['Custom API (Laravel)', 'Database & migrations', 'Deploy & CI'],
        popular: true,
        ctaHref: '#contact',
      },
      {
        name: 'Support',
        price: 'on request',
        features: ['Maintenance', 'New features', 'Monitoring'],
        ctaHref: '#contact',
      },
    ],

    highlights: [
      { title: 'Solid architecture', desc: 'Clean modules and domain logic', icon: 'workflow' },
      { title: 'Typed code', desc: 'TypeScript across the stack', icon: 'palette' },
      { title: 'Integrations', desc: 'Payments, auth, 3rd-party APIs', icon: 'monitor' },
      { title: 'Performance', desc: 'Caching, profiling, tuning', icon: 'gauge' },
      { title: 'DX & quality', desc: 'CI, tests and linting', icon: 'sparkles' },
      { title: 'Delivery', desc: 'Docker, deploys and docs', icon: 'rocket' },
    ],

    process: [
      { title: 'Scope', desc: 'Requirements and milestones', icon: 'target' },
      { title: 'Architecture', desc: 'Data model and services', icon: 'flask' },
      { title: 'Implementation', desc: 'Features & tests', icon: 'cog' },
      { title: 'Review', desc: 'QA and fixes', icon: 'lightbulb' },
      { title: 'Launch', desc: 'Deploy and monitoring', icon: 'rocket' },
    ],

    faq: [
      { q: 'Do you write tests?', a: 'Yes, unit/integration where it matters most.' },
      { q: 'Can you host for us?', a: 'We can set up Docker and CI or hand it off to your team.' },
    ],
  } satisfies ServiceConfig,

  /** Pink/Red theme */
  printing: {
    title: 'Digital Printing',
    desc: 'Business cards, posters and outdoor ads with pixel-perfect prepress.',
    acc1: [236, 72, 153], // pink
    acc2: [244, 63, 94],  // rose

    sectionTitles: {
      highlightsTitle: 'What you get',
      highlightsSubtitle: 'Neat designs and flawless print production',
      pricingTitle: 'Pricing',
      pricingSubtitle: 'From small runs to large format',
      processTitle: 'How we work',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Prepress & materials explained',
    },

    pricing: [
      {
        name: 'Business Cards',
        price: 'from $120',
        period: 'per set',
        features: ['Design + prepress', 'Paper & finish advice', '2–3 days'],
        ctaHref: '#contact',
      },
      {
        name: 'Posters',
        price: 'from $220',
        period: 'per project',
        features: ['Key visual', 'Sizes & layouts', 'Color profiles'],
        popular: true,
        ctaHref: '#contact',
      },
      {
        name: 'Outdoor',
        price: 'on request',
        features: ['Large format', 'Technical supervision', 'Delivery specs'],
        ctaHref: '#contact',
      },
    ],

    highlights: [
      { title: 'Color management', desc: 'CMYK profiles and soft-proofing', icon: 'palette' },
      { title: 'Prepress', desc: 'Bleeds, trims and dielines', icon: 'workflow' },
      { title: 'Large format', desc: 'Billboards and banners', icon: 'monitor' },
      { title: 'Deadlines', desc: 'We hit fixed print windows', icon: 'gauge' },
      { title: 'Finishings', desc: 'Foil, varnish, emboss — we guide you', icon: 'sparkles' },
      { title: 'Handoff', desc: 'Print-ready PDFs for your vendor', icon: 'rocket' },
    ],

    process: [
      { title: 'Brief', desc: 'Format, materials, timing', icon: 'target' },
      { title: 'Design', desc: 'Key visual and layouts', icon: 'lightbulb' },
      { title: 'Prepress', desc: 'Color, bleeds and checks', icon: 'cog' },
      { title: 'Proof', desc: 'Soft proof / sample', icon: 'flask' },
      { title: 'Delivery', desc: 'Final PDFs and specs', icon: 'rocket' },
    ],

    faq: [
      { q: 'Do you talk to the print shop?', a: 'Yes, we can handle specs and communication if needed.' },
      { q: 'Can you advise on paper and finish?', a: 'Absolutely — we help choose materials and finishing.' },
    ],
  } satisfies ServiceConfig,
} as const;

export type ServiceSlug = keyof typeof SERVICES;
