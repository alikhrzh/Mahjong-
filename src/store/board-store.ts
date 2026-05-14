import { create } from "zustand";
import { buildDeck144 } from "@/lib/mahjong/deck";
import { parseLayout, TURTLE_LAYOUT_RAW } from "@/lib/mahjong/layout-turtle";
import { getHintPair } from "@/lib/mahjong/match";
import { hashSeed, mulberry32, shuffleInPlace } from "@/lib/mahjong/random";
import { isRemovable } from "@/lib/mahjong/removable";
import { kindsCompatibleMatch } from "@/lib/mahjong/types";
import type { TileKind, TileModel } from "@/lib/mahjong/types";
import { appendGameRecord } from "@/lib/persistence/game-records";
import { loadDifficultyPreference, saveDifficultyPreference } from "@/lib/persistence/difficulty-storage";
import { DIFFICULTY_SHUFFLE_PASSES, type Difficulty } from "@/lib/product/difficulty";

type RemovalEntry = { a: string; b: string };

function shuffleDeckForDifficulty(deck: TileKind[], seed: string, difficulty: Difficulty) {
  const passes = DIFFICULTY_SHUFFLE_PASSES[difficulty];
  let state = (hashSeed(`${seed}|${difficulty}`) ^ hashSeed(`pass:${difficulty}`)) >>> 0;
  for (let p = 0; p < passes; p++) {
    const rand = mulberry32(state);
    shuffleInPlace(deck, rand);
    state = (state + 0x9e3779b9 + p * 0x243f6a88) >>> 0;
  }
}

function createTiles(seed: string, difficulty: Difficulty): TileModel[] {
  const slots = parseLayout(TURTLE_LAYOUT_RAW);
  const deck = buildDeck144();
  shuffleDeckForDifficulty(deck, seed, difficulty);
  return slots.map((pos, i) => ({
    id: `t-${i}`,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    kind: deck[i]!,
    alive: true,
  }));
}

function createBoardSlice(seed: string, difficulty: Difficulty) {
  return {
    tiles: createTiles(seed, difficulty),
    selectedId: null as string | null,
    seed,
    history: [] as RemovalEntry[],
    hintedIds: [] as string[],
    isWon: false,
    startedAt: null as number | null,
    finishedAt: null as number | null,
    difficulty,
  };
}

function allCleared(tiles: TileModel[]): boolean {
  return tiles.every((t) => !t.alive);
}

type BoardSnapshot = {
  startedAt: number | null;
  finishedAt: number | null;
  history: RemovalEntry[];
  isWon: boolean;
  difficulty: Difficulty;
};

/** @returns true if a loss record was written */
function maybeRecordAbandonedGame(s: BoardSnapshot): boolean {
  if (s.isWon || !s.startedAt) return false;
  if (s.history.length === 0) return false;
  appendGameRecord({
    at: Date.now(),
    durationMs: Math.max(0, Date.now() - s.startedAt),
    moves: s.history.length,
    won: false,
    difficulty: s.difficulty,
  });
  return true;
}

export type { Difficulty };

export const useBoardStore = create<{
  tiles: TileModel[];
  selectedId: string | null;
  seed: string;
  history: RemovalEntry[];
  hintedIds: string[];
  isWon: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  difficulty: Difficulty;
  statsRevision: number;
  reset: (seed?: string) => void;
  newGame: () => void;
  restartSameSeed: () => void;
  hydrateStoredDifficulty: () => void;
  setDifficulty: (d: Difficulty) => void;
  selectTile: (id: string) => void;
  clearSelection: () => void;
  undo: () => void;
  hint: () => void;
}>((set, get) => ({
  ...createBoardSlice("prototype-v1", "medium"),
  statsRevision: 0,

  reset: (seed) =>
    set((s) => {
      const bump = maybeRecordAbandonedGame(s);
      const nextSeed = seed ?? `shuffle-${Date.now()}`;
      return {
        ...createBoardSlice(nextSeed, s.difficulty),
        statsRevision: bump ? s.statsRevision + 1 : s.statsRevision,
      };
    }),

  newGame: () =>
    set((s) => {
      const bump = maybeRecordAbandonedGame(s);
      return {
        ...createBoardSlice(`game-${Date.now()}`, s.difficulty),
        statsRevision: bump ? s.statsRevision + 1 : s.statsRevision,
      };
    }),

  restartSameSeed: () =>
    set((s) => {
      const bump = maybeRecordAbandonedGame(s);
      return {
        ...createBoardSlice(s.seed, s.difficulty),
        statsRevision: bump ? s.statsRevision + 1 : s.statsRevision,
      };
    }),

  hydrateStoredDifficulty: () => {
    const d = loadDifficultyPreference();
    if (!d) return;
    set((s) => {
      if (s.difficulty === d) return s;
      return {
        ...createBoardSlice(s.seed, d),
        statsRevision: s.statsRevision,
      };
    });
  },

  setDifficulty: (d) =>
    set((s) => {
      if (s.difficulty === d) return s;
      const bump = maybeRecordAbandonedGame(s);
      saveDifficultyPreference(d);
      return {
        ...createBoardSlice(s.seed, d),
        statsRevision: bump ? s.statsRevision + 1 : s.statsRevision,
      };
    }),

  clearSelection: () => set({ selectedId: null, hintedIds: [] }),

  hint: () => {
    const { tiles, isWon } = get();
    if (isWon) return;
    const pair = getHintPair(tiles);
    set({ hintedIds: pair ? [pair[0], pair[1]] : [] });
  },

  undo: () => {
    const { history, tiles, startedAt } = get();
    const last = history[history.length - 1];
    if (!last) return;
    const nextHistory = history.slice(0, -1);
    const nextTiles = tiles.map((t) => {
      if (t.id === last.a || t.id === last.b) return { ...t, alive: true };
      return t;
    });
    set({
      tiles: nextTiles,
      history: nextHistory,
      selectedId: null,
      hintedIds: [],
      isWon: false,
      finishedAt: null,
      startedAt: nextHistory.length === 0 ? null : startedAt,
    });
  },

  selectTile: (id) => {
    const { tiles, selectedId, isWon } = get();
    if (isWon) return;

    const tile = tiles.find((t) => t.id === id);
    if (!tile || !tile.alive) return;
    if (!isRemovable(tile, tiles)) return;

    if (selectedId === id) {
      set({ selectedId: null, hintedIds: [] });
      return;
    }

    if (!selectedId) {
      set({ selectedId: id, hintedIds: [] });
      return;
    }

    const first = tiles.find((t) => t.id === selectedId);
    if (!first || !first.alive) {
      set({ selectedId: id, hintedIds: [] });
      return;
    }

    if (!isRemovable(first, tiles)) {
      set({ selectedId: id, hintedIds: [] });
      return;
    }

    if (kindsCompatibleMatch(first.kind, tile.kind)) {
      const now = Date.now();
      set((s) => {
        const t0 = s.tiles;
        const tileA = t0.find((t) => t.id === id);
        const tileB = t0.find((t) => t.id === s.selectedId);
        if (!tileA || !tileB || !tileA.alive || !tileB.alive) return s;

        const nextTiles = t0.map((t) => {
          if (t.id === tileB.id || t.id === tileA.id) return { ...t, alive: false };
          return t;
        });
        const won = allCleared(nextTiles);
        const nextHistory = [...s.history, { a: tileB.id, b: tileA.id }];
        const nextStarted = s.startedAt ?? now;

        if (won) {
          const durationMs = Math.max(0, now - nextStarted);
          appendGameRecord({
            at: now,
            durationMs,
            moves: nextHistory.length,
            won: true,
            difficulty: s.difficulty,
          });
        }

        return {
          ...s,
          tiles: nextTiles,
          selectedId: null,
          hintedIds: [],
          history: nextHistory,
          startedAt: nextStarted,
          finishedAt: won ? now : s.finishedAt,
          isWon: won,
          statsRevision: won ? s.statsRevision + 1 : s.statsRevision,
        };
      });
      return;
    }

    set({ selectedId: id, hintedIds: [] });
  },
}));
