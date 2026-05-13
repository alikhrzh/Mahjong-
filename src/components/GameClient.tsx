"use client";

import { Board } from "@/components/mahjong/Board";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function GameClient() {
  return (
    <main className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_55%)]" />
      <div className="relative mx-auto flex max-w-5xl justify-end px-3 pt-4 sm:px-6">
        <ThemeToggle />
      </div>
      <Board />
    </main>
  );
}
