'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { apiGet, apiSend, apiSendForm, getToken } from './api';
import { getEcho, projectChannel } from './realtime';

import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { Message } from '@/types/message';
import type { Paginated } from './api';

type HttpishError = Error & { status?: number };

function isPaginated<T>(val: unknown): val is { data: T[] } {
  if (typeof val !== 'object' || val === null) return false;
  const maybe = val as { data?: unknown };
  return Array.isArray(maybe.data);
}

/** Текущий пользователь */
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

/** Список проектов пользователя */
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

/** Один проект по id */
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

/** Сообщения + realtime */
export function useMessages(projectId: string | null | undefined) {
  const key = projectId ? `/projects/${projectId}/messages` : null;

  const { data, mutate } = useSWR<Message[]>(
    key,
    async (k: string) => {
      const res = await apiGet<unknown>(k);
      if (Array.isArray(res)) return res as Message[];
      if (isPaginated<Message>(res)) return res.data;
      return [];
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  async function send(body: string, files?: File[]) {
    if (!projectId) return;

    if (!files || files.length === 0) {
      const msg = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', { body });
      await mutate([...(data ?? []), msg], { revalidate: false });
      return;
    }

    const form = new FormData();
    if (body?.trim()) form.append('body', body.trim());
    files.forEach((f) => form.append('files[]', f));

    const msg = await apiSendForm<Message>(`/projects/${projectId}/messages`, form, 'POST');
    await mutate([...(data ?? []), msg], { revalidate: false });
  }

  useEffect(() => {
    if (!projectId) return;
    if (!getToken()) return; // приватные каналы требуют токен

    const ch = projectChannel(projectId);
    if (!ch) return;

    const handler = (e: { message: Message }) => {
      mutate([...(data ?? []), e.message], { revalidate: false });
    };

    ch.listen('.message.created', handler);

    return () => {
      ch.stopListening('.message.created', handler);
      getEcho()?.leave(ch.name);
    };
  }, [projectId, data, mutate]);

  return { messages: data ?? [], send, mutate };
}

/** Обновление прогресса проекта */
export async function updateProgress(
  projectId: number,
  progress: number,
  status?: Project['status']
) {
  return apiSend<{ id: number; progress: number; status: Project['status'] }>(
    `/projects/${projectId}/progress`,
    'PATCH',
    { progress, status }
  );
}
