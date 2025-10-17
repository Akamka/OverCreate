'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './api';

declare global {
  interface Window {
    __echo?: Echo<'pusher'>;
    Pusher: typeof Pusher;
  }
}

/* Согласованные с pusher-js v8 типы */
type ChannelAuthorizationData = { auth: string; [key: string]: unknown };
type ChannelAuthorizationCallback = (
  error: Error | null,
  data: ChannelAuthorizationData | null
) => void;
type ChannelAuthorizer = {
  authorize(socketId: string, callback: ChannelAuthorizationCallback): void;
};
type AuthorizerOptions = { authEndpoint?: string };

/** переключатель приватных каналов */
const USE_PRIVATE = (process.env.NEXT_PUBLIC_PRIVATE_CHANNELS ?? '1') === '1';

export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  window.Pusher = Pusher;

  const wsHost = process.env.NEXT_PUBLIC_WS_HOST ?? '127.0.0.1';
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001);
  const forceTLS = (process.env.NEXT_PUBLIC_WS_TLS ?? '0') === '1';

  const echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'mt1',

    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,

    authEndpoint: '/broadcasting/auth',
    // ВАЖНО: сигнатура строго (socketId, callback: (err: Error|null, data: ...|null) => void)
    authorizer: (channel, options: AuthorizerOptions): ChannelAuthorizer => {
      return {
        authorize(socketId: string, callback: ChannelAuthorizationCallback): void {
          (async () => {
            try {
              const token = getToken();
              const res = await fetch(options.authEndpoint ?? '/broadcasting/auth', {
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
                credentials: 'include',
              });

              if (!res.ok) {
                callback(new Error(`HTTP ${res.status}`), null);
                return;
              }

              const data = (await res.json()) as ChannelAuthorizationData;
              callback(null, data);
            } catch (e) {
              const err = e instanceof Error ? e : new Error('Auth failed');
              callback(err, null);
            }
          })();
        },
      };
    },
  }) as Echo<'pusher'>;

  window.__echo = echo;
  return echo;
}

/** Хелпер: получить канал проекта */
export function projectChannel(projectId: string) {
  const echo = getEcho();
  if (!echo) return null;
  return USE_PRIVATE ? echo.private(`project.${projectId}`) : echo.channel(`project.${projectId}`);
}
