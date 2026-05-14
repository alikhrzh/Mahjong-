export type TileId = string;

export type SuitPlane = "bamboo" | "character" | "dot";

export type TileKind =
  | { family: "suit"; plane: SuitPlane; rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { family: "wind"; wind: "east" | "south" | "west" | "north" }
  | { family: "dragon"; dragon: "red" | "green" | "white" }
  | { family: "flower"; flower: 1 | 2 | 3 | 4 }
  | { family: "season"; season: 1 | 2 | 3 | 4 };

export interface TileModel {
  id: TileId;
  x: number;
  y: number;
  z: number;
  kind: TileKind;
  alive: boolean;
}

export function kindKey(kind: TileKind): string {
  if (kind.family === "suit") return `${kind.plane}-${kind.rank}`;
  if (kind.family === "wind") return `wind-${kind.wind}`;
  if (kind.family === "dragon") return `dragon-${kind.dragon}`;
  if (kind.family === "flower") return `flower-${kind.flower}`;
  return `season-${kind.season}`;
}

/** Identical tile faces (strict). */
export function kindsMatch(a: TileKind, b: TileKind): boolean {
  return kindKey(a) === kindKey(b);
}

/** Equality of tile kind for deck building / dedupe. */
export function kindEquals(a: TileKind, b: TileKind): boolean {
  if (a.family !== b.family) return false;
  if (a.family === "suit" && b.family === "suit") {
    return a.plane === b.plane && a.rank === b.rank;
  }
  if (a.family === "wind" && b.family === "wind") return a.wind === b.wind;
  if (a.family === "dragon" && b.family === "dragon") return a.dragon === b.dragon;
  if (a.family === "flower" && b.family === "flower") return a.flower === b.flower;
  if (a.family === "season" && b.family === "season") return a.season === b.season;
  return false;
}

/**
 * Pairing for removal: identical suits/winds/dragons; any flower with any flower;
 * any season with any season.
 */
export function kindsCompatibleMatch(a: TileKind, b: TileKind): boolean {
  if (kindsMatch(a, b)) return true;
  if (a.family === "flower" && b.family === "flower") return true;
  if (a.family === "season" && b.family === "season") return true;
  return false;
}
