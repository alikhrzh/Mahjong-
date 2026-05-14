import type { TileKind } from "./types";
import { kindEquals } from "./types";

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

const FLOWER_TILES: TileKind[] = [
  { family: "flower", flower: 1 },
  { family: "flower", flower: 2 },
  { family: "flower", flower: 3 },
  { family: "flower", flower: 4 },
];

const SEASON_TILES: TileKind[] = [
  { family: "season", season: 1 },
  { family: "season", season: 2 },
  { family: "season", season: 3 },
  { family: "season", season: 4 },
];

/**
 * Build a 144-tile deck for the turtle layout:
 * 30 kinds × 4 + 4 kinds × 6 − 8 (demoted to 2 each) + 8 flower/season = 144.
 * Every face count is even except flowers/seasons which use group-match (any–any).
 */
export function buildDeck144(): TileKind[] {
  const sixCopyKinds: TileKind[] = [
    { family: "suit", plane: "bamboo", rank: 1 },
    { family: "suit", plane: "dot", rank: 5 },
    { family: "wind", wind: "east" },
    { family: "dragon", dragon: "red" },
  ];

  const fourOnlyKinds = BASE_KINDS.filter((k) => !sixCopyKinds.some((s) => kindEquals(s, k)));
  /** Four kinds reduced 4→2 (−8 tiles) to make room for 4 flowers + 4 seasons. */
  const demotedKinds = fourOnlyKinds.slice(0, 4);

  const deck: TileKind[] = [];
  for (const k of BASE_KINDS) {
    let copies = sixCopyKinds.some((s) => kindEquals(s, k)) ? 6 : 4;
    if (demotedKinds.some((d) => kindEquals(d, k))) copies = 2;
    for (let i = 0; i < copies; i++) deck.push(k);
  }
  deck.push(...FLOWER_TILES, ...SEASON_TILES);
  if (deck.length !== 144) {
    throw new Error(`Deck size ${deck.length}, expected 144`);
  }
  return deck;
}
