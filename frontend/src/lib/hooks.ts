// src/lib/hooks.ts
'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { apiGet, apiSend, apiSendForm, getToken } from './api';
import { getEcho } from './realtime';

import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { Message } from '@/types/message';
import type { Paginated } from './api';

type HttpishError = Error & { status?: number };

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

/** Проекты пользователя */
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

/** Проект по id */
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

/** Сообщения + realtime (с защитой от двойной подписки) */
export function useMessages(projectId: string | null | undefined) {
  const key = projectId ? `/projects/${projectId}/messages` : null;

  const { data, mutate } = useSWR<Message[]>(key, apiGet, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Отправка
  async function send(body: string, files?: File[]) {
    if (!projectId) return;

    if (!files || files.length === 0) {
      const msg = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', { body });
      // Мгновенно добавляем локально (а потом realtime просто проигнорирует дубликат по id)
      await mutate(prev => ([...(prev ?? []), msg]), { revalidate: false });
      return;
    }

    const form = new FormData();
    if (body?.trim()) form.append('body', body.trim());
    files.forEach((f) => form.append('files[]', f));

    const msg = await apiSendForm<Message>(`/projects/${projectId}/messages`, form, 'POST');
    await mutate(prev => ([...(prev ?? []), msg]), { revalidate: false });
  }

  // ---------- realtime-подписка (однократная для каждого projectId) ----------
  const subscribedProjectRef = useRef<string | null>(null);
  const handlerRef = useRef<((evt: { message?: Message }) => void) | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const echo = getEcho();
    if (!echo) return;

    // если уже подписались на этот projectId — не дублируем
    if (subscribedProjectRef.current === projectId) {
      return;
    }

    const channelName = `project.${projectId}`;
    const channel = echo.private(channelName);

    // На всякий пожарный: снимаем старый обработчик этого события (если был)
    channel.stopListening('.message.created');

    const handler = (evt: { message?: Message }) => {
      const msg = evt?.message;
      if (!msg || typeof msg.id !== 'number') return;

      // Защита от дублей: если такой id уже в списке — пропускаем
      mutate((prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === msg.id)) return list;
        return [...list, msg];
      }, { revalidate: false });
    };

    handlerRef.current = handler;

    channel.listen('.message.created', handler);

    subscribedProjectRef.current = projectId;

    return () => {
      // Отписываемся корректно
      try {
        if (handlerRef.current) {
          channel.stopListening('.message.created', handlerRef.current);
        } else {
          channel.stopListening('.message.created');
        }
      } catch {}

      try { echo.leave(`private-project.${projectId}`); } catch {}
      try { echo.leave(`project.${projectId}`); } catch {}

      if (subscribedProjectRef.current === projectId) {
        subscribedProjectRef.current = null;
      }
      handlerRef.current = null;
    };
  }, [projectId, mutate]); // mutate стабилен в SWR, зависимости ок

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
