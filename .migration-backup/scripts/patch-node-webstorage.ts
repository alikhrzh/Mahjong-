/**
 * Node 25+ can expose a broken global `localStorage` (experimental web storage)
 * when `--localstorage-file` is misconfigured — `getItem` is not a function.
 * Next.js dev tooling touches `localStorage` and crashes. Replace with an in-memory Storage.
 */
function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(String(key)) ? map.get(String(key))! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(String(key));
    },
    setItem(key: string, value: string) {
      map.set(String(key), String(value));
    },
  } as Storage;
}

function patchIfBroken(name: "localStorage" | "sessionStorage") {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as typeof globalThis & {
    localStorage?: unknown;
    sessionStorage?: unknown;
  };
  const current = g[name] as Storage | undefined;
  if (!current) return;
  if (typeof current.getItem === "function") return;

  const mock = makeMemoryStorage();
  try {
    Object.defineProperty(g, name, {
      value: mock,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  } catch {
    try {
      (g as unknown as Record<string, Storage>)[name] = mock;
    } catch {
      /* ignore */
    }
  }
}

export function patchNodeWebStorage(): void {
  patchIfBroken("localStorage");
  patchIfBroken("sessionStorage");
}