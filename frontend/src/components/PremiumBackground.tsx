'use client';

/**
 * Premium background for OverCreate (safe, no extra scrollbars):
 * - Aurora Silk
 * - Fine Grid
 * - Sheen
 * - Noise + Vignette
 *
 * ВАЖНО: wrapper имеет overflow: hidden и contain: paint — слои не «выпирают»
 * за вьюпорт и не создают горизонтальный скролл.
 */
export default function PremiumBackground() {
  return (
    <div
      aria-hidden
      className="oc-bg-root fixed inset-0 pointer-events-none"
      /* доп. страховка */
      style={{ zIndex: 0, overflow: 'hidden', contain: 'paint' }}
    >
      <div className="oc-bg-layer oc-aurora" />
      <div className="oc-bg-layer oc-sheen" />
      <div className="oc-bg-layer oc-finegrid" />
      <div className="oc-bg-layer oc-noise" />
      <div className="oc-bg-layer oc-vignette" />
    </div>
  );
}
