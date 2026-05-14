"use client";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { getRecentGames } from "@/lib/persistence/game-records";
import { difficultyLabel } from "@/lib/product/difficulty";

function formatShort(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function HistoryPanel() {
  const clientMounted = useClientMounted();
  const rows = clientMounted ? getRecentGames(10) : [];

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3 text-xs shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 sm:px-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Recent games
      </h2>
      {rows.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">No finished games yet.</p>
      ) : (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <li
              key={`${r.at}-${i}`}
              className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-zinc-200/60 pb-1 last:border-0 dark:border-zinc-700/60"
            >
              <span className="text-zinc-600 dark:text-zinc-300">
                {new Date(r.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {r.won ? "Win" : "End"} · {difficultyLabel(r.difficulty)} · {formatShort(r.durationMs)} · {r.moves} mv
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
