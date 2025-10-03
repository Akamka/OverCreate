'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, type CSSProperties } from 'react';

import AutoScrollClamp from '@/components/utils/AutoScrollClamp';
import PremiumBackground from '@/components/PremiumBackground';
import { useMe, useProjects } from '@/lib/hooks';
import { apiSend, clearToken } from '@/lib/api';
import { useHydrated } from '@/lib/useHydrated';

/* ================= helpers ================= */

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(+d)) return '—';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function daysLeft(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(+d)) return null;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

/* — hover utilities — */
const liftCard =
  'motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-[3px] hover:border-white/20 hover:bg-white/[.06] hover:shadow-[0_22px_70px_-30px_rgba(0,0,0,.75)]';

const liftButton =
  'motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,.75)]';

/* ================= small atoms ================= */

function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'warn' | 'ok';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'text-white/90 border border-white/15 bg-white/[.06]',
    warn: 'text-amber-900 bg-gradient-to-r from-amber-300 to-rose-300 border border-amber-400/30',
    ok: 'text-emerald-950 bg-gradient-to-r from-emerald-300 to-teal-300 border border-emerald-400/30',
  } as const;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
        'shadow-[0_6px_20px_-10px_rgba(0,0,0,.55)]',
        'motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-[1px]',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}

/** Unified status pill (same palette as the /project page) */
function StatusBadge({ value }: { value: string }) {
  const label = (value || '').replaceAll('_', ' ').toLowerCase();

  // base pill
  const base =
    'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ' +
    'shadow-[0_6px_18px_-8px_rgba(0,0,0,.55)] ' +
    'border';

  // tones
  const tone =
    value === 'in_progress'
      ? // THE unified color: blue → purple (site accents)
        'text-indigo-900 border-white/10 ' +
        'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]'
      : value === 'done'
      ? 'text-emerald-950 border-emerald-400/30 bg-gradient-to-r from-emerald-300 to-teal-300'
      : value === 'paused'
      ? 'text-amber-900 border-amber-400/30 bg-gradient-to-r from-amber-300 to-rose-300'
      : 'text-white/90 border-white/15 bg-white/[.06]';

  return <span className={[base, tone].join(' ')}>{label}</span>;
}

function ProgressMini({ value }: { value: number }) {
  const v = clamp01(value);
  return (
    <div className="mt-3 h-2 rounded-full overflow-hidden border border-white/12 bg-white/[.06]">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${v}%`,
          background:
            'linear-gradient(90deg, rgb(var(--acc1)) 0%, rgb(var(--acc2)) 50%, rgb(var(--acc3)) 100%)',
          boxShadow: '0 0 16px rgb(var(--acc2) / .45), 0 0 28px rgb(var(--acc1) / .25)',
        }}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/12 bg-white/[.03] p-5 backdrop-blur-md',
        'shadow-[0_8px_40px_-18px_rgba(0,0,0,.55)] relative overflow-hidden',
        liftCard,
      ].join(' ')}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--acc1) / .12), transparent 40%), linear-gradient(315deg, rgb(var(--acc2) / .12), transparent 40%)',
          maskComposite: 'exclude',
        }}
      />
      <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-extrabold">
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc2)), rgb(var(--acc1)))' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ================= main ================= */

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const { user } = useMe();
  const { projects, isLoading: prLoading, error: prError } = useProjects();

  const [logoutLoading, setLogoutLoading] = useState(false);

  const totals = useMemo(() => {
    const total = projects?.length ?? 0;
    const inWork = projects?.filter((p) => p.status === 'in_progress')?.length ?? 0;
    const paused = projects?.filter((p) => p.status === 'paused')?.length ?? 0;
    const done = projects?.filter((p) => p.status === 'done')?.length ?? 0;
    return { total, inWork, paused, done };
  }, [projects]);

  async function onLogout() {
    setLogoutLoading(true);
    try {
      await apiSend('/auth/logout', 'POST');
    } catch {}
    finally {
      clearToken();
      router.replace('/');
    }
  }

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl p-6 bg-white/5 border border-white/10 text-white/70">Loading…</div>
      </div>
    );
  }

  const pageAccents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } =
    {
      '--acc1': '59 130 246',   // blue-500
      '--acc2': '168 85 247',   // purple-500
      '--acc3': '45 212 191',   // teal-400
    };

  return (
    <div className="relative min-h-[100dvh] text-white" style={pageAccents}>
      <PremiumBackground />
      <AutoScrollClamp />

      <div className="relative z-10 max-w-[1180px] mx-auto p-5 sm:p-8">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className={[
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              'border border-white/15 bg-white/5',
              'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
              liftButton,
            ].join(' ')}
          >
            ← Home
          </button>

          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
          >
            Dashboard
          </h1>

          <button
            onClick={onLogout}
            disabled={logoutLoading}
            className={[
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm disabled:opacity-60',
              'text-black',
              'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
              'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_0_0_1px_rgba(255,255,255,.15)_inset]',
              liftButton,
            ].join(' ')}
          >
            {logoutLoading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>

        {/* hero / profile */}
        <div
          className={[
            'mt-6 rounded-3xl border border-white/10 bg-white/[.03] p-6 sm:p-7 backdrop-blur-xl',
            'shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] relative overflow-hidden',
          ].join(' ')}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(70% 60% at 10% -10%, rgb(var(--acc1) / .10), transparent 60%), radial-gradient(70% 60% at 110% 110%, rgb(var(--acc2) / .10), transparent 60%)',
              filter: 'blur(60px)',
            }}
          />

          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={[
                  'grid place-items-center size-12 rounded-2xl ring-2 ring-white/20',
                  'bg-[linear-gradient(135deg,rgb(var(--acc2)),rgb(var(--acc1)))] text-black font-bold',
                  'shadow-[0_10px_30px_-10px_rgba(168,85,247,.6)]',
                  liftButton,
                ].join(' ')}
              >
                {(user?.name || 'D')[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">
                  Hi, {user?.name ?? 'Guest'} <span className="ml-1">👋</span>
                </div>
                <div className="text-white/70 text-sm">{user?.email ?? '—'}</div>
              </div>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <Link
                href="/#order"
                className={[
                  'px-4 py-2 rounded-xl font-semibold text-black',
                  'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
                  'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
                  liftButton,
                ].join(' ')}
              >
                New order
              </Link>
              <Link
                href="/#contacts"
                className={[
                  'px-4 py-2 rounded-xl border border-white/20 bg-white/5',
                  'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
                  liftButton,
                ].join(' ')}
              >
                Support
              </Link>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total" value={totals.total} />
            <StatCard label="In progress" value={totals.inWork} />
            <StatCard label="Paused" value={totals.paused} />
            <StatCard label="Done" value={totals.done} />
          </div>
        </div>

        {/* My projects */}
        <div
          className={[
            'mt-6 rounded-3xl border border-white/10 bg-white/[.03] p-6 sm:p-7 backdrop-blur-xl',
            'shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)]',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-xl font-semibold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc2)), rgb(var(--acc1)))' }}
            >
              My projects
            </div>
            {prLoading && <div className="text-sm text-white/60">Loading…</div>}
          </div>

          {prError && (
            <div className="mt-4 text-sm text-rose-300/90">
              Failed to load projects. Please refresh the page.
            </div>
          )}

          {!prLoading && !projects?.length && !prError && (
            <div className="mt-4 text-sm text-white/75">
              You have no projects yet. Choose a service on the home page to create your first order.
            </div>
          )}

          {!!projects?.length && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects!.map((p) => {
                const left = daysLeft(p.due_at);
                const overdue = left === 0 && !!p.due_at;

                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className={[
                      'group block rounded-2xl border border-white/10 bg-white/[.035] p-5 backdrop-blur-md',
                      'shadow-[0_10px_30px_-20px_rgba(0,0,0,.8)] relative overflow-hidden',
                      liftCard,
                    ].join(' ')}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(var(--acc1) / .14), transparent 40%), linear-gradient(315deg, rgb(var(--acc2) / .14), transparent 40%)',
                      }}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-tight">{p.title}</div>
                        {!!p.description && (
                          <div className="text-sm text-white/70 line-clamp-2 mt-1">{p.description}</div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {/* unified status pill */}
                        <StatusBadge value={p.status} />
                      </div>
                    </div>

                    <ProgressMini value={p.progress ?? 0} />

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className={['rounded-lg border border-white/12 bg-white/[.04] px-3 py-2', liftCard].join(' ')}>
                        <div className="text-white/60 text-xs">Start</div>
                        <div className="font-medium">{fmtDate(p.start_at)}</div>
                      </div>

                      <div className={['rounded-lg border border-white/12 bg-white/[.04] px-3 py-2', liftCard].join(' ')}>
                        <div className="text-white/60 text-xs">Deadline</div>
                        <div className="font-medium flex items-center gap-2">
                          {fmtDate(p.due_at)}
                          {overdue && <Badge tone="warn">today</Badge>}
                          {!overdue && typeof left === 'number' && left > 0 && (
                            <Badge tone="ok">{left} days left</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-white/70">
                      Assignee: <span className="text-white font-medium">{p.assignee?.name ?? '—'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
