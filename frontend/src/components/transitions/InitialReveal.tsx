'use client';

import { useEffect, useRef } from 'react';

export default function InitialReveal({ children }: { children: React.ReactNode }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const root = document.documentElement;
    const body = document.body;
    const main = body.querySelector('main') ?? body;

    // собираем кандидатов ТОЛЬКО внутри main
    const nodes = Array.from<HTMLElement>(
      main.querySelectorAll(
        [
          '[data-reveal]',
          'section',
          'header',
          'footer',
          'article',
          'div.oc-section',
          '.hcard',
          '.pf-card',
          ':where(main) > *', // только плоские дети main
        ].join(',')
      )
    ).filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') return false;
      if (el.closest('[data-static],[data-bg],[aria-hidden="true"]')) return false; // не трогаем фон/оверлеи
      const r = el.getBoundingClientRect();
      return r.width >= 8 && r.height >= 8 && el.offsetParent !== null;
    });

    nodes.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    const step = 60, max = 600;
    nodes.forEach((el, i) => {
      const d = Math.min(i * step, max);
      el.style.setProperty('--reveal-delay', `${d}ms`);
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'auto');
    });

    body.classList.remove('preload');
    root.classList.add('reveal-on');

    return () => {
      nodes.forEach((el) => {
        el.style.removeProperty('--reveal-delay');
        if (el.getAttribute('data-reveal') === 'auto') el.removeAttribute('data-reveal');
      });
      root.classList.remove('reveal-on');
    };
  }, []);

  return <>{children}</>;
}
