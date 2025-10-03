'use client';

import * as React from 'react';

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 'current-password' for login, 'new-password' for register/reset */
  autoComplete?: 'current-password' | 'new-password';
  name?: string;
};

export default function PasswordField({
  id,
  name = 'password',
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  disabled,
  required,
  className = '',
  ...rest
}: Props) {
  const [show, setShow] = React.useState(false);

  return (
    <div className={['space-y-1', className].join(' ')}>
      {label && (
        <label htmlFor={id ?? name} className="text-sm text-white/80">
          {label}
        </label>
      )}

      {/* приманка для менеджеров паролей (нефокусируемая) */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
        autoComplete="new-password"
        name={`fake-${name}`}
        type="password"
      />

      <div className="relative">
        <input
          id={id ?? name}
          name={name}
          value={value}
          onChange={onChange}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          // подсказка некоторым расширениям менеджеров
          data-bwignore="true"
          className="w-full rounded-xl border border-white/15 bg-white/[.06] px-3 py-2 text-white
                     placeholder:text-white/40 outline-none focus:border-white/25 focus:bg-white/[.09]
                     transition-colors"
          {...rest}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-1.5 top-1.5 px-2 py-1 text-xs rounded-lg
                     border border-white/15 bg-white/[.08] text-white/90
                     hover:-translate-y-[1px] transition"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
