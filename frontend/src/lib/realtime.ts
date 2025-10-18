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

/** минимальные типы под кастомный authorizer */
type ChannelLike = { name: string };
type ChannelAuthData = { auth: string; channel_data?: string };
type AuthorizeCallback = (err: Error | null, data: ChannelAuthData | null) => void;

/** точный тип аргумента конструктора Echo для pusher-броадкастера */
type EchoCtorArg = ConstructorParameters<typeof Echo<'pusher'>>[0];

/** Ленивая инициализация Echo (Pusher/Soketi) */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  // laravel-echo ожидает window.Pusher
  window.Pusher = Pusher;

  const isHttps = window.location.protocol === 'https:';

  // Pusher Cloud / soketi
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'mt1';

  // Где крутится soketi (или pusher-compatible шлюз)
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST ?? window.location.hostname;
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? (isHttps ? 443 : 6001));

  // ВАЖНО: абсолютный URL до бэкенда!
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '');
  const authUrl = `${apiBase}/broadcasting/auth`;

  const opts: EchoCtorArg = {
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: isHttps || key !== 'local',
    disableStats: true,
    // тип у опции — простой массив строк, поэтому без readonly-литералов:
    enabledTransports: isHttps ? (['wss'] as ('ws' | 'wss')[]) : (['ws', 'wss'] as ('ws' | 'wss')[]),

    /** Кастомный authorizer — POST на БЭК с Bearer токеном */
    authorizer(channel: ChannelLike /*, _opts?: unknown */) {
      return {
        async authorize(socketId: string, callback: AuthorizeCallback) {
          try {
            const token = getToken();

            const res = await fetch(authUrl, {
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
