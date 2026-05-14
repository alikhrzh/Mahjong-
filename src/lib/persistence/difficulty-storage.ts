import type { Difficulty } from "@/lib/product/difficulty";

const KEY = "mahjong-solitaire:v1:difficulty";

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  const ls = window.localStorage;
  return Boolean(ls && typeof ls.setItem === "function");
}

export function saveDifficultyPreference(d: Difficulty): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, d);
  } catch {
    /* ignore */
  }
}

export function loadDifficultyPreference(): Difficulty | null {
  if (!canUseStorage()) return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "easy" || v === "medium" || v === "hard" ? v : null;
  } catch {
    return null;
  }
}
