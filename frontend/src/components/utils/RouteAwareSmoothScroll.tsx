'use client';

import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/SmoothScroll';

/**
 * Включает SmoothScroll везде, КРОМЕ страниц услуг.
 * Это устраняет «пробку» прокрутки перед формой CTA.
 */
export default function RouteAwareSmoothScroll() {
  const pathname = usePathname() ?? '';

  // Отключаем на /service/* и /services/*
  const isService =
    pathname.startsWith('/service/') || pathname.startsWith('/services/');

  if (isService) return null;
  return <SmoothScroll />;
}
