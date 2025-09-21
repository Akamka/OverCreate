'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMe, useProjects } from '@/lib/hooks';
import { apiSend, clearToken } from '@/lib/api';
import { useHydrated } from '@/lib/useHydrated';

/* -------- helpers: формат даты и дни до дедлайна -------- */
function formatDate(d: Date) {
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
function daysLeft(due: Date) {
  return Math.max(0, Math.ceil((due.getTime() - Date.now()) / 86_400_000));
}

function ProgressMini({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full bg-black transition-[width]" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, unauthorized, error: meError, isLoading: meLoading } = useMe();
  const { projects, error: prError, isLoading: prLoading } = useProjects();

  const [logoutLoading, setLogoutLoading] = useState(false);

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl p-6 bg-white shadow">Загрузка…</div>
      </div>
    );
  }

  async function onLogout() {
    setLogoutLoading(true);
    try {
      await apiSend('/auth/logout', 'POST');
    } catch {
      /* ignore */
    } finally {
      clearToken();
      router.replace('/');
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
          <span />
        )}
      </div>

      {/* Не авторизован */}
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

      {/* Загрузка профиля */}
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
            <div>
              <div className="text-gray-500">Подтверждение почты</div>
              <div className="font-medium">
                {user.email_verified_at ? '✅ Verified' : '⛔ Not verified'}
              </div>
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
            <div className="mt-3 text-sm text-red-600">Не удалось загрузить проекты.</div>
          )}

          {!prLoading && !projects.length && !prError && (
            <div className="mt-3 text-sm text-gray-600">
              У вас пока нет проектов. Выберите услугу на главной странице, чтобы оформить заказ.
            </div>
          )}

          {!!projects.length && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => {
                /* ------ вычисляем даты для карточки ------ */
                const start = p.start_at ? new Date(p.start_at) : undefined;
                const due = p.due_at ? new Date(p.due_at) : undefined;
                const overdue = !!(due && due.getTime() < Date.now());

                return (
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

                    {/* -------- 📅 Дедлайн -------- */}
                    {(start || due) && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">📅 Дедлайн: </span>
                        <span className="font-medium">
                          {start ? formatDate(start) : '—'} —{' '}
                          <span className={overdue ? 'text-red-600' : 'text-emerald-700'}>
                            {due ? formatDate(due) : 'не задан'}
                          </span>
                        </span>
                        {overdue && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700">
                            просрочен
                          </span>
                        )}
                        {!overdue && due && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            осталось {daysLeft(due)} дн.
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-1 text-xs text-gray-500">
                      Исполнитель: {p.assignee?.name ?? '—'}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
