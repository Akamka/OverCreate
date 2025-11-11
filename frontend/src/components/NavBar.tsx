'use client';

import { useEffect, useMemo, useRef, useState, MouseEvent } from 'react';
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

  /* ── mount + env ────────────────────────────────────────────── */
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  /* ── auth check ─────────────────────────────────────────────── */
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

  /* ── measure height ─────────────────────────────────────────── */
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

  /* ── smooth scroll to section ───────────────────────────────── */
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

  /* ── scrollspy ──────────────────────────────────────────────── */
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
    () => (id: string) => pathname === '/' && active === id,
    [active, pathname]
  );

  /* ── classes ───────────────────────────────────────────────── */
  const shell =
    'rounded-full px-2 py-1 border border-white/12 backdrop-blur-xl bg-white/[0.06] shadow-md shadow-black/20';

  const chipBase =
    'relative px-3 py-1.5 rounded-full text-sm transition-all will-change-transform select-none text-white/80 hover:text-white hover:bg-white/10';
  const chipActive = 'bg-white/14 text-white';

  const pageLinkBase =
    'px-3 py-2 rounded-full text-sm transition-all text-white/80 hover:text-white hover:bg-white/8 border border-white/10';

  const ctaPrimary =
    'px-3 py-2 rounded-full text-sm transition-all bg-white text-neutral-900 hover:bg-white/90';

  /* ── inline icon (↗) для страниц ───────────────────────────── */
  const ArrowUpRight = ({ className = 'h-[14px] w-[14px] opacity-70' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  /* ── groups content ─────────────────────────────────────────── */
  const SectionLinks = (
    <div className="flex items-center gap-1">
      {items.map((i) => {
        const activeNow = isActive(i.id);
        return (
          <button
            key={i.id}
            onClick={() => onClickItem(i.id)}
            className={`${chipBase} ${activeNow ? chipActive : ''}`}
            aria-current={activeNow ? 'true' : undefined}
            aria-label={`Go to section ${i.label}`}
          >
            <span className="relative inline-flex items-center">
              {i.label}
              {/* мягкий underline эффект */}
              <span
                aria-hidden
                className={`absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full bg-white/70 transition-opacity ${
                  activeNow ? 'opacity-80' : 'opacity-0 group-hover:opacity-60'
                }`}
              />
            </span>
          </button>
        );
      })}
    </div>
  );

  const PageLinks = (
    <div className="flex items-center gap-1">
      <Link href="/insights" onClick={() => setMenuOpen(false)} className={pageLinkBase} title="Opens page">
        <span className="inline-flex items-center gap-1">
          Insights <ArrowUpRight />
        </span>
      </Link>

      {authed ? (
        <button onClick={goCabinet} className={ctaPrimary}>
          Dashboard
        </button>
      ) : (
        <>
          <Link href="/login?redirect=/dashboard" onClick={() => setMenuOpen(false)} className={pageLinkBase} title="Opens page">
            <span className="inline-flex items-center gap-1">
              Sign in <ArrowUpRight />
            </span>
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className={ctaPrimary} title="Opens page">
            Sign Up
          </Link>
        </>
      )}
    </div>
  );

  /* ── nav content (desktop / touch) ──────────────────────────── */
  const NavContent = (
    <nav
      className={`flex ${isTouch ? 'flex-col gap-3 p-3' : 'flex-row items-center gap-2'}`}
      aria-label="Global navigation"
    >
      {/* Секции (по странице) */}
      {SectionLinks}

      {/* Делитель */}
      <div className={`${isTouch ? 'my-1' : 'mx-2'} h-6 w-px bg-white/12`} aria-hidden />

      {/* Страницы */}
      {PageLinks}
    </nav>
  );

  const Bar = (
    <div
      className="fixed left-0 right-0 z-[100000] flex justify-center pt-[env(safe-area-inset-top,0)] md:pt-4"
      style={{ top: 16 }}
    >
      <div ref={barRef} className={shell}>
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
              <div className="absolute top-full right-0 mt-2 w-[min(92vw,360px)] rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-xl">
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
      {/* spacer, чтобы контент не подпрыгивал */}
      <div style={{ height: barH + 32 }} aria-hidden />
      {mounted ? createPortal(Bar, document.body) : null}
    </>
  );
}
