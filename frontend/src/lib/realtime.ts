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

/* ---------------- types ---------------- */
type AuthPayload = { auth: string; [k: string]: unknown };
type AuthorizeCallback = (error: Error | null, data: AuthPayload | null) => void;
type AuthorizerOptions = { authEndpoint?: string };
type ChannelLike = { name: string };

type EchoCfg = {
  broadcaster: 'pusher';
  key: string;
  // cloud
  cluster?: string;
  forceTLS?: boolean;
  // ws
  wsHost?: string;
  wsPort?: number;
  wssPort?: number;

  disableStats?: boolean;
  enabledTransports?: ReadonlyArray<'ws' | 'wss'>;
  authorizer: ReturnType<typeof makeAuthorizer>;
};

type EchoCtor = new (opts: Record<string, unknown>) => Echo<'pusher'>;

/* -------------- authorizer for Laravel -------------- */
function makeAuthorizer() {
  return (channel: ChannelLike, options: AuthorizerOptions) => ({
    authorize(socketId: string, callback: AuthorizeCallback): void {
      (async () => {
        try {
          const token = getToken();
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE ?? window.location.origin;
          const endpoint =
            options.authEndpoint ??
            `${apiBase.replace(/\/$/, '')}/broadcasting/auth`;

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
          callback(e instanceof Error ? e : new Error('Auth failed'), null);
        }
      })();
    },
  });
}

/* -------------- Echo init -------------- */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  window.Pusher = Pusher;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local';
  const clusterEnv = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST;
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001);

  const authorizer = makeAuthorizer();

  // Если указан wsHost — используем WS; иначе — Channels (с дефолтным кластером)
  const cfg: EchoCfg | null = wsHost
    ? {
        broadcaster: 'pusher',
        key,
        wsHost,
        wsPort,
        wssPort: wsPort,
        forceTLS: window.location.protocol === 'https:',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authorizer,
      }
    : {
        broadcaster: 'pusher',
        key,
        cluster: (clusterEnv && clusterEnv.trim()) || 'mt1', // <- дефолт
        forceTLS: true,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authorizer,
      };

  if (!cfg) {
    // сюда не попадём, но оставлю guard на случай будущих изменений
    // eslint-disable-next-line no-console
    console.error('[Echo] Missing configuration: set NEXT_PUBLIC_WS_HOST or NEXT_PUBLIC_PUSHER_CLUSTER');
    return null;
  }

  const EchoClass = Echo as unknown as EchoCtor;
  const echo = new EchoClass(cfg as Record<string, unknown>);

  window.__echo = echo;
  return echo;
}
