import React from "react";
import Link from "next/link";

/** Разрешаем безопасно прокидывать CSS-переменную для поэтапного появлениея */
type WithDelayVar = React.CSSProperties & { ["--reveal-delay"]?: string };

export default function NotFound() {
  const d0: WithDelayVar = { ["--reveal-delay"]: "0ms" };
  const d1: WithDelayVar = { ["--reveal-delay"]: "120ms" };
  const d2: WithDelayVar = { ["--reveal-delay"]: "220ms" };

  return (
    <main className="relative min-h-[84vh] px-6 py-20 grid place-items-center">
      {/* служебное: чтобы 404 не индексировалась */}
      <meta name="robots" content="noindex,nofollow" />

      <div className="w-full max-w-6xl mx-auto text-center space-y-8">


            {/* Заголовок: читаемый и стильный */}
            <div data-reveal style={d0 as WithDelayVar} className="space-y-2">
                <h1
                    className="text-[clamp(48px,9vw,100px)] font-black tracking-tight leading-none text-center text-white drop-shadow-[0_0_14px_rgba(0,200,255,0.3)]"
                >
                    404
                </h1>

                    <h2
                    className="text-[clamp(32px,6vw,72px)] font-extrabold leading-tight text-center"
                    style={{
                        background: "linear-gradient(135deg, rgb(var(--acc1-404)), rgb(var(--acc2-404)))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow:
                        "0 2px 16px rgba(0,0,0,0.65), 0 0 22px rgba(168,85,247,0.25), 0 0 42px rgba(56,189,248,0.2)",
                    }}
                    >
                    Page Vanished
                    </h2>

            </div>



        {/* Круглый глаз — без моргания, с лёгким «дыханием» (см. твой CSS .nfq-*) */}
        <div className="nfq-eye-wrap" data-reveal style={d1}>
          <div className="nfq-eye" role="img" aria-label="Watching round eye">
            <div className="nfq-frame" />
            <div className="nfq-ball">
              <div className="nfq-pupil" />
              <div className="nfq-shine" />
            </div>
          </div>
        </div>

        {/* Фраза-посыл и пояснение — типографика как на сайте */}
        <div className="space-y-3 max-w-2xl mx-auto" data-reveal style={d1}>
          <p className="text-white/80 text-[15px] md:text-base">
            We can’t find what you’re looking for...{" "}
            <em className="text-white/85">but it’s looking at you.</em>
          </p>
          <p className="text-white/60 text-sm md:text-[15px]">
            The page may have been moved, renamed, or never existed. Try one of these sections:
          </p>
        </div>

        {/* Три направления — плитки в твоём стиле (glass + тонкая рамка) */}
        <nav
          aria-label="Popular sections"
          className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl"
          data-reveal
          style={d2}
        >
          {[
            { href: "/services/motion", t: "Motion Design", d: "Intros, explainers, ads" },
            { href: "/services/web", t: "Web Design", d: "Sites that convert" },
            { href: "/services/dev", t: "Development", d: "Next.js, APIs, dashboards" },
          ].map(({ href, t, d }) => (
            <Link
              key={href}
              href={href}
              className="group hcard rounded-2xl overflow-hidden text-left transition"
            >
              <div className="hcard-body p-5">
                <div className="hcard-engrave" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-semibold text-lg">{t}</div>
                    <div className="text-white/65 text-sm mt-0.5">{d}</div>
                  </div>
                  <span className="pf-nav-ico" aria-hidden style={{ fontSize: 20 }}>
                    →
                  </span>
                </div>
              </div>
              {/* тонкая градиентная обводка как на карточках */}
              <span className="prx-outline" aria-hidden />
            </Link>
          ))}
        </nav>

        {/* Контактная подпись — минимально и по-деловому */}
        <p className="text-white/55 text-sm" data-reveal style={d2}>
          Still lost? Email us at{" "}
          <a href="mailto:overcreate.studio@gmail.com" className="underline">
            overcreate.studio@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
