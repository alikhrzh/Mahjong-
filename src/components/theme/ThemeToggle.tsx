"use client";

import { useEffect, useState } from "react";

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

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (stored !== "light" && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      if (prev === null) return prev;
      const next = !prev;
      writeStoredTheme(next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  if (dark === null) {
    return (
      <span className="inline-flex h-10 w-[5.5rem] rounded-full border border-white/50 bg-white/40 dark:border-white/10 dark:bg-zinc-900/40" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-xl transition hover:bg-white/80 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900/80"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative inline-flex h-5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            dark ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
      {dark ? "Dark" : "Light"}
    </button>
  );
}
