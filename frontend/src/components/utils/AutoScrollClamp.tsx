'use client';

import { useEffect } from 'react';

/**
 * Если контента хватает (documentElement.scrollHeight <= innerHeight + 1),
 * скрываем вертикальный скролл у <html>. Если не хватает — возвращаем.
 * Пересчитываем на ресайз/зум/перерисовки.
 */
export default function AutoScrollClamp() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      // +1 пиксель допускаем на тени/сабпиксельные артефакты
      const fits =
        root.scrollHeight <= Math.ceil(window.innerHeight + 1);
      root.classList.toggle('oc-no-vert-scroll', fits);
    };

    apply();

    // реагируем на ресайз и изменение layout
    const ro = new ResizeObserver(apply);
    ro.observe(root);
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    // мало ли фон/шрифты доехали
    const t = setTimeout(apply, 200);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      root.classList.remove('oc-no-vert-scroll');
    };
  }, []);

  return null;
}
