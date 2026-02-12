// app/insights/page.tsx
import Link from "next/link";
import type { Metadata } from 'next';
import { fetchPosts } from "@/lib/api";
import type { Post } from "@/types/post";
import { themeFromSlug } from "@/lib/theme";
import BackToHome from "@/components/ui/BackToHome";
import InsightsBrowser from "./InsightsBrowser";
import { alternatesFor } from '@/lib/seo';

/* ========= adapter: Post(API) -> Insight ========= */

type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;      // ISO YYYY-MM-DD
  readTime: string;  // "6 min"
  tags: string[];
  theme?: "service-web" | "service-motion" | "service-graphic" | "service-dev" | "service-printing";
};

function pickString(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function toTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return (input as unknown[]).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }
  if (typeof input === "string") {
    return input
      .split(/[,;]|(\s{2,})/g)
      .map((s) => (s ?? "").trim())
      .filter(Boolean);
  }
  return [];
}

function computeReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

function pickTheme(keywords?: string[] | null): Insight["theme"] | undefined {
  if (!keywords?.length) return undefined;
  const lower = keywords.map((k) => k.toLowerCase().trim());

  const kv = lower.find((k) => k.startsWith("theme:"));
  if (kv) {
    const v = kv.split(":")[1]?.trim();
    switch (v) {
      case "web": return "service-web";
      case "motion": return "service-motion";
      case "graphic": return "service-graphic";
      case "dev": return "service-dev";
      case "printing": return "service-printing";
    }
  }
  const direct = lower.find((k) =>
    ["service-web","service-motion","service-graphic","service-dev","service-printing"].includes(k)
  ) as Insight["theme"] | undefined;

  return direct;
}

function toInsight(p: Post): Insight {
  const dict = p as unknown as Record<string, unknown>;

  const getStr = (obj: Record<string, unknown>, key: string): string => {
    const v = obj[key];
    return typeof v === "string" ? v.trim() : "";
  };
  const getStrPath = (obj: Record<string, unknown>, path: string[]): string => {
    let cur: unknown = obj;
    for (const k of path) {
      if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[k];
      } else {
        return "";
      }
    }
    return typeof cur === "string" ? cur.trim() : "";
  };

  const cover = pickString(
    getStr(dict, "cover_url"),
    getStr(dict, "coverUrl"),
    getStr(dict, "cover"),
    getStrPath(dict, ["image", "url"])
  );

  const date = pickString(
    getStr(dict, "published_at"),
    getStr(dict, "publishedAt"),
    getStr(dict, "created_at"),
    getStr(dict, "createdAt")
  ).slice(0, 10);

  const body = getStr(dict, "body");

  const rawKeywords = (dict["keywords"] as unknown) ?? (dict["tags"] as unknown);
  const tags = toTags(rawKeywords);

  const theme = pickTheme(tags);

  return {
    slug: getStr(dict, "slug"),
    title: getStr(dict, "title"),
    excerpt: getStr(dict, "excerpt"),
    cover,
    date,
    readTime: computeReadTime(body),
    tags,
    theme,
  };
}

/* ========= /meta ========= */

export const metadata: Metadata = {
  title: 'Insights - OverCreate',
  description:
    'Insights from OverCreate studio about web design, motion, branding, product UI, and development decisions.',
  alternates: alternatesFor('/insights'),
  openGraph: {
    title: 'Insights - OverCreate',
    description:
      'Insights from OverCreate studio about web design, motion, branding, product UI, and development decisions.',
    url: '/insights',
    type: 'website',
    siteName: 'OverCreate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insights - OverCreate',
    description:
      'Insights from OverCreate studio about web design, motion, branding, product UI, and development decisions.',
  },
};

export default async function InsightsPage() {
  const page = await fetchPosts(1, 12, { revalidate: 60 });
  const items = (page.data ?? []) as Post[];
  const insights: Insight[] = items.map(toInsight);
  const featured = insights.slice(0, 2);

  return (
    <main>
      <BackToHome href="/" />

      {/* HERO */}
      <header className="oc-section section-soft service-web">
        <div className="mx-auto max-w-6xl px-4">
          <div className="ins-hero">
            <div className="ins-hero__ringWrap" aria-hidden>
              <div className="ins-hero__ring" />
            </div>
            <div className="ins-hero__shadow" aria-hidden />

            <div className="ins-hero__body">
              <h1 className="ins-hero__title">Insights: how we craft premium interfaces</h1>

              <p className="ins-hero__lead">
                Short, practical notes from our studio: design systems, motion, interface branding,
                and metric growth without visual noise.
              </p>

              {/* Якорь — плавность через css: html{scroll-behavior:smooth} */}
              <div className="ins-hero__cta">
                <Link href="#all" className="btn-acc btn-acc-primary">Read notes</Link>
                <Link href="/#contact" className="btn-acc btn-acc-outline">Discuss a project</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED rail */}
      <section className="oc-section section-soft" aria-labelledby="featured">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-baseline justify-between">
            <h2 id="featured" className="text-xl md:text-2xl font-bold text-white mb-4">Featured</h2>
            <span className="text-zinc-400 text-sm">Live case studies and A/B comparisons</span>
          </div>

          <div className="pf-bleed-guard pf-viewport relative">
            <div className="pf-edges">
              <div className="pf-edge pf-edge-left" />
              <div className="pf-edge pf-edge-right" />
            </div>

            <div className="pf-rail no-scrollbar">
              {featured.map((it) => {
                const theme = it.theme ?? themeFromSlug(it.slug);
                const cover = it.cover || "/placeholder/cover.jpg";
                return (
                  <article key={it.slug} className={`pf-card hcard3d ${theme}`}>
                    <div className="pf-ring" />
                    <div className="pf-cover">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={it.title} className="pf-img" />
                      <div className="pf-spot" />
                      <div className="pf-vignette" />
                      <div className="pf-meta-on">
                        <div className="min-w-0">
                          <div className="pf-title">{it.title}</div>
                          <div className="pf-sub">{it.tags.join(" • ")}</div>
                        </div>
                        <Link href={`/insights/${it.slug}`} className="pf-cta">Read</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!featured.length && (
                <div className="text-zinc-400 px-2 py-6">Posts will appear after you publish them in the admin.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ALL insights — фильтр по темам + пагинация по 6 */}
      <section id="all" className="oc-section section-soft">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">All notes</h2>
            <div className="text-zinc-400 text-sm">Filter by theme</div>
          </div>

          <InsightsBrowser
            insights={insights.map((it) => ({
              ...it,
              theme: it.theme ?? themeFromSlug(it.slug),
            }))}
            perPage={6}
            scrollTargetId="all"
          />
        </div>
      </section>
    </main>
  );
}
