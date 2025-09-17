'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    __echo?: Echo<'pusher'>;      // кэш инстанса
    Pusher: typeof Pusher;        // нужен laravel-echo
  }
}

/** Ленивая инициализация Echo (Soketi/Pusher) */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  // laravel-echo ожидает window.Pusher
  window.Pusher = Pusher;

  const inst = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local',
    wsHost: process.env.NEXT_PUBLIC_WS_HOST ?? '127.0.0.1',
    wsPort: Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001),
    wssPort: Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1',
  }) as Echo<'pusher'>;

  window.__echo = inst;
  return inst;
}
