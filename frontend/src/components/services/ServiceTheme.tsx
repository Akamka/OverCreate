'use client';

export default function ServiceTheme() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* large soft blobs */}
      <div
        className="absolute -inset-[12%] blur-[100px] opacity-22"
        style={{
          background: `
            radial-gradient(40% 32% at 18% 28%, rgb(var(--acc1) / .42), transparent 60%),
            radial-gradient(36% 36% at 78% 24%, rgb(var(--acc2) / .38), transparent 62%),
            radial-gradient(46% 46% at 62% 78%, rgb(var(--acc1) / .34), transparent 64%)
          `,
          animation: 'st-rotate 60s linear infinite',
          transformOrigin: '50% 50%',
          filter: 'saturate(0.95) contrast(0.98)',
        }}
      />
      {/* silk sheen */}
      <div
        className="absolute -inset-[20%] mix-blend-overlay opacity-18"
        style={{
          background:
            'repeating-linear-gradient(125deg, rgba(255,255,255,.045) 0 2px, transparent 2px 12px)',
          animation: 'st-sheen 18s ease-in-out infinite alternate',
        }}
      />
      <style jsx>{`
        @keyframes st-rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.02); }
          100%{ transform: rotate(360deg) scale(1); }
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
  );
}
