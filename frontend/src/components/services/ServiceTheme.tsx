'use client'

/**
 * Полупрозрачный фон, завязанный на --acc1/--acc2,
 * добавляет мягкие цветовые "облака" и блик поверхности.
 * Ставит себя на задний план внутри секции/страницы.
 */
export default function ServiceTheme() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* крупные пятна с лёгкой анимацией */}
      <div
        className="absolute -inset-[12%] blur-[90px] opacity-35"
        style={{
          background: `
            radial-gradient(40% 32% at 18% 28%, rgb(var(--acc1) / .55), transparent 60%),
            radial-gradient(36% 36% at 78% 24%, rgb(var(--acc2) / .50), transparent 62%),
            radial-gradient(46% 46% at 62% 78%, rgb(var(--acc1) / .45), transparent 64%)
          `,
          animation: 'st-rotate 60s linear infinite',
          transformOrigin: '50% 50%',
        }}
      />
      {/* деликатный шелковый блик */}
      <div
        className="absolute -inset-[20%] mix-blend-overlay opacity-25"
        style={{
          background:
            'repeating-linear-gradient(125deg, rgba(255,255,255,.05) 0 2px, transparent 2px 10px)',
          animation: 'st-sheen 18s ease-in-out infinite alternate',
        }}
      />
      <style jsx>{`
        @keyframes st-rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.02); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes st-sheen {
          0% { transform: translate3d(-2%, -2%, 0); }
          100%{ transform: translate3d( 2%,  2%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="st-rotate"], div[style*="st-sheen"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
