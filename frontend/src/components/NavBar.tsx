'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

const items = [
  { id: 'home',         label: 'Главная' },
  { id: 'services',     label: 'Услуги' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'about',        label: 'О студии' },
  { id: 'contact',      label: 'Контакты' },
];

export default function NavBar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = () => setAuthed(!!getToken());
    check();
    const onVis = () => check();
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, []);

  const isHome = pathname === '/';

  function goCabinet() {
    if (authed) router.push('/dashboard');
    else router.push('/login?redirect=/dashboard');
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
      <div className="glass rounded-full px-2 py-1 border border-white/10">
        <nav className="flex items-center gap-1">
          {isHome && (
            <>
              {items.map((i) => (
                <button
                  key={i.id}
                  onClick={() =>
                    document.getElementById(i.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }
                  className="px-3 py-1.5 rounded-full text-sm text-neutral-200 hover:bg-white/10 transition"
                >
                  {i.label}
                </button>
              ))}

              <span className="mx-1 h-5 w-px bg-white/10" />

              {authed ? (
                <button
                  onClick={goCabinet}
                  className="px-3 py-1.5 rounded-full text-sm bg-white text-neutral-900 hover:bg-white/90 transition"
                >
                  Личный кабинет
                </button>
              ) : (
                <>
                  <Link
                    href="/login?redirect=/dashboard"
                    className="px-3 py-1.5 rounded-full text-sm text-neutral-200 hover:bg-white/10 transition"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 rounded-full text-sm bg-white text-neutral-900 hover:bg-white/90 transition"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
