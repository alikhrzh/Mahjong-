"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeBounds, computePixelLayout } from "@/lib/mahjong/board-metrics";
import { getHintPair } from "@/lib/mahjong/match";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { EMPTY_LIFETIME_STATS, getLifetimeStats } from "@/lib/persistence/game-records";
import { DIFFICULTY_OPTIONS, difficultyLabel } from "@/lib/product/difficulty";
import { useBoardStore } from "@/store/board-store";
import { HistoryPanel } from "./HistoryPanel";
import { Tile } from "./Tile";
import { WinOverlay } from "./WinOverlay";

function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function Board() {
  const tiles = useBoardStore((s) => s.tiles);
  const selectedId = useBoardStore((s) => s.selectedId);
  const hintedIds = useBoardStore((s) => s.hintedIds);
  const isWon = useBoardStore((s) => s.isWon);
  const startedAt = useBoardStore((s) => s.startedAt);
  const finishedAt = useBoardStore((s) => s.finishedAt);
  const history = useBoardStore((s) => s.history);
  const difficulty = useBoardStore((s) => s.difficulty);
  const statsRevision = useBoardStore((s) => s.statsRevision);
  const selectTile = useBoardStore((s) => s.selectTile);
  const reset = useBoardStore((s) => s.reset);
  const newGame = useBoardStore((s) => s.newGame);
  const restartSameSeed = useBoardStore((s) => s.restartSameSeed);
  const setDifficulty = useBoardStore((s) => s.setDifficulty);
  const undo = useBoardStore((s) => s.undo);
  const hint = useBoardStore((s) => s.hint);
  const seed = useBoardStore((s) => s.seed);

  const [now, setNow] = useState(0);
  const [winOpen, setWinOpen] = useState(false);
  const wasWonRef = useRef(false);
  const clientMounted = useClientMounted();

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  useEffect(() => {
    if (isWon && !wasWonRef.current) setWinOpen(true);
    if (!isWon) setWinOpen(false);
    wasWonRef.current = isWon;
  }, [isWon]);

  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0;
    const clock = now > 0 ? now : startedAt;
    const end = finishedAt ?? clock;
    return Math.max(0, end - startedAt);
  }, [startedAt, finishedAt, now]);

  const winDurationMs = useMemo(() => {
    if (!isWon || !startedAt || !finishedAt) return 0;
    return Math.max(0, finishedAt - startedAt);
  }, [isWon, startedAt, finishedAt]);

  const hintAvailable = useMemo(() => getHintPair(tiles) !== null, [tiles]);

  const stats = clientMounted ? getLifetimeStats() : EMPTY_LIFETIME_STATS;

  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bounds = useMemo(() => computeBounds(tiles), [tiles]);

  const basePx = useMemo(() => {
    const tileW = size.w < 420 ? 44 : size.w < 640 ? 50 : 56;
    const tileH = Math.round(tileW * 1.36);
    return computePixelLayout(bounds, { tileW, tileH, overlap: 0.94 });
  }, [bounds, size.w]);

  const scale = useMemo(() => {
    if (!size.w || !size.h) return 1;
    const padX = 20;
    const padY = 28;
    return Math.min(1, (size.w - padX) / basePx.boardW, (size.h - padY) / basePx.boardH);
  }, [basePx.boardH, basePx.boardW, size.h, size.w]);

  const canUndo = !isWon && history.length > 0;
  const canHint = !isWon && hintAvailable;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pb-12 pt-4 sm:px-6 sm:pb-10">
      <header className="flex flex-col gap-3 rounded-3xl border border-white/40 bg-white/55 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/55 sm:gap-4 sm:py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mahjong Solitaire
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Seed <span className="font-mono text-zinc-700 dark:text-zinc-200">{seed}</span>
              {isWon ? (
                <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">You win</span>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
              {startedAt ? <span>Time {formatElapsed(elapsedMs)}</span> : <span>Time —</span>}
              <span>Moves {history.length}</span>
              <span>
                Record {stats.wins}/{stats.totalGames} wins
                {stats.bestTimeMs != null ? ` · best ${formatElapsed(stats.bestTimeMs)}` : ""}
                {stats.avgTimeMs != null ? ` · avg ${formatElapsed(stats.avgTimeMs)}` : ""}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={isWon}
                  onClick={() => setDifficulty(d)}
                  className={[
                    "rounded-2xl px-3 py-2 text-xs font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
                    d === difficulty
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200/80 bg-white/80 text-zinc-800 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {difficultyLabel(d)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/50 pt-3 dark:border-zinc-700/50">
          <button
            type="button"
            onClick={() => undo()}
            disabled={!canUndo}
            title={!canUndo ? (isWon ? "Game over" : "Nothing to undo") : "Undo last match"}
            className="rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => hint()}
            disabled={!canHint}
            title={!canHint ? (isWon ? "Game over" : "No free pair") : "Highlight a matching pair"}
            className="rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Hint
          </button>
          <button
            type="button"
            onClick={() => newGame()}
            className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            New game
          </button>
          <button
            type="button"
            onClick={() => restartSameSeed()}
            title="Replay this seed from the start"
            className="rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Same seed
          </button>
          <button
            type="button"
            onClick={() => reset(`shuffle-${Date.now()}`)}
            title="New random seed"
            className="rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Random deal
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div
          ref={hostRef}
          className="relative min-h-[calc(100dvh-280px)] w-full overflow-hidden rounded-[2rem] border border-white/45 bg-gradient-to-b from-white/70 to-zinc-100/70 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:from-zinc-950/70 dark:to-zinc-900/60 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:min-h-[calc(100dvh-240px)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(99,102,241,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(circle_at_90%_20%,rgba(99,102,241,0.18),transparent_45%)]" />

          <div className="relative flex h-full min-h-[inherit] w-full items-center justify-center p-3 sm:p-4">
            <div
              className="relative"
              style={{
                width: basePx.boardW * scale,
                height: basePx.boardH * scale,
              }}
            >
              <div
                className="absolute left-0 top-0 will-change-transform"
                style={{
                  width: basePx.boardW,
                  height: basePx.boardH,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {tiles.map((t) => (
                  <Tile
                    key={t.id}
                    tile={t}
                    tiles={tiles}
                    selectedId={selectedId}
                    hintedIds={hintedIds}
                    px={basePx}
                    onSelect={selectTile}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-4">
          <HistoryPanel key={statsRevision} />
        </aside>
      </div>

      <WinOverlay
        open={winOpen && isWon}
        timeMs={winDurationMs}
        moves={history.length}
        difficulty={difficulty}
        statsRevision={statsRevision}
        onDismiss={() => setWinOpen(false)}
        onNewGame={() => newGame()}
        onRestart={() => restartSameSeed()}
      />
    </div>
  );
}
