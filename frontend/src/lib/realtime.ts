'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './api';

/** Кэшируем инстанс Echo на window */
declare global {
  interface Window {
    __echo?: Echo<'pusher'>;
    Pusher: typeof Pusher;
  }
}

/* -------------------- Вспомогательные типы (минимум, без any) -------------------- */

type AuthPayload = {
  /** Laravel ожидает хотя бы `auth` */
  auth: string;
  [k: string]: unknown;
};

type AuthorizeCallback = (error: Error | null, data: AuthPayload | null) => void;

type AuthorizerOptions = {
  /** Кастомная точка авторизации (по умолчанию /broadcasting/auth) */
  authEndpoint?: string;
};

type ChannelLike = { name: string };

type ChannelAuthorizer = (
  channel: ChannelLike,
  options: AuthorizerOptions
) => {
  authorize(socketId: string, callback: AuthorizeCallback): void;
};

/* -------------------- Экспорт: ленивая инициализация Echo -------------------- */

export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;

  if (window.__echo) return window.__echo;

  // laravel-echo ожидает глобальный Pusher
  window.Pusher = Pusher;

  const wsHost = process.env.NEXT_PUBLIC_WS_HOST ?? '127.0.0.1';
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001);

  const echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local',
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,

    // Важно: authorizer для private/presence каналов без any
    authorizer:
      (channel: ChannelLike, options: AuthorizerOptions): ReturnType<ChannelAuthorizer> =>
      ({
        authorize(socketId: string, callback: AuthorizeCallback): void {
          (async () => {
            try {
              const token = getToken();
              const endpoint = options.authEndpoint ?? '/broadcasting/auth';

              const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              });

              if (!res.ok) {
                const txt = (await res.text().catch(() => '')) || '';
                callback(new Error(`Auth HTTP ${res.status} ${txt}`.trim()), null);
                return;
              }

              const data = (await res.json()) as AuthPayload;
              callback(null, data);
            } catch (e) {
              const err = e instanceof Error ? e : new Error('Auth failed');
              callback(err, null);
            }
          })();
        },
      }),
  }) as Echo<'pusher'>;

  window.__echo = echo;
  return echo;
}
