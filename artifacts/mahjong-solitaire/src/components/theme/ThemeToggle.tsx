"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const THEME_CHANGE_EVENT = "mahjong:theme-change";

let themeNotifyVersion = 0;

function notifyThemeChanged() {
  themeNotifyVersion += 1;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}

function readStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const ls = window.localStorage;
  if (!ls || typeof ls.getItem !== "function") return null;
  try {
    const v = ls.getItem("theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(mode: "light" | "dark") {
  if (typeof window === "undefined") return;
  const ls = window.localStorage;
  if (!ls || typeof ls.setItem !== "function") return;
  try {
    ls.setItem("theme", mode);
  } catch {
    /* quota / private mode */
  }
}

function readIsDark(): boolean {
  const stored = readStoredTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored === "dark" || (stored !== "light" && prefersDark);
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => onStoreChange();
  const onStorage = () => onStoreChange();
  const onCustom = () => onStoreChange();
  mq.addEventListener("change", onMq);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onCustom);
  return () => {
    mq.removeEventListener("change", onMq);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onCustom);
  };
}

function getSnapshot(): boolean {
  void themeNotifyVersion;
  return readIsDark();
}

/** Stable default for SSR + hydration first paint (matches server HTML). */
function getServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    const next = !isDark;
    writeStoredTheme(next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    notifyThemeChanged();
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-xl transition hover:bg-white/80 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900/80"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative inline-flex h-5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            isDark ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
