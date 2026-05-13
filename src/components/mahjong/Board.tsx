"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeBounds, computePixelLayout } from "@/lib/mahjong/board-metrics";
import { useBoardStore } from "@/store/board-store";
import { Tile } from "./Tile";

export function Board() {
  const tiles = useBoardStore((s) => s.tiles);
  const selectedId = useBoardStore((s) => s.selectedId);
  const selectTile = useBoardStore((s) => s.selectTile);
  const reset = useBoardStore((s) => s.reset);
  const seed = useBoardStore((s) => s.seed);

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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pb-10 pt-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/40 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/55">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mahjong board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Seeded shuffle: <span className="font-mono text-zinc-700 dark:text-zinc-200">{seed}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset(`shuffle-${Date.now()}`)}
          className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Reshuffle
        </button>
      </header>

      <div
        ref={hostRef}
        className="relative min-h-[calc(100dvh-220px)] w-full overflow-hidden rounded-[2rem] border border-white/45 bg-gradient-to-b from-white/70 to-zinc-100/70 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:from-zinc-950/70 dark:to-zinc-900/60 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(99,102,241,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(circle_at_90%_20%,rgba(99,102,241,0.18),transparent_45%)]" />

        <div className="relative flex h-full min-h-[inherit] w-full items-center justify-center p-4">
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
                  px={basePx}
                  onSelect={selectTile}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
