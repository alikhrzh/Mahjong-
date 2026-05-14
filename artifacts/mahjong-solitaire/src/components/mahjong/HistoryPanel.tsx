"use client";

import { useEffect, useState } from "react";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { getRecentGames } from "@/lib/persistence/game-records";
import { difficultyLabel } from "@/lib/product/difficulty";
import { useAuthStore } from "@/store/auth-store";
import { fetchRecentCompletedGames, type CloudGameRecord } from "@/lib/supabase/history";

function formatShort(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatMs(ms: number): string {
  return formatShort(Math.max(0, Math.floor(ms / 1000)));
}

export function HistoryPanel() {
  const clientMounted = useClientMounted();
  const localRows = clientMounted ? getRecentGames(10) : [];

  const user = useAuthStore((s) => s.user);
  const [cloudRows, setCloudRows] = useState<CloudGameRecord[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCloudRows([]);
      return;
    }
    setCloudLoading(true);
    fetchRecentCompletedGames(10)
      .then(setCloudRows)
      .finally(() => setCloudLoading(false));
  }, [user]);

  const showCloud = Boolean(user);

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3 text-xs shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 sm:px-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Recent games
      </h2>
      {localRows.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">No finished games yet.</p>
      ) : (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {localRows.map((r, i) => (
            <li
              key={`${r.at}-${i}`}
              className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-zinc-200/60 pb-1 last:border-0 dark:border-zinc-700/60"
            >
              <span className="text-zinc-600 dark:text-zinc-300">
                {new Date(r.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {r.won ? "Win" : "End"} · {difficultyLabel(r.difficulty)} · {formatMs(r.durationMs)} · {r.moves} mv
              </span>
            </li>
          ))}
        </ul>
      )}

      {showCloud && (
        <div className="mt-3 border-t border-zinc-200/60 pt-3 dark:border-zinc-700/60">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Cloud history
          </h3>
          {cloudLoading ? (
            <p className="text-zinc-400 dark:text-zinc-500">Loading…</p>
          ) : cloudRows.length === 0 ? (
            <p className="text-zinc-400 dark:text-zinc-500">No cloud records yet.</p>
          ) : (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {cloudRows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-zinc-200/60 pb-1 last:border-0 dark:border-zinc-700/60"
                >
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {r.won ? "Win" : "End"} · {difficultyLabel(r.difficulty)} · {formatShort(r.duration_seconds)} · {r.moves} mv
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
