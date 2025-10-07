'use client';

import { useMemo, useState, useEffect, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';

import PremiumBackground from '@/components/PremiumBackground';
import VerifiedGate from '@/components/VerifiedGate';
import ProjectChat from '@/components/ProjectChat';
import ProgressBar from '@/components/ui/ProgressBar';

import { useHydrated } from '@/lib/useHydrated';
import { useMe, useProject, useMessages, updateProgress } from '@/lib/hooks';

type HttpLikeError = Error & { status?: number };


export const metadata = {
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null as unknown as undefined },
};


/* ============ helpers ============ */

function SafeClientName(p: unknown): string | undefined {
  return (p as { user?: { name?: string | null } } | undefined)?.user?.name ?? undefined;
}
function SafeCreatedAt(p: unknown): string | undefined {
  return (p as { created_at?: string | null } | undefined)?.created_at ?? undefined;
}

/** Unified status pill (matches dashboard StatusBadge) */
function StatusPill({ value }: { value: string }) {
  const label = value.replaceAll('_', ' ').toLowerCase();
  const base =
    'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold select-none ' +
    'shadow-[0_6px_18px_-8px_rgba(0,0,0,.55)] border';

  const tone =
    value === 'in_progress'
      ? 'text-indigo-900 border-white/10 bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]'
      : value === 'done'
      ? 'text-emerald-950 border-emerald-400/30 bg-gradient-to-r from-emerald-300 to-teal-300'
      : value === 'paused'
      ? 'text-amber-900 border-amber-400/30 bg-gradient-to-r from-amber-300 to-rose-300'
      : 'text-white/90 border-white/15 bg-white/[.06]';

  return <span className={[base, tone].join(' ')}>{label}</span>;
}

function MetaTile({ label, value }: { label: string; value?: string }) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border border-white/12 bg-white/[.04] px-4 py-3 backdrop-blur',
        'transition-all duration-300',
        'hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[.06]',
        'hover:shadow-[0_18px_48px_-28px_rgba(0,0,0,.85),0_0_0_1px_rgba(255,255,255,.06)]',
      ].join(' ')}
    >
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-sm text-white/95">{value ?? '—'}</div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--acc1) / .10), transparent 50%), linear-gradient(315deg, rgb(var(--acc2) / .10), transparent 50%)',
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
}



/* ============ page ============ */

export default function ProjectPage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const params = useParams<{ id: string }>();
  const rawId = params?.id ?? '';

  const numericId = useMemo(() => (/^\d+$/.test(rawId) ? Number(rawId) : undefined), [rawId]);
  const projectIdStr = numericId ? String(numericId) : null;

  const { user } = useMe();
  const { project, error, isLoading, mutate } = useProject(numericId);
  const { messages, send } = useMessages(projectIdStr);

  const [localProgress, setLocalProgress] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (project && localProgress == null) setLocalProgress(project.progress);
  }, [project, localProgress]);

  const canEditProgress =
    !!user && !!project && (user.role === 'admin' || user.id === project.assignee?.id);

  async function saveProgress() {
    if (!numericId || localProgress == null || localProgress === project?.progress) return;
    try {
      setSaving(true);
      await updateProgress(numericId, localProgress);
      await mutate();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/70">Loading…</div>
      </div>
    );
  }

  // accents aligned with dashboard
  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } = {
    '--acc1': '59 130 246',   // blue-500
    '--acc2': '168 85 247',   // purple-500
    '--acc3': '45 212 191',   // teal-400
  };

  return (
    <VerifiedGate>
      <div className="relative min-h-[100dvh] overflow-x-hidden text-white" style={accents}>
        <PremiumBackground />

        <div className="relative z-10 max-w-[1180px] mx-auto p-5 sm:p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className={[
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                'border border-white/15 bg-white/5',
                'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
                'transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0',
              ].join(' ')}
            >
              ← Back
            </button>

            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
            >
              Project
            </h1>

            <div />
          </div>

          {/* Content */}
          {!numericId ? (
            <Panel lift={false} className="mt-6">Invalid project URL</Panel>
          ) : isLoading ? (
            <Panel lift={false} className="mt-6">Loading…</Panel>
          ) : error ? (
            <Panel lift={false} className="mt-6">
              <div className="text-lg font-semibold text-white/90">
                {(error as HttpLikeError)?.status === 401
                  ? 'Authentication required.'
                  : (error as HttpLikeError)?.status === 403
                  ? 'No access to this project.'
                  : 'Project not found.'}
              </div>
              <a href="/dashboard" className="underline text-sm text-white/85">Back to dashboard</a>
            </Panel>
          ) : !project ? (
            <Panel lift={false} className="mt-6">
              Project not found. <a href="/dashboard" className="underline text-white/85">Go back</a>
            </Panel>
          ) : (
            <>
              {/* Header panel */}
              <Panel lift={false} className="mt-8 space-y-6">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="text-2xl font-semibold text-white/95">{project.title}</div>
                  <div className="ms-auto">
                    <StatusPill value={project.status} />
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-white/80">{project.description}</p>
                )}

                {/* progress block */}
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className={[
                      'relative overflow-hidden rounded-xl border border-white/12 bg-white/[.04] p-4 backdrop-blur',
                      'transition-all duration-300',
                      'hover:border-white/20 hover:bg-white/[.06]',
                      'hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,.85),0_0_0_1px_rgba(255,255,255,.06)]',
                    ].join(' ')}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-60"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(var(--acc3) / .12), transparent 40%), linear-gradient(315deg, rgb(var(--acc1) / .12), transparent 40%)',
                        filter: 'blur(16px)',
                      }}
                    />
                    <div className="relative">
                      <ProgressBar value={localProgress ?? project.progress} label="Progress" />
                    </div>
                  </div>

                  {canEditProgress && (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={localProgress ?? project.progress}
                        onChange={(e) => setLocalProgress(Number(e.target.value))}
                        className="w-64"
                        aria-label="Progress slider"
                      />

                      {/* same look as dashboard primary buttons */}
                      <button
                        onClick={saveProgress}
                        disabled={saving || localProgress == null || localProgress === project.progress}
                        className={[
                          'px-4 py-2 rounded-xl text-sm font-semibold text-black',
                          'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
                          'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
                          'transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0',
                          (saving || localProgress == null || localProgress === project.progress) &&
                            'opacity-60 cursor-not-allowed hover:translate-y-0',
                        ].join(' ')}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>

                      <span className="text-sm text-white/80">
                        {(localProgress ?? project.progress) || 0}%
                      </span>
                      {justSaved && <span className="text-xs text-emerald-300/90">Saved ✓</span>}
                    </div>
                  )}
                </div>

                {/* meta tiles */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetaTile label="Client" value={SafeClientName(project)} />
                  <MetaTile label="Assignee" value={project.assignee?.name ?? '—'} />
                  <MetaTile
                    label="Created"
                    value={
                      SafeCreatedAt(project)
                        ? new Date(SafeCreatedAt(project) as string).toLocaleString()
                        : '—'
                    }
                  />
                </div>
              </Panel>

              {/* Chat */}
              <div className="mt-8">
                <ProjectChat messages={messages} onSend={send} meId={user?.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </VerifiedGate>
  );
}

/* ============ atoms ============ */

function Panel({
  children,
  className = '',
  lift = true,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: boolean;
}) {
  const base =
    'relative rounded-3xl border border-white/12 p-6 sm:p-7 ' +
    'bg-white/[.035] backdrop-blur-xl ' +
    'shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] ' +
    'transition-all duration-500 overflow-hidden';
  const liftCls = lift
    ? ' hover:-translate-y-[3px] hover:border-white/20 hover:bg-white/[.05] hover:shadow-[0_22px_70px_-30px_rgba(0,0,0,.8)]'
    : '';

  return (
    <div className={[base, liftCls, className].join(' ')}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(70% 60% at 10% -10%, rgb(var(--acc1) / .10), transparent 60%), radial-gradient(70% 60% at 110% 110%, rgb(var(--acc2) / .10), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[.10]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .25 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '300px 300px',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
