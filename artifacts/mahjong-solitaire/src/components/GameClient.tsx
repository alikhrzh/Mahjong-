"use client";

import { useEffect } from "react";
import { Board } from "@/components/mahjong/Board";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuthBar } from "@/components/auth/AuthBar";
import { useBoardStore } from "@/store/board-store";

export function GameClient() {
  const hydrateStoredDifficulty = useBoardStore((s) => s.hydrateStoredDifficulty);

  useEffect(() => {
    hydrateStoredDifficulty();
  }, [hydrateStoredDifficulty]);

  return (
    <main className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_55%)]" />
      <div className="relative mx-auto flex max-w-5xl items-center justify-end gap-2 px-3 pt-4 sm:px-6">
        <AuthBar />
        <ThemeToggle />
      </div>
      <Board />
    </main>
  );
}
