import type { TileModel } from "./types";

/** Layout units: turtle coordinates assume width 2 per tile on the X axis. */
export const TILE_FOOTPRINT_X = 2;
export const TILE_FOOTPRINT_Y = 1;

export function yOverlap(a: TileModel, b: TileModel): boolean {
  return a.y < b.y + TILE_FOOTPRINT_Y && a.y + TILE_FOOTPRINT_Y > b.y;
}

export function xOverlap(a: TileModel, b: TileModel): boolean {
  return a.x < b.x + TILE_FOOTPRINT_X && a.x + TILE_FOOTPRINT_X > b.x;
}

export function isCovered(tile: TileModel, tiles: TileModel[]): boolean {
  return tiles.some(
    (o) =>
      o.id !== tile.id &&
      o.alive &&
      o.z > tile.z &&
      yOverlap(tile, o) &&
      xOverlap(tile, o),
  );
}

export function blockedLeft(tile: TileModel, tiles: TileModel[]): boolean {
  return tiles.some(
    (o) =>
      o.id !== tile.id &&
      o.alive &&
      o.z >= tile.z &&
      yOverlap(tile, o) &&
      o.x < tile.x &&
      o.x + TILE_FOOTPRINT_X >= tile.x,
  );
}

export function blockedRight(tile: TileModel, tiles: TileModel[]): boolean {
  return tiles.some(
    (o) =>
      o.id !== tile.id &&
      o.alive &&
      o.z >= tile.z &&
      yOverlap(tile, o) &&
      o.x <= tile.x + TILE_FOOTPRINT_X &&
      o.x + TILE_FOOTPRINT_X > tile.x + TILE_FOOTPRINT_X,
  );
}

export function isRemovable(tile: TileModel, tiles: TileModel[]): boolean {
  if (!tile.alive) return false;
  if (isCovered(tile, tiles)) return false;
  return !blockedLeft(tile, tiles) || !blockedRight(tile, tiles);
}

export function renderOrder(tile: Pick<TileModel, "z" | "y" | "x">): number {
  return tile.z * 1_000_000 + tile.y * 1_000 + tile.x;
}
