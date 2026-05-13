import { create } from "zustand";
import { buildDeck144 } from "@/lib/mahjong/deck";
import { parseLayout, TURTLE_LAYOUT_RAW } from "@/lib/mahjong/layout-turtle";
import { hashSeed, mulberry32, shuffleInPlace } from "@/lib/mahjong/random";
import { isRemovable } from "@/lib/mahjong/removable";
import type { TileModel } from "@/lib/mahjong/types";

function createTiles(seed: string): TileModel[] {
  const slots = parseLayout(TURTLE_LAYOUT_RAW);
  const deck = buildDeck144();
  const rand = mulberry32(hashSeed(seed));
  shuffleInPlace(deck, rand);
  return slots.map((pos, i) => ({
    id: `t-${i}`,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    kind: deck[i]!,
    alive: true,
  }));
}

export const useBoardStore = create<{
  tiles: TileModel[];
  selectedId: string | null;
  seed: string;
  reset: (seed?: string) => void;
  selectTile: (id: string) => void;
  clearSelection: () => void;
}>((set, get) => ({
  tiles: createTiles("prototype-v1"),
  selectedId: null,
  seed: "prototype-v1",
  reset: (seed = "prototype-v1") => set({ tiles: createTiles(seed), selectedId: null, seed }),
  selectTile: (id) => {
    const { tiles } = get();
    const tile = tiles.find((t) => t.id === id);
    if (!tile || !tile.alive || !isRemovable(tile, tiles)) return;
    set({ selectedId: get().selectedId === id ? null : id });
  },
  clearSelection: () => set({ selectedId: null }),
}));
