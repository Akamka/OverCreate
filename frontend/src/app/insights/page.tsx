import Link from "next/link";

type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  readTime: string;
  tags: string[];
  theme?: "service-web" | "service-motion" | "service-graphic" | "service-dev" | "service-printing";
};

const insights: Insight[] = [
  {
    slug: "motion-as-conversion",
    title: "Motion как инструмент конверсии: где анимация реально продаёт",
    excerpt:
      "Микроанимации повышают осмысленность интерфейса и ведут к целевому действию — без цирка и перегруза.",
    cover: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400&auto=format&fit=crop",
    date: "2025-03-08",
    readTime: "6 мин",
    tags: ["UX", "Motion", "A/B"],
    theme: "service-motion",
  },
  {
    slug: "glass-architecture",
    title: "Стеклянная архитектура UI: как добиться премиального ощущения",
    excerpt:
      "Разбираем стекло, глубину, свет и неоновые акценты так, чтобы оставаться быстрыми и доступными.",
    cover: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1400&auto=format&fit=crop",
    date: "2025-02-22",
    readTime: "8 мин",
    tags: ["UI", "Brand feel"],
    theme: "service-web",
  },
  {
    slug: "design-systems-that-breathe",
    title: "Дизайн-системы, которые дышат: живая типографика и акценты",
    excerpt:
      "Гибкая сетка, цветовой ритм и микрофизика делают интерфейсы узнаваемыми, а команды — быстрее.",
    cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1400&auto=format&fit=crop",
    date: "2025-01-12",
    readTime: "7 мин",
    tags: ["Design System", "Typography"],
    theme: "service-graphic",
  },
];

export const metadata = {
  title: "Insights — OverCreate",
};

export default async function InsightsPage() {
  const featured = insights.slice(0, 2);

  return (
    <main>
      {/* HERO */}
      <header className="oc-section section-soft service-web">
        <div className="mx-auto max-w-6xl px-4">
          <div className="hcard3d hero-card hcard">
            <div className="hcard-body p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden">
                  <div className="hero-ring"></div>
                  <div className="hero-ring-shadow"></div>
                  <div className="absolute inset-0 rounded-2xl bg-acc-grad opacity-80"></div>
                </div>
                <div className="grow">
                  <h1 className="text-3xl md:text-5xl font-extrabold nfq-title-safe" data-reveal>
                    Insights: как мы делаем интерфейсы премиальными
                  </h1>
                  <p
                    className="mt-3 text-zinc-300/90 max-w-2xl"
                    data-reveal
                    style={{ ["--reveal-delay" as any]: "140ms" }}
                  >
                    Короткие, практичные заметки из нашей студии: дизайн-системы, motion, брендинг интерфейсов и рост
                    метрик без «визуального шума».
                  </p>
                  <div
                    className="mt-6 flex flex-wrap gap-3"
                    data-reveal
                    style={{ ["--reveal-delay" as any]: "260ms" }}
                  >
                    <Link href="#all" className="btn-acc btn-acc-primary">
                      Читать заметки
                    </Link>
                    <Link href="/#contact" className="btn-acc btn-acc-outline">
                      Обсудить проект
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <span className="hcard-engrave" />
            <span className="hcard-shard a" />
            <span className="hcard-shard b" />
            <span className="hcard-shine" />
            <span className="hcard-scan" />
            <span className="hcard-chip" />
          </div>
        </div>
      </header>

      {/* FEATURED rail */}
      <section className="oc-section section-soft" aria-labelledby="featured">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-baseline justify-between">
            <h2 id="featured" className="text-xl md:text-2xl font-bold text-white mb-4">
              Избранное
            </h2>
            <span className="text-zinc-400 text-sm">Живые кейсы и A/B-сравнения</span>
          </div>

          <div className="pf-bleed-guard pf-viewport relative">
            <div className="pf-edges">
              <div className="pf-edge pf-edge-left"></div>
              <div className="pf-edge pf-edge-right"></div>
            </div>

            <div className="pf-rail no-scrollbar">
              {featured.map((it) => (
                <article key={it.slug} className={`pf-card hcard3d ${it.theme ?? ""}`}>
                  <div className="pf-ring"></div>
                  <div className="pf-cover">
                    <img src={it.cover} alt="" className="pf-img" />
                    <div className="pf-spot"></div>
                    <div className="pf-vignette"></div>
                    <div className="pf-meta-on">
                      <div className="min-w-0">
                        <div className="pf-title">{it.title}</div>
                        <div className="pf-sub">{it.tags.join(" • ")}</div>
                      </div>
                      <Link href={`/insights/${it.slug}`} className="pf-cta">
                        Читать
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ALL insights */}
      <section id="all" className="oc-section section-soft">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">Все заметки</h2>
            <div className="text-zinc-400 text-sm">Обновляем регулярно</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((it) => (
              <article key={it.slug} className={`hlx-card ${it.theme ?? ""}`}>
                <div className="hlx-fx">
                  <div className="hlx-spot"></div>
                </div>

                <div className="rounded-xl overflow-hidden mb-3 border border-white/10">
                  <img
                    src={it.cover}
                    alt=""
                    className="w-full h-[180px] object-cover"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-semibold leading-tight">{it.title}</h3>
                <p className="hlx-desc">{it.excerpt}</p>

                <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-zinc-400">
                  <span className="chip">{it.date}</span>
                  <span className="chip">{it.readTime}</span>
                  {it.tags.slice(0, 2).map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>

                <div className="mt-4">
                  <Link href={`/insights/${it.slug}`} className="btn-acc btn-acc-primary">
                    Читать заметку
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Для demo/SSG можно экспортировать данные:
export function getAllInsights() {
  return insights;
}
