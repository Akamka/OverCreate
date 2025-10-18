'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './api';

declare global {
  interface Window { Pusher: typeof Pusher; __echo?: Echo<'pusher'>; }
}

type ChannelLike = { name: string };
type ChannelAuthData = { auth: string; channel_data?: string };
type AuthorizeCallback = (err: Error | null, data: ChannelAuthData | null) => void;
type EchoCtorArg = ConstructorParameters<typeof Echo<'pusher'>>[0];

export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  window.Pusher = Pusher;

  const key     = process.env.NEXT_PUBLIC_PUSHER_KEY!;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '');
  const authUrl = `${apiBase}/broadcasting/auth`;

  const opts: EchoCtorArg = {
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: true,
    disableStats: true,

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
              body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
            });
            if (!res.ok) {
              const txt = await res.text().catch(() => '');
              callback(new Error(`Auth ${res.status} ${txt}`), null);
              return;
            }
            const data = (await res.json()) as ChannelAuthData;
            callback(null, data);
          } catch (e) { callback(e as Error, null); }
        },
      };
    },
  };

  const echo = new Echo(opts) as Echo<'pusher'>;
  window.__echo = echo;
  return echo;
}
