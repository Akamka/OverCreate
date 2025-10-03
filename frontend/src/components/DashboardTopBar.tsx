'use client';

import { useRouter } from 'next/navigation';

export default function DashboardTopBar() {
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-sm hover:bg-white/20 transition"
      >
        ← На главную
      </button>

      <div className="hidden md:block text-sm text-white/70">
        Работает безопасное шифрование, чат и файлы живут в проекте.
      </div>
    </div>
  );
}
