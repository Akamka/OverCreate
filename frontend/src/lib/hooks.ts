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

export function useMessages(projectId: string | null | undefined) {
  const key = projectId ? `/projects/${projectId}/messages` : null;

  const { data, mutate } = useSWR<Message[]>(key, apiGet, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  async function send(body: string, files?: File[]) {
    if (!projectId) return;

    if (!files || files.length === 0) {
      const msg = await apiSend<Message>(`/projects/${projectId}/messages`, 'POST', { body });
      await mutate(prev => ([...(prev ?? []), msg]), { revalidate: false });
      return;
    }

    const form = new FormData();
    if (body?.trim()) form.append('body', body.trim());
    files.forEach((f) => form.append('files[]', f));

    const msg = await apiSendForm<Message>(`/projects/${projectId}/messages`, form, 'POST');
    await mutate(prev => ([...(prev ?? []), msg]), { revalidate: false });
  }

  useEffect(() => {
    if (!projectId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`project.${projectId}`);

    type Payload = { message?: Message };

    const handler = (evt: Payload) => {
      const msg = evt?.message;
      if (!msg || typeof msg.id !== 'number') return;

      mutate((prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === msg.id)) return list;
        return [...list, msg];
      }, { revalidate: false });
    };

    channel.listen('.message.created', handler);

    return () => {
      channel.stopListening('.message.created', handler);
      echo.leave(`private-project.${projectId}`);
      echo.leave(`project.${projectId}`);
    };
  }, [projectId, mutate]);

  return { messages: data ?? [], send, mutate };
}

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
