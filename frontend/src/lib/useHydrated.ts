import { useEffect, useState } from 'react';

/** true только после первого client-render */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
