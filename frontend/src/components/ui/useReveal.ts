'use client';

import { useEffect, useRef } from 'react';

export function useReveal<T extends HTMLElement>(rootMargin = '0px 0px -12%') {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-inview');
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return ref;
}
