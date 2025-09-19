'use client';
import { useEffect, useState } from 'react';

/** Возвращает true только после первого монтирования на клиенте */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
