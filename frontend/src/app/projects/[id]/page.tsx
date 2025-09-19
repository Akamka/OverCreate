'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useMe, useProject, useMessages, updateProgress } from '@/lib/hooks';
import ProjectChat from '@/components/ProjectChat';
import ProgressBar from '@/components/ui/ProgressBar';
import VerifiedGate from '@/components/VerifiedGate';
import { useHydrated } from '@/lib/useHydrated';

type HttpLikeError = Error & { status?: number };

export default function ProjectPage() {
  const router = useRouter();
  const hydrated = useHydrated();                       // ← ждём, пока клиент «встанет»
  const params = useParams<{ id: string }>();
  const rawId = params?.id ?? '';

  // вычисляем ID ОДИН раз; хуки ниже всегда вызываются
  const numericId = useMemo(
    () => (/^\d+$/.test(rawId) ? Number(rawId) : undefined),
    [rawId]
  );
  const projectIdStr = numericId ? String(numericId) : null;

  // хуки — вызываются всегда
  const { user } = useMe();
  const { project, error, isLoading, mutate } = useProject(numericId);
  const { messages, send } = useMessages(projectIdStr);

  const [localProgress, setLocalProgress] = useState<number | undefined>(undefined);
  const invalidId = !numericId;

  async function saveProgress() {
    if (!numericId || localProgress == null) return;
    await updateProgress(numericId, localProgress);
    await mutate();
  }

  // Пока не гидратировались — рендерим стабильный скелет (без VerifiedGate и без условных редиректов)
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl p-6 bg-white shadow">Загрузка…</div>
      </div>
    );
  }

  // После гидратации применяем все проверки (включая VerifiedGate)
  return (
    <VerifiedGate>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Кнопка назад */}
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition"
          >
            ← Назад
          </button>
        </div>

        {invalidId ? (
          <div className="p-6 space-y-2">
            <div className="text-lg font-semibold">Неверный адрес проекта</div>
            <div className="text-sm text-gray-600">
              Откройте <code>/projects/1</code> (реальный ID) или перейдите из личного кабинета.
            </div>
          </div>
        ) : isLoading ? (
          <div className="p-6">Загрузка…</div>
        ) : error ? (
          <div className="p-6 space-y-2">
            <div className="text-lg font-semibold">
              {(error as HttpLikeError)?.status === 401
                ? 'Нужна авторизация.'
                : (error as HttpLikeError)?.status === 403
                ? 'Нет доступа к этому проекту.'
                : 'Проект не найден.'}
            </div>
            <a href="/dashboard" className="underline text-sm">
              Вернуться в личный кабинет
            </a>
          </div>
        ) : !project ? (
          <div className="p-6">
            Проект не найден.{' '}
            <a href="/dashboard" className="underline">
              Вернуться назад
            </a>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-6 bg-white shadow">
              <h1 className="text-2xl font-semibold">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}

              <div className="mt-4">
                <ProgressBar value={localProgress ?? project.progress} />
                <div className="text-xs text-gray-500 mt-1">
                  Статус: {project.status} • Исполнитель: {project.assignee?.name ?? '—'}
                </div>
              </div>

              {!!user && (user.role === 'admin' || user.id === project.assignee?.id) && (
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={localProgress ?? project.progress}
                    onChange={(e) => setLocalProgress(Number(e.target.value))}
                    className="w-64"
                  />
                  <button
                    onClick={saveProgress}
                    className="px-4 py-2 rounded-xl bg-black text-white"
                  >
                    Сохранить
                  </button>
                  <span className="text-sm">{localProgress ?? project.progress}%</span>
                </div>
              )}
            </div>

            <ProjectChat messages={messages} onSend={send} meId={user?.id} />
          </>
        )}
      </div>
    </VerifiedGate>
  );
}
