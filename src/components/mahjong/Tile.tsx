"use client";

import type { TileModel } from "@/lib/mahjong/types";
import { isRemovable } from "@/lib/mahjong/removable";
import type { PixelLayout } from "@/lib/mahjong/board-metrics";
import { tileToScreen } from "@/lib/mahjong/board-metrics";
import { TileFace, type TileVisualState } from "./TileFace";
import { TileShell } from "./TileShell";

export function Tile({
  tile,
  tiles,
  selectedId,
  px,
  onSelect,
}: {
  tile: TileModel;
  tiles: TileModel[];
  selectedId: string | null;
  px: PixelLayout;
  onSelect: (id: string) => void;
}) {
  if (!tile.alive) return null;
  const removable = isRemovable(tile, tiles);
  const visual: TileVisualState = !removable
    ? "blocked"
    : selectedId === tile.id
      ? "selected"
      : "available";
  const pos = tileToScreen(tile, px);

  return (
    <TileShell
      visual={visual}
      aria-label="Mahjong tile"
      aria-pressed={selectedId === tile.id}
      onClick={() => onSelect(tile.id)}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        zIndex: pos.zIndex,
        width: px.tileW,
        height: px.tileH,
      }}
    >
      <TileFace kind={tile.kind} state={visual} />
    </TileShell>
  );
}
