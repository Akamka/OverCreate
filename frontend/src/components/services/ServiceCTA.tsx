'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CSSVars, RGB } from '@/types/ui';
import type { ServiceSlug } from '@/lib/services.config';

/* ====== API base (unified with the rest of the app) ====== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
/* ========================================================= */

type FieldChange = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: FieldChange) => void;
  onBlur?: () => void;
  autoComplete?: string;
  type?: 'text' | 'email' | 'tel';
  rows?: number;
  pattern?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  invalid?: boolean;
  valid?: boolean;
  error?: string | null;
};

/* ----------------------------- UI controls ----------------------------- */

function InputField(props: FieldProps) {
  const {
    id, label, value, onChange, onBlur,
    autoComplete, type = 'text', pattern, inputMode,
    invalid, valid, error,
  } = props;

  const describedBy = error ? `${id}-err` : undefined;

  return (
    <label className="i2-field">
      <input
        id={id}
        className={`i2-input ${invalid ? 'is-invalid' : ''} ${valid ? 'is-valid' : ''}`}
        placeholder=" "
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        type={type}
        pattern={pattern}
        inputMode={inputMode}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
      />
      <span className="i2-label">{label}</span>
      {error && (
        <div id={describedBy} className="i2-msg">
          {error}
        </div>
      )}
    </label>
  );
}

function TextAreaField(props: FieldProps) {
  const {
    id, label, value, onChange, onBlur,
    autoComplete, rows = 5,
    invalid, valid, error,
  } = props;

  const describedBy = error ? `${id}-err` : undefined;

  return (
    <label className="i2-field">
      <textarea
        id={id}
        className={`i2-input ${invalid ? 'is-invalid' : ''} ${valid ? 'is-valid' : ''}`}
        placeholder=" "
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
        minLength={10}
      />
      <span className="i2-label">{label}</span>
      {error && (
        <div id={describedBy} className="i2-msg">
          {error}
        </div>
      )}
    </label>
  );
}

/* ----------------------------- Validation ----------------------------- */

const RE_NAME = /^[A-Za-zА-Яа-яЁё'\-\s]{2,}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_TEL_VISIBLE = /^[+]?[-()\s\d]{7,}$/;
const digitsCount = (s: string) => (s.match(/\d/g) || []).length;

/* --------------------------------- Component -------------------------------- */

export default function ServiceCTA({
  service,
  accentFrom,
  accentTo,
}: {
  service?: ServiceSlug;
  accentFrom: RGB;
  accentTo: RGB;
}) {
  /* theme vars */
  const vars: CSSVars = {
    '--acc1': accentFrom.join(' '),
    '--acc2': accentTo.join(' '),
  };

  /* values */
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [about, setAbout] = useState('');

  /* toast */
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const showToast = (t: 'ok' | 'err', text: string) => {
    setToast({ type: t, text });
    window.setTimeout(() => setToast(null), 3000);
  };

  /* touched state — highlight only after interaction */
  const [touched, setTouched] = useState({
    first: false,
    last: false,
    email: false,
    tel: false,
    about: false,
  });
  const makeDirty = (k: keyof typeof touched) => () =>
    setTouched((s) => ({ ...s, [k]: true }));

  /* validity */
  const validity = useMemo(() => {
    const nameOk1 = RE_NAME.test(first.trim());
    const nameOk2 = RE_NAME.test(last.trim());
    const mailOk = RE_EMAIL.test(email.trim());
    const telOk =
      RE_TEL_VISIBLE.test(tel.trim()) &&
      digitsCount(tel) >= 7 &&
      digitsCount(tel) <= 15;
    const aboutOk = about.trim().length >= 10;
    return { nameOk1, nameOk2, mailOk, telOk, aboutOk };
  }, [first, last, email, tel, about]);

  /* error messages – only if touched and non-empty */
  const errors = {
    first:
      touched.first && first.trim() !== '' && !validity.nameOk1
        ? 'Letters, space, hyphen or apostrophe. Min 2 characters.'
        : null,
    last:
      touched.last && last.trim() !== '' && !validity.nameOk2
        ? 'Letters, space, hyphen or apostrophe. Min 2 characters.'
        : null,
    email:
      touched.email && email.trim() !== '' && !validity.mailOk
        ? 'Enter a valid email, e.g. name@example.com'
        : null,
    tel:
      touched.tel && tel.trim() !== '' && !validity.telOk
        ? '7–15 digits, +, spaces, brackets and dashes allowed'
        : null,
    about:
      touched.about && about.trim() !== '' && !validity.aboutOk
        ? 'Describe the task in at least 10 characters'
        : null,
  };

  /* progress 0..1 */
  const progress = useMemo(() => {
    const list = Object.values(validity);
    return list.reduce((a, b) => a + (b ? 1 : 0), 0) / list.length;
  }, [validity]);

  /* scroll rail (vertical) */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const TAIL_PX = 40;
    el.style.setProperty('--rail-tail', `${TAIL_PX}px`);

    const updateScrollProgress = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = Math.min(r.height, Math.max(0, vh - r.top));
      const p = Math.max(0, Math.min(1, visible / r.height));
      el.style.setProperty('--p', p.toFixed(4));
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  /* top progress bar value */
  useEffect(() => {
    const el = rootRef.current;
    if (el) el.style.setProperty('--fill', progress.toFixed(4));
  }, [progress]);

  /* submit */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (progress < 1) {
      setTouched({ first: true, last: true, email: true, tel: true, about: true });
      return;
    }

    try {
      const utm = Object.fromEntries(new URLSearchParams(window.location.search).entries());

      const res = await fetch(`${API_BASE}/api/contact-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          email,
          phone: tel,
          message: about,
          page: service ? `/services/${service}` : window.location.pathname,
          subject: service ? `${service} CTA` : 'Service CTA',
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          honeypot: '',
        }),
      });

      if (!res.ok) {
        let msg = `Submit error (${res.status})`;
        try {
          const data = (await res.json()) as unknown;
          if (typeof data === 'object' && data && 'message' in (data as Record<string, unknown>)) {
            const m = (data as { message?: string }).message;
            if (m) msg = m;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      showToast('ok', 'Sent successfully');
      console.log('CTA sent OK', await res.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      showToast('err', 'Failed to send');
      console.error('CTA send error:', msg);
    } finally {
      setFirst(''); setLast(''); setEmail(''); setTel(''); setAbout('');
      setTouched({ first: false, last: false, email: false, tel: false, about: false });
    }
  };

  return (
    <section
      id="contact"
      className="oc-section scroll-mt-24 section-soft"
      style={vars as CSSProperties}
    >
      <div className="max-w-[1120px] mx-auto px-5 md:px-10">
        <h2 className="text-3xl md:text-4xl font-semibold">Send a request</h2>
        <p className="mt-2 text-white/65">
          Leave your contacts and briefly describe the task — we will reply within one business day.
        </p>

        <div
          ref={rootRef}
          className="cta3-card mt-6"
          aria-live="polite"
          style={{ '--fill': progress } as CSSProperties}
        >
          {/* top progress bar */}
          <div className="cta3-topbar" aria-hidden>
            <span className="cta3-topbar-fill" />
          </div>

          {/* vertical scroll progress rail */}
          <div className="cta3-rail" aria-hidden>
            <span className="cta3-rail-fill" />
          </div>

          <form className="cta3-grid" onSubmit={onSubmit} noValidate>
            <InputField
              id="first"
              label="First name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              onBlur={makeDirty('first')}
              autoComplete="given-name"
              pattern={RE_NAME.source}
              invalid={!!errors.first}
              valid={touched.first && validity.nameOk1}
              error={errors.first}
            />
            <InputField
              id="last"
              label="Last name"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              onBlur={makeDirty('last')}
              autoComplete="family-name"
              pattern={RE_NAME.source}
              invalid={!!errors.last}
              valid={touched.last && validity.nameOk2}
              error={errors.last}
            />
            <InputField
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={makeDirty('email')}
              type="email"
              autoComplete="email"
              pattern={RE_EMAIL.source}
              invalid={!!errors.email}
              valid={touched.email && validity.mailOk}
              error={errors.email}
            />
            <InputField
              id="tel"
              label="Phone"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              onBlur={makeDirty('tel')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern={RE_TEL_VISIBLE.source}
              invalid={!!errors.tel}
              valid={touched.tel && validity.telOk}
              error={errors.tel}
            />
            <TextAreaField
              id="about"
              label="Briefly about your project…"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              onBlur={makeDirty('about')}
              rows={6}
              invalid={!!errors.about}
              valid={touched.about && validity.aboutOk}
              error={errors.about}
            />

            <div className="cta3-actions">
              <button
                type="submit"
                className="cta3-button"
                aria-label={`Send. Completed ${Math.round(progress * 100)}%`}
              >
                Send
              </button>
              <span className="cta3-note">
                By clicking “Send”, you agree to the processing of your personal data.
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] rounded-xl px-4 py-3 shadow-lg
            ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      )}
    </section>
  );
}
