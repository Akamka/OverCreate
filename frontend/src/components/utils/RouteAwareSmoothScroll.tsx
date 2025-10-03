'use client';

import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/SmoothScroll';

const DISABLE_ON: RegExp[] = [
  /^\/admin(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,
];

export default function RouteAwareSmoothScroll() {
  const pathname = usePathname() ?? '/';
  const disabled = DISABLE_ON.some((rx) => rx.test(pathname));
  return disabled ? null : <SmoothScroll />;
}
