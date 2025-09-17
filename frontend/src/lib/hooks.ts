'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { apiGet, apiSend } from './api';
import { getEcho } from './realtime';

import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { Message } from '@/types/message';
import type { Paginated } from './api';

/** Текущий пользователь */
export function useMe() {
  const { data, error, isLoading } = useSWR<User>(
    '/me',
    (p: string) => apiGet<User>(p)
  );
  return { user: data ?? null, error, isLoading };
}

/** Список проектов пользователя (пагинация с бэка) */
export function useProjects() {
  const { data, error, isLoading } = useSWR<Paginated<Project>>(
    '/projects',
    (p: string) => apiGet<Paginated<Project>>(p)
  );
  return { projects: data?.data ?? [], error, isLoading };
}

/** Один проект по id (id может быть undefined — тогда запрос не пойдёт) */
export function useProject(id: number | undefined) {
  const key = typeof id === 'number' && Number.isFinite(id) ? `/projects/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<Project>(
    key,
    (p: string) => apiGet<Project>(p)
  );

  return { project: data ?? null, error, isLoading, mutate };
}

/** Сообщения проекта + отправка + подписка на realtime */
export function useMessages(projectId: string | null | undefined) {
  // если id нет — SWR не дергается
  const key = projectId ? `/projects/${projectId}/messages` : null;
  const { data, mutate } = useSWR<Message[]>(key, apiGet);

  async function send(body: string) {
    if (!projectId) return;
    const msg = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', { body });
    await mutate([...(data ?? []), msg], { revalidate: false });
  }

  // WebSocket подписка — всегда внутри useEffect и с отпиской
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
