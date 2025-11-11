// app/insights/[slug]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchPostBySlug } from "@/lib/api";
import type { Post } from "@/types/post";

/* ========= UI type ========= */
type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;      // absolute/relative URL
  date: string;       // ISO YYYY-MM-DD
  readTime: string;   // "6 min"
  tags: string[];
  theme?: "service-web" | "service-motion" | "service-graphic" | "service-dev" | "service-printing";
};

/* ========= helpers (без any) ========= */
function getString(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function getDateISO(obj: unknown, keys: string[]): string | undefined {
  const s = getString(obj, keys);
  if (!s) return undefined;
  // Берём первые 10 символов (YYYY-MM-DD), если пришёл ISO/DateTime
  const iso = s.length >= 10 ? s.slice(0, 10) : s;
  // минимальная валидация: YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined;
}

function toKeywords(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim());
  }
  if (typeof value === "string") {
    // поддержка "a, b, c"
    return value
      .split(",")
      .map((x) => x.trim())
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
  const cover =
    getString(p, ["cover_url", "coverUrl", "cover"]) ?? "";
  const date =
    getDateISO(p, ["published_at", "publishedAt", "created_at", "createdAt"]) ?? "";
  const tags = toKeywords((p as unknown as { keywords?: unknown }).keywords);

  return {
    slug: getString(p, ["slug"]) ?? "",
    title: getString(p, ["title"]) ?? "",
    excerpt: getString(p, ["excerpt"]) ?? "",
    cover,
    date,
    readTime: computeReadTime((p as unknown as { body?: string }).body ?? ""),
    tags,
    theme: pickTheme(tags),
  };
}

/* ========= dynamic SEO ========= */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug, { revalidate: 300 });
  if (!post) return { title: "Insight — OverCreate" };

  const title =
    getString(post, ["meta_title", "metaTitle"])?.trim() ||
    `${getString(post, ["title"]) ?? "Insight"} — OverCreate`;

  const description =
    getString(post, ["meta_description", "metaDescription"])?.trim() ||
    getString(post, ["excerpt"])?.trim() ||
    "An OverCreate studio note";

  const cover = getString(post, ["cover_url", "coverUrl", "cover"]);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export const dynamicParams = true;
export async function generateStaticParams() { return []; }

/* ========= page ========= */
type Props = { params: { slug: string } };
type CSSVars = React.CSSProperties & { ["--reveal-delay"]?: string };

export default async function InsightPage({ params }: Props) {
  const apiPost = await fetchPostBySlug(params.slug, { revalidate: 300 });
  if (!apiPost) return notFound();

  const post = toInsight(apiPost);

  return (
    <main>
      {/* Post HERO */}
      <header className={`oc-section section-soft ${post.theme ?? ""}`}>
        <div className="mx-auto max-w-6xl px-4">
          <article className="hcard3d hero-card hcard">
            <div className="hcard-body p-8 md:p-10">
              <div className="grid md:grid-cols-[1.2fr_.8fr] gap-6 items-start">
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold nfq-title-safe" data-reveal>
                    {post.title}
                  </h1>

                  {!!post.excerpt && (
                    <p
                      className="mt-3 text-zinc-300/90 max-w-2xl"
                      data-reveal
                      style={{ ["--reveal-delay"]: "140ms" } as CSSVars}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  <div
                    className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-300/90"
                    data-reveal
                    style={{ ["--reveal-delay"]: "220ms" } as CSSVars}
                  >
                    {!!post.date && <span className="chip">{post.date}</span>}
                    <span className="chip">{post.readTime}</span>
                    {post.tags.map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>

                  <div
                    className="mt-6 flex gap-3"
                    data-reveal
                    style={{ ["--reveal-delay"]: "300ms" } as CSSVars}
                  >
                    <Link href="/insights" className="btn-acc btn-acc-outline">
                      Back to insights
                    </Link>
                    <Link href="/#contact" className="btn-acc btn-acc-primary">
                      Discuss your project
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  {!!post.cover && (
                    <div className="relative w-full h-[260px] md:h-[320px]">
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                        unoptimized   
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 pf-spot" />
                  <div className="absolute inset-0 pf-vignette" />
                </div>
              </div>
            </div>

            <span className="hcard-engrave" />
            <span className="hcard-shard a" />
            <span className="hcard-shard b" />
            <span className="hcard-shine" />
            <span className="hcard-scan" />
          </article>
        </div>
      </header>

      {/* Article content (from admin) */}
      <article className="oc-section section-soft">
        <div className="mx-auto max-w-3xl px-4 insight-prose prose prose-invert prose-zinc">
          {/* html из админки */}
          <div
            dangerouslySetInnerHTML={{
              __html: (apiPost as unknown as { body?: string }).body ?? "",
            }}
          />

          {/* Themed CTA */}
          {(getString(apiPost, ["cta_text", "ctaText"]) || getString(apiPost, ["cta_url", "ctaUrl"])) && (
            <div className={post.theme ?? ""}>
              <article className="insight-cta hcard3d mt-10" data-reveal>
                <div className="hcard-body insight-cta__body p-6 md:p-7">
                  <div className="flex items-center gap-5 md:gap-6">
                    {/* emblem */}
                    <div className="insight-cta__icon relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden">
                      <div className="hero-ring" />
                      <div className="hero-ring-shadow" />
                      <div className="absolute inset-0 rounded-2xl bg-acc-grad opacity-[.85]" />
                    </div>

                    {/* text */}
                    <div className="grow min-w-0">
                      <h4 className="cta-title text-xl md:text-2xl font-extrabold">
                        {getString(apiPost, ["cta_text", "ctaText"]) ?? "Need an interface that sells? Let’s talk."}
                      </h4>
                      <p className="cta-desc mt-2">
                        We can quickly prototype, validate the hypothesis, and scale it into a design system.
                      </p>
                    </div>

                    {/* button */}
                    <div className="shrink-0">
                      <Link
                        href={getString(apiPost, ["cta_url", "ctaUrl"]) ?? "/#contact"}
                        className="cta-btn"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>

                {/* neon outline */}
                <span className="prx-outline" />
                <span className="hcard-engrave" />
                <span className="hcard-shard a" />
                <span className="hcard-shard b" />
                <span className="hcard-shine" />
              </article>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
