import type { TileKind } from "./types";

const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function allSuits(): TileKind[] {
  const out: TileKind[] = [];
  for (const plane of ["bamboo", "character", "dot"] as const) {
    for (const rank of ranks) {
      out.push({ family: "suit", plane, rank });
    }
  }
  return out;
}

const winds: TileKind[] = [
  { family: "wind", wind: "east" },
  { family: "wind", wind: "south" },
  { family: "wind", wind: "west" },
  { family: "wind", wind: "north" },
];

const dragons: TileKind[] = [
  { family: "dragon", dragon: "red" },
  { family: "dragon", dragon: "green" },
  { family: "dragon", dragon: "white" },
];

/** 34 unique faces used in classic solitaire sets. */
export const BASE_KINDS: TileKind[] = [...allSuits(), ...winds, ...dragons];

/**
 * Build a 144-tile deck for the turtle layout:
 * 30 kinds × 4 + 4 kinds × 6 = 144 (identical-match friendly).
 */
export function buildDeck144(): TileKind[] {
  const sixCopyKinds: TileKind[] = [
    { family: "suit", plane: "bamboo", rank: 1 },
    { family: "suit", plane: "dot", rank: 5 },
    { family: "wind", wind: "east" },
    { family: "dragon", dragon: "red" },
  ];

  const deck: TileKind[] = [];
  for (const k of BASE_KINDS) {
    const copies = sixCopyKinds.some((s) => kindEquals(s, k)) ? 6 : 4;
    for (let i = 0; i < copies; i++) deck.push(k);
  }
  if (deck.length !== 144) {
    throw new Error(`Deck size ${deck.length}, expected 144`);
  }
  return deck;
}

function kindEquals(a: TileKind, b: TileKind): boolean {
  if (a.family !== b.family) return false;
  if (a.family === "suit" && b.family === "suit") {
    return a.plane === b.plane && a.rank === b.rank;
  }
  if (a.family === "wind" && b.family === "wind") return a.wind === b.wind;
  if (a.family === "dragon" && b.family === "dragon") return a.dragon === b.dragon;
  return false;
}
