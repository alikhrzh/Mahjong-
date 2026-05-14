import type { Difficulty } from "@/lib/product/difficulty";

const STORAGE_KEY = "mahjong-solitaire:v1:games";
const MAX_RECORDS = 200;

export type GameRecord = {
  at: number;
  durationMs: number;
  moves: number;
  won: boolean;
  difficulty: Difficulty;
};

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  const ls = window.localStorage;
  return Boolean(ls && typeof ls.getItem === "function");
}

export function loadGameRecords(): GameRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is GameRecord =>
        r &&
        typeof r === "object" &&
        typeof (r as GameRecord).at === "number" &&
        typeof (r as GameRecord).durationMs === "number" &&
        typeof (r as GameRecord).moves === "number" &&
        typeof (r as GameRecord).won === "boolean" &&
        ["easy", "medium", "hard"].includes((r as GameRecord).difficulty),
    );
  } catch {
    return [];
  }
}

export function appendGameRecord(record: GameRecord): void {
  if (!canUseStorage()) return;
  try {
    const next = [...loadGameRecords(), record].slice(-MAX_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function getRecentGames(limit: number): GameRecord[] {
  const all = loadGameRecords();
  return all.slice(-limit).reverse();
}

export type LifetimeStats = {
  totalGames: number;
  wins: number;
  bestTimeMs: number | null;
  avgTimeMs: number | null;
};

/** Same values as `getLifetimeStats()` when storage is unavailable (SSR / pre-mount). */
export const EMPTY_LIFETIME_STATS: LifetimeStats = {
  totalGames: 0,
  wins: 0,
  bestTimeMs: null,
  avgTimeMs: null,
};

export function getLifetimeStats(): LifetimeStats {
  const all = loadGameRecords();
  const wins = all.filter((r) => r.won);
  const best = wins.length ? Math.min(...wins.map((w) => w.durationMs)) : null;
  const avg = wins.length ? wins.reduce((a, w) => a + w.durationMs, 0) / wins.length : null;
  return {
    totalGames: all.length,
    wins: wins.length,
    bestTimeMs: best,
    avgTimeMs: avg,
  };
}
