'use client';

import { useEffect } from 'react';
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

/** Сообщения + realtime (private/public, антидубли, оптимистичная отправка) */
export function useMessages(projectId: string | null | undefined) {
  const key = projectId ? `/projects/${projectId}/messages` : null;
  const { data, mutate } = useSWR<Message[]>(key, apiGet, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // ---- отправка (с оптимистичным локальным сообщением) ----
  async function send(body: string, files?: File[]) {
    if (!projectId) return;

    const trimmed = body.trim();
    // Временный отрицательный id, чтобы не конфликтовать с серверными
    const tempId = -Date.now();

    // оптимистичное локальное сообщение
    const optimistic: Message & { state: 'sending'; isMine: true } = {
      id: tempId,
      body: trimmed,
      created_at: new Date().toISOString(),
      sender: undefined,
      attachments: [],
      // локальные поля для UI:

      state: 'sending',

      isMine: true,
    };

    mutate([...(data ?? []), optimistic], { revalidate: false });

    try {
      let saved: Message;
      if (!files || files.length === 0) {
        const payload = trimmed ? { body: trimmed } : {};
        saved = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', payload);
      } else {
        const form = new FormData();
        if (trimmed) form.append('body', trimmed);
        files.forEach((f) => form.append('files[]', f));
        saved = await apiSendForm<Message>(`/projects/${projectId}/messages`, form, 'POST');
      }

      // заменяем оптимистичное сообщение реальным
      mutate((prev) => {
        const list = prev ?? [];
        const withoutTemp = list.filter((m) => m.id !== tempId);
        // если realtime уже принёс это сообщение — не дублируем
        if (withoutTemp.some((m) => m.id === saved.id)) return withoutTemp;
        return [...withoutTemp, saved];
      }, { revalidate: false });
    } catch (e) {
      // помечаем ошибку на оптимистичном
      mutate((prev) =>
        (prev ?? []).map((m) =>
          m.id === tempId

            ? { ...m, state: 'error' }
            : m
        ),
        { revalidate: false }
      );
      throw e;
    }
  }

  // ---- realtime подписка ----
  useEffect(() => {
    if (!projectId) return;

    const echo = getEcho();
    if (!echo) return;

    // Сервисы могут слать и в public, и в private — слушаем оба безопасно
    const publicChannel = echo.channel(`project.${projectId}`);
    const privateChannel = echo.private(`project.${projectId}`);

    const pushUnique = (msg: Message): void => {
      mutate((prev) => {
        const list = prev ?? [];
        if (typeof msg.id === 'number' && list.some((m) => m.id === msg.id)) {
          return list; // антидубль
        }
        return [...list, msg];
      }, { revalidate: false });
    };

    // Событие может прийти либо как { message }, либо прямо Message
    type EventPayload = Message | { message?: Message };

    const handler = (payload: EventPayload): void => {
      const msg: Message | undefined =
        (payload as { message?: Message }).message ?? (payload as Message);
      if (msg && typeof msg.id === 'number') pushUnique(msg);
    };

    // разные варианты имени события
    const eventNames = [
      '.message.created',
      'MessageCreated',
      'App\\Events\\MessageCreated',
    ] as const;

    eventNames.forEach((ev) => {
      publicChannel.listen(ev, handler);
      privateChannel.listen(ev, handler);
    });

    return () => {
      eventNames.forEach((ev) => {
        publicChannel.stopListening(ev, handler);
        privateChannel.stopListening(ev, handler);
      });
      // отписка от обоих вариантов имени канала
      echo.leave(`project.${projectId}`);
      echo.leave(`private-project.${projectId}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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
