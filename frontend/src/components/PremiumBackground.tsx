'use client'

/**
 * Premium background for OverCreate:
 * - Aurora Silk (мягкие анимированные световые пятна)
 * - Fine Grid (тонкая инженерная сетка)
 * - Sheen (едва заметный «шелковый» блик)
 * - Noise + Vignette (зерно и виньетка)
 */
export default function PremiumBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="oc-aurora" />
      <div className="oc-sheen" />
      <div className="oc-finegrid" />
      <div className="oc-noise" />
      <div className="oc-vignette" />
    </div>
  )
}
