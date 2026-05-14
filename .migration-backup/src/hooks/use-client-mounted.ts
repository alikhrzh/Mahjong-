import { useEffect, useState } from "react";

/**
 * false on server and on the client's first render; true after mount.
 * Use to gate localStorage / matchMedia / Date-dependent UI so SSR HTML matches hydration.
 */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
