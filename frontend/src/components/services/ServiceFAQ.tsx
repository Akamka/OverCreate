'use client';

import type { CSSVars, RGB } from '@/types/ui';

export type FAQItem = { q: string; a: string };

type Props = {
  accentFrom: RGB;
  accentTo: RGB;
  items?: FAQItem[];
  title?: string;
};

const FALLBACK: FAQItem[] = [
  { q: 'How long does a project take?', a: 'Typically between one and two weeks depending on scope.' },
  { q: 'Do you provide sources?', a: 'Yes. We can hand off design and motion sources on request.' },
];

export default function ServiceFAQ({
  accentFrom,
  accentTo,
  items,
  title = 'Frequently asked questions',
}: Props) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };
  const list = items && items.length ? items : FALLBACK;

  return (
    <section className="oc-section section-soft" style={vars}>
      <div className="max-w-[1000px] mx-auto px-5 md:px-8">
        <p className="text-sm text-white/50">FAQ</p>
        <h2 className="mt-1 text-3xl md:text-4xl font-semibold">{title}</h2>

        <div className="faq-list mt-6 rounded-2xl border border-white/10 overflow-hidden">
          {list.map(({ q, a }, i) => (
            <details key={`${i}-${q}`} className="group faq-item">
              <summary className="faq-summary cursor-pointer list-none px-5 md:px-6 py-4 md:py-5 flex items-center justify-between gap-4">
                <div className="flex-1 font-medium">{q}</div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="inline-block px-2 py-1 text-xs rounded-full border"
                    style={{ borderColor: 'rgb(var(--acc2) / .35)', color: 'rgb(var(--acc2))' }}
                  >
                    {i + 1}
                  </span>
                  <svg
                    className="faq-chevron transition-transform duration-300 opacity-80"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </summary>

              <div className="faq-panel grid grid-rows-[0fr] transition-[grid-template-rows] duration-400 ease-out">
                <div className="faq-inner overflow-hidden">
                  <div className="px-5 md:px-6 pb-5 text-white/75">{a}</div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
