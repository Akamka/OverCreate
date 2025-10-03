'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion, cubicBezier, type Transition } from 'framer-motion';
import { useMemo } from 'react';

export default function RouteTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const ease = cubicBezier(0.22, 0.7, 0.26, 1);

  // ✅ Типобезопасный Transition (без any и без нестандартных ключей)
  const transition: Transition = useMemo(
    () => ({
      duration: 0.38,
      ease,
      // Персональный тайминг только для Y — пружинка
      y: reduce
        ? { duration: 0.38, ease }
        : { type: 'spring', stiffness: 480, damping: 42, mass: 0.7 },
    }),
    [ease, reduce]
  );

  const initial = reduce
    ? { opacity: 0 }
    : { opacity: 0, y: 24, scale: 0.996, filter: 'blur(10px)' };

  const animate = reduce
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' };

  return (
    <div className="route-root relative z-10 min-h-screen">
      <motion.div
        key={pathname}
        className="route-surface min-h-screen"
        initial={initial}
        animate={animate}
        transition={transition}  
      >
        {children}
      </motion.div>
    </div>
  );
}
