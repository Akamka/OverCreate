'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './api';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    __echo?: Echo<'pusher'>;
  }
}

/* ---- минимальные типы под authorizer (без спорных импортов из pusher-js) ---- */
type ChannelLike = { name: string };
type ChannelAuthData = { auth: string; channel_data?: string };
type AuthorizeCallback = (err: Error | null, data: ChannelAuthData | null) => void;

/* Удобный тип — точный аргумент конструктора Echo для pusher-броадкастера */
type EchoCtorArg = ConstructorParameters<typeof Echo<'pusher'>>[0];

/** Ленивая инициализация Echo (Pusher/Soketi) */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  // laravel-echo ожидает window.Pusher
  window.Pusher = Pusher;

  const isHttps = window.location.protocol === 'https:';

  // Если используешь Pusher Cloud — подтяни из env
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'mt1';

  // Для soketi/своего сервера
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST ?? window.location.hostname;
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? (isHttps ? 443 : 6001));

  // ВАЖНО: нужен МУТАБЕЛЬНЫЙ массив (а не readonly)
  const enabledTransports: Array<'ws' | 'wss'> = isHttps ? ['wss'] : ['ws', 'wss'];

  /* ---- объект опций строго приведён к EchoCtorArg ---- */
  const opts: EchoCtorArg = {
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: isHttps || key !== 'local',
    disableStats: true,
    enabledTransports,

    /** Кастомный authorizer: POST /broadcasting/auth + Bearer */
    authorizer(channel: ChannelLike /*, _opts?: unknown */) {
      return {
        async authorize(socketId: string, callback: AuthorizeCallback) {
          try {
            const token = getToken();

            const res = await fetch('/broadcasting/auth', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            });

            if (!res.ok) {
              const txt = await res.text().catch(() => '');
              callback(new Error(`Auth ${res.status} ${txt}`), null);
              return;
            }

            const data = (await res.json()) as ChannelAuthData; // { auth, channel_data? }
            callback(null, data);
          } catch (e) {
            callback(e as Error, null);
          }
        },
      };
    },
  };

  const echo = new Echo(opts) as Echo<'pusher'>;
  window.__echo = echo;
  return echo;
}
