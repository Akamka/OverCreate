'use client';

import { useRouter } from 'next/navigation';

export default function DashboardTopBar() {
  const router = useRouter();
  return (
    <div className="mb-4">
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition"
      >
        ← На главную
      </button>
    </div>
  );
}
