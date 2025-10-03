'use client';

type Props = {
  value: number;      // 0–1 или 0–100
  label?: string;
};

export default function ProgressBar({ value, label }: Props) {
  // нормализация в проценты [0..100]
  const raw = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, raw <= 1 ? raw * 100 : raw));
  const ariaText = `${Math.round(pct)}%`;

  // цвета: берём из CSS-переменных темы, с дефолтами
  const grad =
    'linear-gradient(90deg,' +
    ' rgb(var(--acc2,59 130 246)) 0%,' +   // blue-500
    ' rgb(var(--acc1,168 85 247)) 50%,' +  // purple-500
    ' rgb(var(--acc3,45 212 191)) 100%' +  // teal-400
    ')';

  return (
    <div className="w-full">
      <div
        className="relative h-2 rounded-full overflow-hidden border border-white/10
                   bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-inner"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label ?? 'Progress'}
        aria-valuetext={ariaText}
      >
        {/* заливка (самодостаточная) */}
        <div
          className="h-full rounded-full"
          style={{
            width: pct === 0 ? '0%' : `max(${pct}%, 4px)`, // минимум видимой ширины
            backgroundImage: grad,                         // inline-градиент
            boxShadow: '0 0 16px rgb(var(--acc2,59 130 246) / .35)',
            transition: 'width .5s ease',
          }}
        />

        {/* верхний лёгкий блик */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,.25), transparent)',
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {label && (
        <div className="mt-1 text-xs text-white/60">
          {label}: {Math.round(pct)}%
        </div>
      )}
    </div>
  );
}
