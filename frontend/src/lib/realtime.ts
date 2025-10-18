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

type ChannelLike = { name: string };
type ChannelAuthData = { auth: string; channel_data?: string };
type AuthorizeCallback = (err: Error | null, data: ChannelAuthData | null) => void;
type EchoCtorArg = ConstructorParameters<typeof Echo<'pusher'>>[0];

/** Вернуть активный socketId (или null), удобно при отправке X-Socket-Id */
export function getSocketId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.__echo?.socketId() ?? null;
}

/** Ленивая инициализация Echo */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  // подробный лог pusher-js (оставь включённым, пока настраиваешь)
  Pusher.logToConsole = true;
  window.Pusher = Pusher;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '');
  const authUrl = `${apiBase}/broadcasting/auth`;

  const opts: EchoCtorArg = {
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: true,       // для Pusher Cloud
    disableStats: true,

    // Кастомный authorizer: POST /broadcasting/auth с Bearer-токеном
    authorizer(channel: ChannelLike) {
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
              callback(new Error(`Auth ${res.status} ${txt}`.trim()), null);
              return;
            }

            const data = (await res.json()) as ChannelAuthData;
            callback(null, data);
          } catch (e) {
            callback(e as Error, null);
          }
        },
      };
    },
  };

  const echo = new Echo(opts) as Echo<'pusher'>;

  // Небольшой диагностический лог Pusher (без any)
  type PusherLike = {
    connection: { bind: (event: 'state_change', cb: (s: { previous: string; current: string }) => void) => void };
    bind: (event: string, cb: (payload: unknown) => void) => void;
  };

  function getPusherFromConnector(connector: unknown): PusherLike | null {
    const raw = (connector && (connector as { pusher?: unknown }).pusher) as unknown;
    if (
      raw &&
      typeof raw === 'object' &&
      'bind' in raw &&
      typeof (raw as { bind?: unknown }).bind === 'function' &&
      'connection' in raw &&
      typeof (raw as { connection?: unknown }).connection === 'object'
    ) {
      const conn = (raw as { connection?: unknown }).connection as unknown;
      if (conn && typeof conn === 'object' && 'bind' in conn && typeof (conn as { bind?: unknown }).bind === 'function') {
        return raw as PusherLike;
      }
    }
    return null;
  }

  const p = getPusherFromConnector(echo.connector);
  if (p) {
    p.connection.bind('state_change', (s) => {
      // eslint-disable-next-line no-console
      console.debug('[pusher] state:', s.previous, '→', s.current);
    });
    p.bind('pusher:error', (e) => console.error('[pusher] error', e));
    p.bind('pusher:subscription_error', (e) => console.error('[pusher] sub_error', e));
  }

  window.__echo = echo;
  return echo;
}
