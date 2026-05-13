export type TileId = string;

export type SuitPlane = "bamboo" | "character" | "dot";

export type TileKind =
  | { family: "suit"; plane: SuitPlane; rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { family: "wind"; wind: "east" | "south" | "west" | "north" }
  | { family: "dragon"; dragon: "red" | "green" | "white" };

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
  return `dragon-${kind.dragon}`;
}

export function kindsMatch(a: TileKind, b: TileKind): boolean {
  return kindKey(a) === kindKey(b);
}
