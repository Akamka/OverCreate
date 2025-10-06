/* eslint-disable @next/next/no-img-element */
'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string;
      alt?: string;
      href?: string;
      title?: string;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  /** px/сек (по умолчанию 120) */
  speed?: number;
  direction?: 'left' | 'right';
  /** ширина контейнера */
  width?: number | string;
  /** высота логотипов в px */
  logoHeight?: number;
  /** расстояние между логотипами в px (используется, если gapRange не задан) */
  gap?: number;
  /** случайный интервал отступа справа для каждого элемента */
  gapRange?: { min: number; max: number };
  /** перемешивать порядок логотипов */
  shuffle?: boolean;
  /** останавливать при наведении */
  pauseOnHover?: boolean;
  /** полупрозрачные «затемнённые» края */
  fadeOut?: boolean;
  /** цвет для fadeOut (по умолчанию авто: светлая/тёмная тема) */
  fadeOutColor?: string;
  /** лёгкое увеличение логотипов при hover на дорожке */
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/* ---------- helpers ---------- */

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const toCssLength = (v?: number | string) =>
  typeof v === 'number' ? `${v}px` : v;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const randBetween = (min: number, max: number) =>
  min + Math.random() * Math.max(0, max - min);

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  deps: React.DependencyList
) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.ResizeObserver === 'undefined') {
      const onResize = () => callback();
      window.addEventListener('resize', onResize);
      callback();
      return () => window.removeEventListener('resize', onResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const ro = new window.ResizeObserver(callback);
      ro.observe(ref.current);
      return ro;
    });

    callback();
    return () => observers.forEach((ro) => ro?.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  deps: React.DependencyList
) => {
  useEffect(() => {
    const imgs =
      (seqRef.current?.querySelectorAll('img') as NodeListOf<HTMLImageElement>) ??
      ([] as unknown as NodeListOf<HTMLImageElement>);

    if (!imgs || imgs.length === 0) {
      onLoad();
      return;
    }

    let remain = imgs.length;
    const done = () => {
      remain -= 1;
      if (remain === 0) onLoad();
    };

    imgs.forEach((el) => {
      if (el.complete) {
        done();
      } else {
        el.addEventListener('load', done, { once: true });
        el.addEventListener('error', done, { once: true });
      }
    });

    return () => {
      imgs.forEach((el) => {
        el.removeEventListener('load', done);
        el.removeEventListener('error', done);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const offset = useRef(0);
  const vel = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (seqWidth > 0) {
      offset.current = ((offset.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offset.current}px,0,0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0,0,0)';
      return () => {
        lastTs.current = null;
      };
    }

    const loop = (t: number) => {
      if (lastTs.current == null) lastTs.current = t;
      const dt = Math.max(0, t - lastTs.current) / 1000;
      lastTs.current = t;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;
      const ease = 1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
      vel.current += (target - vel.current) * ease;

      if (seqWidth > 0) {
        let next = offset.current + vel.current * dt;
        next = ((next % seqWidth) + seqWidth) % seqWidth;
        offset.current = next;
        track.style.transform = `translate3d(${-next}px,0,0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTs.current = null;
    };
  }, [targetVelocity, isHovered, pauseOnHover, seqWidth, trackRef]);
};

/* ---------- component ---------- */

const LogoLoop = React.memo<LogoLoopProps>(
  ({
    logos,
    speed = 120,
    direction = 'left',
    width = '100vw',
    logoHeight = 28,
    gap = 32,
    gapRange,            // <-- новый проп
    shuffle = false,     // <-- новый проп
    pauseOnHover = true,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = true,
    ariaLabel = 'Partner logos',
    className = 'w-screen mx-[calc(50%-50vw)]',
    style,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const seqRef = useRef<HTMLUListElement>(null);

    const [seqWidth, setSeqWidth] = useState<number>(0);
    const [copies, setCopies] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [hovered, setHovered] = useState(false);

    const targetVelocity = useMemo(() => {
      const sign = direction === 'left' ? 1 : -1;
      const s = Math.abs(speed);
      return s * sign;
    }, [speed, direction]);

    // базовая последовательность: перемешиваем по желанию
    const baseSeq = useMemo(() => {
      if (!shuffle) return logos;
      const arr = [...logos];
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }, [logos, shuffle]);

    const remeasure = useCallback(() => {
      const wrapW = containerRef.current?.clientWidth ?? 0;
      const unitW = Math.ceil(seqRef.current?.getBoundingClientRect?.().width ?? 0);
      if (unitW > 0) {
        setSeqWidth(unitW);
        const need = Math.ceil(wrapW / unitW) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopies(Math.max(ANIMATION_CONFIG.MIN_COPIES, need));
      }
    }, []);

    useResizeObserver(remeasure, [containerRef, seqRef], [baseSeq, gap, logoHeight, gapRange]);
    useImageLoader(seqRef, remeasure, [baseSeq, gap, logoHeight, gapRange]);
    useAnimationLoop(trackRef, targetVelocity, seqWidth, hovered, pauseOnHover);

    const cssVars = useMemo(
      () =>
        ({
          '--logoloop-gap': `${gap}px`,
          '--logoloop-logoHeight': `${logoHeight}px`,
          ...(fadeOutColor ? { '--logoloop-fadeColor': fadeOutColor } : {}),
        }) as CSSProperties,
      [gap, logoHeight, fadeOutColor]
    );

    const rootCls = useMemo(
      () =>
        cx(
          'relative overflow-x-hidden group',
          '[--logoloop-fadeColorAuto:#ffffff]',
          'dark:[--logoloop-fadeColorAuto:#0b0b0b]',
          scaleOnHover && 'py-[calc(var(--logoloop-logoHeight)*0.1)]',
          className
        ),
      [scaleOnHover, className]
    );

    const onEnter = useCallback(() => pauseOnHover && setHovered(true), [pauseOnHover]);
    const onLeave = useCallback(() => pauseOnHover && setHovered(false), [pauseOnHover]);

    const renderItem = useCallback(
      (item: LogoItem, key: React.Key, mr: number) => {
        const isNode = 'node' in item;

        const content = isNode ? (
          <span
            className={cx(
              'inline-flex items-center',
              scaleOnHover &&
                'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110'
            )}
          >
            {item.node}
          </span>
        ) : (
          <img
            className={cx(
              'h-[var(--logoloop-logoHeight)] w-auto block object-contain',
              '[-webkit-user-drag:none] pointer-events-none',
              scaleOnHover &&
                'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-110'
            )}
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            width={item.width}
            height={item.height}
            alt={item.alt ?? ''}
            title={item.title}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        );

        const a11y = isNode ? item.ariaLabel ?? item.title : item.alt ?? item.title;

        const inner = item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={a11y || 'logo link'}
            className="inline-flex items-center no-underline rounded hover:opacity-80 transition-opacity"
            onClick={(e) => e.preventDefault()} // на всякий случай — блокируем переход
          >
            {content}
          </a>
        ) : (
          content
        );

        return (
          <li
            key={key}
            className={cx(
              'flex-none text-[length:var(--logoloop-logoHeight)] leading-[1]',
              scaleOnHover && 'overflow-visible group/item'
            )}
            style={{ marginRight: `${mr}px` }}
          >
            {inner}
          </li>
        );
      },
      [scaleOnHover]
    );

    const lists = useMemo(() => {
      const minGap = gapRange ? Math.max(0, gapRange.min) : gap;
      const maxGap = gapRange ? Math.max(minGap, gapRange.max) : gap;

      // чтобы визуально «разгруппировать», генерим случайные отступы
      const makeMr = () =>
        gapRange ? Math.round(randBetween(minGap, maxGap)) : gap;

      return Array.from({ length: copies }, (_, i) => (
        <ul
          key={`copy-${i}`}
          className="flex items-center"
          ref={i === 0 ? seqRef : undefined}
          aria-hidden={i > 0}
        >
          {baseSeq.map((it, idx) => renderItem(it, `${i}-${idx}`, makeMr()))}
        </ul>
      ));
    }, [copies, baseSeq, renderItem, gap, gapRange]);

    const containerStyle: CSSProperties = useMemo(
      () => ({
        width: toCssLength(width) ?? '100%',
        ...cssVars,
        ...style,
      }),
      [width, cssVars, style]
    );

    return (
      <div
        ref={containerRef}
        className={rootCls}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {fadeOut && (
          <>
            <div
              aria-hidden
              className={cx(
                'pointer-events-none absolute inset-y-0 left-0 z-[1]',
                'w-[clamp(24px,8%,120px)]',
                'bg-[linear-gradient(to_right,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]'
              )}
            />
            <div
              aria-hidden
              className={cx(
                'pointer-events-none absolute inset-y-0 right-0 z-[1]',
                'w-[clamp(24px,8%,120px)]',
                'bg-[linear-gradient(to_left,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]'
              )}
            />
          </>
        )}

        <div ref={trackRef} className="flex w-max will-change-transform select-none">
          {lists}
        </div>
      </div>
    );
  }
);

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
