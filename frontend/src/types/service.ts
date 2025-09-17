// src/types/service.ts
import type { ServiceSlug as ServiceSlugFromConfig } from '@/lib/services.config';

export type RGB = [number, number, number];

export type PricingFeature = string;

export type PricingPlan = {
  id: 'start' | 'pro' | 'enterprise';
  title: string;
  priceLabel: string; // "от $490 /проект" или "по запросу"
  features: PricingFeature[];
  highlighted?: boolean;
};

export type ProcessStep = {
  title: string;
  desc: string;
};

export type PortfolioItem = {
  id: number | string;
  title: string;
  cover_url: string;
};

// ✅ единый источник истины
export type ServiceSlug = ServiceSlugFromConfig;

export type ServiceConfig = {
  slug: ServiceSlug;
  title: string;
  desc: string;
  acc1: RGB;
  acc2: RGB;
  pricing: PricingPlan[];
  process: ProcessStep[];
  apiKey?: string;
};
