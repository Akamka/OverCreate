'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { API_URL, apiGet, authHeader, getToken } from './api';
import { getEcho } from './realtime';

import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { Message } from '@/types/message';
import type { Paginated } from './api';

type HttpishError = Error & { status?: number };

/* ================= me ================= */

export function useMe() {
  const token = getToken();
  const key = token ? ['/me', token] : null;

  const { data, error, isLoading, mutate } = useSWR<User>(
    key,
    ([p]) => apiGet<User>(p),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const unauthorized = Boolean((error as HttpishError | undefined)?.status === 401);

  return {
    user: unauthorized ? null : (data ?? null),
    unauthorized,
    error,
    isLoading,
    mutate,
  };
}

/* =============== projects list =============== */

export function useProjects(enabled = true) {
  const token = getToken();
  const key = enabled && token ? ['/projects', token] : null;

  const { data, error, isLoading } = useSWR<Paginated<Project>>(
    key,
    ([p]) => apiGet<Paginated<Project>>(p),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  return { projects: data?.data ?? [], error, isLoading };
}

/* =============== project by id =============== */

export function useProject(id: number | undefined) {
  const token = getToken();
  const key =
    typeof id === 'number' && Number.isFinite(id) && token ? [`/projects/${id}`, token] : null;

  const { data, error, isLoading, mutate } = useSWR<Project>(
    key,
    ([p]) => apiGet<Project>(p),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  return { project: data ?? null, error, isLoading, mutate };
}
/** Достаём sender id без any и без ошибок линтера */
function extractSenderId(
  m: unknown
): string | null {
  // вариант: relation sender: { id }
  const rel =
    typeof m === 'object' && m !== null &&
    'sender' in m &&
    typeof (m as { sender?: unknown }).sender === 'object' &&
    (m as { sender?: { id?: unknown } }).sender?.id;

  if (typeof rel === 'number' || typeof rel === 'string') {
    return String(rel);
  }

  // вариант: плоское поле sender_id
  const flat =
    typeof m === 'object' && m !== null &&
    'sender_id' in m &&
    (m as { sender_id?: unknown }).sender_id;

  if (typeof flat === 'number' || typeof flat === 'string') {
    return String(flat);
  }

  return null;
}


/* =============== messages + realtime =============== */
/** meId — id текущего пользователя, чтобы отфильтровать свои же события из сокета */
export function useMessages(
  projectId: string | null | undefined,
  meId?: number
) {
  const key = projectId ? `/projects/${projectId}/messages` : null;

  const { data, mutate } = useSWR<Message[]>(key, apiGet, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  /* -------- helpers с X-Socket-Id (убирает дубли у отправителя) -------- */
  async function postJSON<T>(path: string, payload: unknown, extra?: Record<string, string>) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeader(),
        ...(extra ?? {}),
      },
      body: JSON.stringify(payload ?? {}),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${txt}`.trim());
    }
    return (await res.json()) as T;
  }

  async function postForm<T>(path: string, form: FormData, extra?: Record<string, string>) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...authHeader(),
        ...(extra ?? {}),
      },
      body: form,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${txt}`.trim());
    }
    return (await res.json()) as T;
  }

  /* ---------------- отправка (optimistic + X-Socket-Id) ---------------- */
  async function send(body: string, files?: File[]) {
    if (!projectId) return;

    const socketId = getEcho()?.socketId();               // ← берём id текущего соединения
    const hdr = socketId ? { 'X-Socket-Id': socketId } : undefined;

    if (!files || files.length === 0) {
      const msg = await postJSON<Message>(`/projects/${projectId}/messages`, { body }, hdr);
      await mutate((prev) => ([...(prev ?? []), msg]), { revalidate: false });
      return;
    }

    const form = new FormData();
    if (body?.trim()) form.append('body', body.trim());
    files.forEach((f) => form.append('files[]', f));

    const msg = await postForm<Message>(`/projects/${projectId}/messages`, form, hdr);
    await mutate((prev) => ([...(prev ?? []), msg]), { revalidate: false });
  }

  /* ---------------- realtime-подписка ---------------- */
  useEffect(() => {
    if (!projectId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`project.${projectId}`);

    type Payload = { message?: Message };

    const handler = (evt: Payload) => {
      const msg = evt?.message;
      if (!msg || typeof msg.id !== 'number') return;

      // ⚠️ страховка от дублей: если это моё же сообщение — пропускаем,
      // потому что локально мы его уже добавили оптимистично.
      const sid = extractSenderId(msg);
      if (meId != null && sid != null && sid === String(meId)) {
        return; // моё же сообщение — пропускаем
      }


      mutate((prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === msg.id)) return list; // защищаемся ещё и по id
        return [...list, msg];
      }, { revalidate: false });
    };

    channel.listen('.message.created', handler);

    return () => {
      channel.stopListening('.message.created', handler);
      echo.leave(`private-project.${projectId}`);
      echo.leave(`project.${projectId}`);
    };
  }, [projectId, meId, mutate]);

  return { messages: data ?? [], send, mutate };
}

/* =============== progress update =============== */

export async function updateProgress(
  projectId: number,
  progress: number,
  status?: Project['status']
) {
  const res = await fetch(`${API_URL}/projects/${projectId}/progress`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({ progress, status }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${txt}`.trim());
  }
  return (await res.json()) as { id: number; progress: number; status: Project['status'] };
}
