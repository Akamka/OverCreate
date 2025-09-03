import type { CSSProperties } from 'react';

export type RGB = [number, number, number];

type CSSVarKeys =
  | '--acc1' | '--acc2'
  | '--mx' | '--my' | '--dx' | '--dy' | '--rx' | '--ry'
  | '--holo-speed' | '--holo-alpha' | '--ang';

export type CSSVars = CSSProperties & Partial<Record<CSSVarKeys, string>>;
