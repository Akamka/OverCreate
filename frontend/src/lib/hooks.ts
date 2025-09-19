'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { apiGet, apiSend, getToken } from './api';
import { getEcho } from './realtime';

import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { Message } from '@/types/message';
import type { Paginated } from './api';

type HttpishError = Error & { status?: number };

/** Текущий пользователь */
export function useMe() {
  // ключ зависит от токена — SWR перезапустится сразу после логина/логаута
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

/** Список проектов пользователя (грузим ТОЛЬКО когда есть токен) */
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

/** Один проект по id (тоже ждём токен) */
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

/** Сообщения + realtime (ждём projectId И токен, иначе не подписываемся/не грузим) */
export function useMessages(projectId: string | null | undefined) {
  const token = getToken();
  const key = projectId && token ? [`/projects/${projectId}/messages`, token] : null;

  const { data, mutate } = useSWR<Message[]>(key, ([p]) => apiGet<Message[]>(p), {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  async function send(body: string) {
    if (!projectId) return;
    const msg = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', { body });
    await mutate([...(data ?? []), msg], { revalidate: false });
  }

  useEffect(() => {
    if (!projectId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel(`project.${projectId}`);
    const handler = (e: { message: Message }) => {
      mutate([...(data ?? []), e.message], { revalidate: false });
    };

    channel.listen('.message.created', handler);
    return () => {
      channel.stopListening('.message.created', handler);
      echo.leave(`project.${projectId}`);
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
