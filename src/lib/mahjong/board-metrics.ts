import type { TileModel } from "./types";
import { TILE_FOOTPRINT_X, TILE_FOOTPRINT_Y, renderOrder } from "./removable";

export interface BoardBounds {
  maxX: number;
  maxY: number;
  maxZ: number;
}

export function computeBounds(tiles: Pick<TileModel, "x" | "y" | "z">[]): BoardBounds {
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;
  for (const t of tiles) {
    maxX = Math.max(maxX, t.x + TILE_FOOTPRINT_X);
    maxY = Math.max(maxY, t.y + TILE_FOOTPRINT_Y);
    maxZ = Math.max(maxZ, t.z);
  }
  return { maxX, maxY, maxZ };
}

export interface PixelLayout {
  tileW: number;
  tileH: number;
  unitX: number;
  unitY: number;
  depthX: number;
  depthY: number;
  boardW: number;
  boardH: number;
}

/** Map layout coordinates to pixel box (relative to board origin, top-left of tile face). */
export function computePixelLayout(
  bounds: BoardBounds,
  opts: { tileW: number; tileH: number; overlap: number },
): PixelLayout {
  const { tileW, tileH, overlap } = opts;
  const unitX = (tileW * overlap) / (TILE_FOOTPRINT_X / 2);
  const unitY = (tileH * overlap) / TILE_FOOTPRINT_Y;
  const depthX = 1.15;
  const depthY = -2.35;
  const boardW = bounds.maxX * (unitX / 2) + tileW + bounds.maxZ * depthX + 24;
  const boardH = bounds.maxY * unitY + tileH + bounds.maxZ * Math.abs(depthY) + 24;
  return { tileW, tileH, unitX, unitY, depthX, depthY, boardW, boardH };
}

export function tileToScreen(
  tile: Pick<TileModel, "x" | "y" | "z">,
  px: PixelLayout,
): { left: number; top: number; zIndex: number } {
  const left = tile.x * (px.unitX / 2) + tile.z * px.depthX;
  const top = tile.y * px.unitY + tile.z * px.depthY;
  return { left, top, zIndex: 20 + renderOrder(tile) };
}
