'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

const items = [
  { id: 'home',         label: 'Home' },
  { id: 'services',     label: 'Services' },
  { id: 'about',        label: 'About' },        // About перед Reviews
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact',      label: 'Contacts' },
];

export default function NavBar() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [barH, setBarH] = useState(0);
  const [mounted, setMounted] = useState(false);      // для портала
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // auth
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

  // замеряем высоту «пилюли» для спейсера/скролла
  useEffect(() => {
    const update = () => setBarH(barRef.current?.offsetHeight ?? 0);
    update();
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (barRef.current && ro) ro.observe(barRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // плавный скролл с учётом высоты бара
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rectTop = el.getBoundingClientRect().top;
    const top = rectTop + window.scrollY - (barH + 8);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const onClickItem = (id: string) => {
    if (pathname === '/') {
      scrollToId(id);
    } else {
      router.push(`/#${id}`);
      // подстрахуем после навигации
      setTimeout(() => scrollToId(id), 50);
    }
  };

  const goCabinet = () => {
    if (authed) router.push('/dashboard');
    else router.push('/login?redirect=/dashboard');
  };

  // активная подсветка
  const [active, setActive] = useState<string>('home');
  useEffect(() => {
    if (pathname !== '/') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: `-${barH + 16}px 0px -70% 0px`, threshold: 0.08 }
    );
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [barH, pathname]);

  const isActive = useMemo(
    () => (id: string) =>
      pathname === '/' && active === id ? 'bg-white/15 text-white' : '',
    [active, pathname]
  );

  const pill =
    'rounded-full px-2 py-1 border border-white/10 backdrop-blur-xl bg-white/5 ' +
    'shadow-md shadow-black/10';
  const btnBase =
    'px-3 py-1.5 rounded-full text-sm transition will-change-transform select-none';
  const btn =
    `${btnBase} text-neutral-200 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0`;
  const btnPrimary =
    `${btnBase} bg-white text-neutral-900 hover:bg-white/90 hover:-translate-y-0.5 active:translate-y-0`;

  // сам бар (портал)
  const Bar = (
    <div
      // фиксируем к ВЬЮПОРТУ: портал в body обходит contain/transform у предков
      className="fixed left-0 right-0 z-[100000] flex justify-center pt-3 md:pt-4"
      style={{ top: 24 }} // top-6
    >
      <div ref={barRef} className={pill}>
        <nav className="flex items-center gap-1">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => onClickItem(i.id)}
              className={`${btn} ${isActive(i.id)}`}
            >
              {i.label}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-white/10" />

          {authed ? (
            <button onClick={goCabinet} className={btnPrimary}>
              Dashboard
            </button>
          ) : (
            <>
              <Link href="/login?redirect=/dashboard" className={btn}>
                Sign in
              </Link>
              <Link href="/register" className={btnPrimary}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Спейсер в потоке страницы, чтобы контент не прятался под fixed-баром */}
      <div style={{ height: barH + 24 + 8 }} aria-hidden />

      {/* Сам бар — в портал. Так он не зависит от .oc-bg-root { contain: paint } */}
      {mounted ? createPortal(Bar, document.body) : null}
    </>
  );
}
