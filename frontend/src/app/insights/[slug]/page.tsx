import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllInsights } from "../page";

export const dynamicParams = true;

export async function generateStaticParams() {
  const list = getAllInsights();
  return list.map((it) => ({ slug: it.slug }));
}

type Props = { params: { slug: string } };

export const metadata = {
  title: "Insight — OverCreate",
};

export default async function InsightPage({ params }: Props) {
  const all = getAllInsights();
  const post = all.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <main>
      {/* HERO поста */}
      <header className={`oc-section section-soft ${post.theme ?? ""}`}>
        <div className="mx-auto max-w-6xl px-4">
          <article className="hcard3d hero-card hcard">
            <div className="hcard-body p-8 md:p-10">
              <div className="grid md:grid-cols-[1.2fr_.8fr] gap-6 items-start">
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold nfq-title-safe" data-reveal>
                    {post.title}
                  </h1>
                  <p
                    className="mt-3 text-zinc-300/90 max-w-2xl"
                    data-reveal
                    style={{ ["--reveal-delay" as any]: "140ms" }}
                  >
                    {post.excerpt}
                  </p>

                  <div
                    className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-300/90"
                    data-reveal
                    style={{ ["--reveal-delay" as any]: "220ms" }}
                  >
                    <span className="chip">{post.date}</span>
                    <span className="chip">{post.readTime}</span>
                    {post.tags.map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>

                  <div
                    className="mt-6 flex gap-3"
                    data-reveal
                    style={{ ["--reveal-delay" as any]: "300ms" }}
                  >
                    <Link href="/insights" className="btn-acc btn-acc-outline">
                      Назад к заметкам
                    </Link>
                    <Link href="/#contact" className="btn-acc btn-acc-primary">
                      Обсудить задачу
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={post.cover}
                    alt=""
                    className="w-full h-[260px] md:h-[320px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 pf-spot"></div>
                  <div className="absolute inset-0 pf-vignette"></div>
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

      {/* Контент статьи */}
      <article className="oc-section section-soft">
        <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-zinc">
          {/* Вставь свой реальный MDX/контент тут. Ниже — демонстрация блоков в твоём стиле. */}

          <h2 data-reveal>1) Зачем это бизнесу</h2>
          <p data-reveal style={{ ["--reveal-delay" as any]: "100ms" }}>
            Когда интерфейс «дышит», пользователю проще принять решение. Мы используем <em>микродинамику</em>, стеклянные
            плоскости и мягкую глубину, чтобы выделить важное и убрать шум. Показатели растут не из-за анимаций, а из-за
            ясности.
          </p>

          {/* Глубокая карточка-цитата */}
          <div className="hcard3d hcard my-6" data-reveal style={{ ["--reveal-delay" as any]: "160ms" }}>
            <div className="hcard-body p-6">
              <p className="text-lg text-zinc-200">
                «Motion — это не декор. Это язык причин-следствий в интерфейсе. Он обучает быстрее и продаёт честнее».
              </p>
            </div>
            <span className="hcard-engrave" />
            <span className="hcard-shard a" />
            <span className="hcard-shard b" />
            <span className="hcard-shine" />
          </div>

          <h3 data-reveal>2) Архитектура внимания</h3>
          <p data-reveal style={{ ["--reveal-delay" as any]: "80ms" }}>
            Мы строим «внимание-поток»: заголовок → микроописание → CTA. Никаких полос и жёстких секций, только плавные
            «воздухи». Цветовые акценты подтягиваются из темы страницы: <code>--acc1/--acc2/--acc3</code>.
          </p>

          {/* Таб/грид с метриками */}
          <div className="hero-metrics mt-6 grid grid-cols-2 md:grid-cols-3 gap-3" data-reveal>
            <div className="metric">
              <div className="metric__num">-18%</div>
              <div className="metric__label">время до первого клика</div>
            </div>
            <div className="metric">
              <div className="metric__num">+26%</div>
              <div className="metric__label">CTR ключевого CTA</div>
            </div>
            <div className="metric">
              <div className="metric__num">×1.4</div>
              <div className="metric__label">скорость понимания</div>
            </div>
          </div>

          <h3 className="mt-10" data-reveal>3) Паттерны, которые мы применяем</h3>

          <ul data-reveal style={{ ["--reveal-delay" as any]: "60ms" }}>
            <li>Магнитный спотлайт на интерактивных плитках (без навязчивости).</li>
            <li>Градиентные кольца с <code>conic-gradient</code> и <code>oklch</code> смешением.</li>
            <li>Стеклянные «карманы» для текста: читаемость + премиальность.</li>
            <li>Мягкая виньетка и лёгкий шум — визуальная «теплота» без потери резкости.</li>
          </ul>

          {/* CTA блок в стиле карточки */}
          <div className="hcard3d hcard mt-10 hero-card">
            <div className="hcard-body p-7 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                  <div className="hero-ring"></div>
                  <div className="hero-ring-shadow"></div>
                  <div className="absolute inset-0 rounded-2xl bg-acc-grad opacity-80"></div>
                </div>
                <div className="grow">
                  <h4 className="text-xl font-bold text-white">Хотите применить это в вашем продукте?</h4>
                  <p className="text-zinc-300/90 mt-1">
                    Мы быстро собираем прототип, тестируем гипотезу и масштабируем в систему.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link href="/#contact" className="btn-acc btn-acc-primary">Запросить консультацию</Link>
                    <Link href="/insights" className="btn-acc btn-acc-outline">Другие инсайты</Link>
                  </div>
                </div>
              </div>
            </div>
            <span className="hcard-engrave" />
            <span className="hcard-shard a" />
            <span className="hcard-shard b" />
            <span className="hcard-shine" />
          </div>
        </div>
      </article>
    </main>
  );
}
