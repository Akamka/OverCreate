import Link from 'next/link';
import type { CSSVars, RGB } from '@/types/ui';

export default function ServiceHero({
  slug, title, desc, acc1, acc2,
}: { slug: string; title: string; desc: string; acc1: RGB; acc2: RGB }) {
  const vars: CSSVars = { '--acc1': acc1.join(' '), '--acc2': acc2.join(' ') };

  return (
    <section className="oc-section px-6 md:px-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="hcard" style={vars}>
          <div className="hcard-body p-8 md:p-10">
            <div className="hcard-engrave" />
            <div className="hcard-shard a" />
            <div className="hcard-shard b" />
            <div className="hcard-scan" />
            <div className="hcard-chip" />

            <div className="relative z-10">
              <p className="text-white/60 text-sm uppercase tracking-[.2em]">услуга / {slug}</p>
              <h1 className="mt-2 text-3xl md:text-5xl font-semibold">{title}</h1>
              <p className="mt-4 text-neutral-300 max-w-2xl">{desc}</p>
              <div className="mt-8 flex gap-3">
                <Link href="#pricing" className="rounded-2xl bg-white text-black px-5 py-2.5 font-medium hover:bg-neutral-200">Стоимость</Link>
                <Link href="#portfolio" className="rounded-2xl border border-white/20 px-5 py-2.5 font-medium hover:border-white/40">Кейсы</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
