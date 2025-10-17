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

/* -------------------- локальные типы -------------------- */
type AuthPayload = { auth: string; [k: string]: unknown };
type AuthorizeCallback = (error: Error | null, data: AuthPayload | null) => void;
type AuthorizerOptions = { authEndpoint?: string };
type ChannelLike = { name: string };

/** минимальный конфиг для Echo; держим без any */
type EchoInit = {
  broadcaster: 'pusher';
  key: string;

  // pusher cloud
  cluster?: string;
  forceTLS?: boolean;

  // soketi/ws
  wsHost?: string;
  wsPort?: number;
  wssPort?: number;

  // общее
  disableStats?: boolean;
  enabledTransports?: ReadonlyArray<'ws' | 'wss'>;

  authorizer: ReturnType<typeof makeAuthorizer>;
};

/* -------------------- authorizer для Laravel -------------------- */
function makeAuthorizer() {
  return (channel: ChannelLike, options: AuthorizerOptions) => ({
    authorize(socketId: string, callback: AuthorizeCallback): void {
      (async () => {
        try {
          const token = getToken();
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE ?? `${window.location.origin}`;
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
          const err = e instanceof Error ? e : new Error('Auth failed');
          callback(err, null);
        }
      })();
    },
  });
}

/* тип «конструктор Echo», чтобы не использовать any/unknown в new Echo(...) */
type EchoCtor = new (opts: Record<string, unknown>) => Echo<'pusher'>;

/* -------------------- инициализация Echo -------------------- */
export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  if (window.__echo) return window.__echo;

  window.Pusher = Pusher;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY ?? 'local';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST;
  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? 6001);

  const authorizer = makeAuthorizer();

  const common = {
    broadcaster: 'pusher' as const,
    key,
    disableStats: true,
    enabledTransports: ['ws', 'wss'] as const,
    authorizer,
  };

  const cfgCloud: EchoInit | null =
    cluster && cluster !== ''
      ? {
          ...common,
          cluster,
          forceTLS: true,
        }
      : null;

  const cfgWs: EchoInit | null =
    wsHost && wsHost !== ''
      ? {
          ...common,
          wsHost,
          wsPort,
          wssPort: wsPort,
          forceTLS: window.location.protocol === 'https:',
        }
      : null;

  // берём один из конфигов (cloud или ws)
  const cfg: EchoInit = (cfgCloud ?? cfgWs)!;

  // создаём через типизированный «конструктор»
  const EchoClass = Echo as unknown as EchoCtor;
  const echo = new EchoClass(cfg as Record<string, unknown>);

  window.__echo = echo;
  return echo;
}
