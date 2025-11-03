'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

const items = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact', label: 'Contacts' },
];

export default function NavBar() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [barH, setBarH] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  // mount + environment check
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  // auth check
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

  // measure height
  useEffect(() => {
    const update = () => setBarH(barRef.current?.offsetHeight ?? 0);
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (barRef.current && ro) ro.observe(barRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // scroll logic
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rectTop = el.getBoundingClientRect().top;
    const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const top = rectTop + window.scrollY - (barH + 8 + safeTop);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const onClickItem = (id: string) => {
    setMenuOpen(false);
    if (pathname === '/') {
      scrollToId(id);
    } else {
      router.push(`/#${id}`);
      setTimeout(() => scrollToId(id), 50);
    }
  };

  const goCabinet = () => {
    setMenuOpen(false);
    if (authed) router.push('/dashboard');
    else router.push('/login?redirect=/dashboard');
  };

  // active highlighting
  const [active, setActive] = useState<string>('home');
  useEffect(() => {
    if (pathname !== '/') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: `-${barH + 16}px 0px -70% 0px`, threshold: 0.08 }
    );
    const targets = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [barH, pathname]);

  const isActive = useMemo(
    () => (id: string) => (pathname === '/' && active === id ? 'bg-white/15 text-white' : ''),
    [active, pathname]
  );

  const pill =
    'rounded-full px-3 py-1 border border-white/10 backdrop-blur-xl bg-white/5 shadow-md shadow-black/10';
  const btnBase =
    'px-3 py-2 rounded-full text-sm transition will-change-transform select-none';
  const btn =
    `${btnBase} text-neutral-200 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0`;
  const btnPrimary =
    `${btnBase} bg-white text-neutral-900 hover:bg-white/90 hover:-translate-y-0.5 active:translate-y-0`;

  // nav content
  const NavContent = (
    <nav className={`flex ${isTouch ? 'flex-col gap-2 p-3' : 'flex-row items-center gap-1'}`}>
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => onClickItem(i.id)}
          className={`${btn} ${isActive(i.id)}`}
        >
          {i.label}
        </button>
      ))}

      <span className={`${isTouch ? 'hidden' : 'mx-1 h-5 w-px bg-white/10'}`} />

      {authed ? (
        <button onClick={goCabinet} className={btnPrimary}>
          Dashboard
        </button>
      ) : (
        <>
          <Link href="/login?redirect=/dashboard" onClick={() => setMenuOpen(false)} className={btn}>
            Sign in
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className={btnPrimary}>
            Sign Up
          </Link>
        </>
      )}
    </nav>
  );

  const Bar = (
    <div
      className="fixed left-0 right-0 z-[100000] flex justify-center pt-[env(safe-area-inset-top,0)] md:pt-4"
      style={{ top: 16 }}
    >
      <div ref={barRef} className={pill}>
        {isTouch ? (
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-lg">
                {NavContent}
              </div>
            )}
          </div>
        ) : (
          NavContent
        )}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ height: barH + 32 }} aria-hidden />
      {mounted ? createPortal(Bar, document.body) : null}
    </>
  );
}
