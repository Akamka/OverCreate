// src/lib/services.ts
import { SERVICES, type ServiceSlug, type ServiceConfig } from './services.config';

export function allServices(): Array<{ slug: ServiceSlug; config: ServiceConfig }> {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({
    slug,
    config: SERVICES[slug],
  }));
}

export function getService(slug: string): { slug: ServiceSlug; config: ServiceConfig } | null {
  const key = slug as ServiceSlug;
  return key in SERVICES ? { slug: key, config: SERVICES[key] } : null;
}
