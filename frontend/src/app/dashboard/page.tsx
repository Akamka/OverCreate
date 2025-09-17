'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMe, useProjects } from '@/lib/hooks';
import { apiSend, clearToken } from '@/lib/api';

function ProgressMini({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        className="h-full bg-black transition-[width]"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // Хуки вызываем всегда
  const { user, error: meError, isLoading: meLoading } = useMe();
  const { projects, error: prError, isLoading: prLoading } = useProjects();

  const [logoutLoading, setLogoutLoading] = useState(false);

  const unauthorized = useMemo(() => {
    const msg = (meError as Error | undefined)?.message || '';
    return msg.includes('401') || msg.includes('Unauthenticated') || (!user && !meLoading);
  }, [meError, meLoading, user]);

  async function onLogout() {
    setLogoutLoading(true);
    try {
      await apiSend('/auth/logout', 'POST');
    } catch {
      // игнорим ошибки логаута — токен всё равно почистим
    } finally {
      clearToken();
      router.replace('/'); // на главную
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition"
        >
          ← На главную
        </button>

        <h1 className="text-xl font-semibold">Личный кабинет</h1>

        {user ? (
          <button
            onClick={onLogout}
            disabled={logoutLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 disabled:opacity-50 transition"
          >
            {logoutLoading ? 'Выходим…' : 'Logout'}
          </button>
        ) : (
          <span /> // заполнитель, чтобы заголовок был по центру
        )}
      </div>

      {/* Состояние: не авторизован */}
      {unauthorized && (
        <div className="rounded-2xl p-6 bg-white shadow">
          <div className="text-lg font-semibold mb-2">Вы не авторизованы</div>
          <p className="text-sm text-gray-600 mb-4">
            Войдите в аккаунт, чтобы увидеть ваши проекты.
          </p>
          <div className="flex gap-2">
            <Link
              href="/login?redirect=/dashboard"
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition"
            >
              Регистрация
            </Link>
          </div>
        </div>
      )}

      {/* Состояние: загрузка профиля */}
      {!unauthorized && meLoading && (
        <div className="rounded-2xl p-6 bg-white shadow">Загрузка профиля…</div>
      )}

      {/* Профиль */}
      {!unauthorized && !meLoading && user && (
        <div className="rounded-2xl p-6 bg-white shadow">
          <div className="text-lg font-semibold">Профиль</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Имя</div>
              <div className="font-medium">{user.name}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-gray-500">Роль</div>
              <div className="font-medium">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Проекты */}
      {!unauthorized && (
        <div className="rounded-2xl p-6 bg-white shadow">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Мои проекты</div>
            {prLoading && <div className="text-sm text-gray-500">Загрузка…</div>}
          </div>

          {prError && (
            <div className="mt-3 text-sm text-red-600">
              Не удалось загрузить проекты.
            </div>
          )}

          {!prLoading && !projects.length && !prError && (
            <div className="mt-3 text-sm text-gray-600">
              У вас пока нет проектов. Выберите услугу на главной странице, чтобы оформить заказ.
            </div>
          )}

          {!!projects.length && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      {p.description && (
                        <div className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                          {p.description}
                        </div>
                      )}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 shrink-0">
                      {p.status}
                    </div>
                  </div>
                  <ProgressMini value={p.progress ?? 0} />
                  <div className="mt-1 text-xs text-gray-500">
                    Исполнитель: {p.assignee?.name ?? '—'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
