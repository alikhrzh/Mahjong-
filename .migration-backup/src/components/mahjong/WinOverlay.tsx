"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { EMPTY_LIFETIME_STATS, getLifetimeStats } from "@/lib/persistence/game-records";
import type { Difficulty } from "@/lib/product/difficulty";
import { difficultyLabel } from "@/lib/product/difficulty";

function formatShort(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type Props = {
  open: boolean;
  timeMs: number;
  moves: number;
  difficulty: Difficulty;
  statsRevision: number;
  onNewGame: () => void;
  onRestart: () => void;
  onDismiss: () => void;
};

export function WinOverlay({
  open,
  timeMs,
  moves,
  difficulty,
  statsRevision,
  onNewGame,
  onRestart,
  onDismiss,
}: Props) {
  const clientMounted = useClientMounted();
  const stats = clientMounted ? getLifetimeStats() : EMPTY_LIFETIME_STATS;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="win"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 px-4 pb-8 pt-12 sm:items-center sm:pb-12"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative z-[81] w-full max-w-sm rounded-3xl border border-white/50 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/90"
          >
            <h2 id="win-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Nice work
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {difficultyLabel(difficulty)} · {formatShort(timeMs)} · {moves} moves
            </p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400" key={statsRevision}>
              All-time: {stats.wins}/{stats.totalGames} wins
              {stats.bestTimeMs != null ? ` · best ${formatShort(stats.bestTimeMs)}` : ""}
              {stats.avgTimeMs != null ? ` · avg ${formatShort(stats.avgTimeMs)}` : ""}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onDismiss();
                  onNewGame();
                }}
                className="flex-1 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                New game
              </button>
              <button
                type="button"
                onClick={() => {
                  onDismiss();
                  onRestart();
                }}
                className="flex-1 rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Same seed
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
