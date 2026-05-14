import type { TileModel } from "./types";
import { kindsCompatibleMatch } from "./types";
import { isRemovable } from "./removable";

/** First removable pair that can match (linear scan). */
export function getHintPair(tiles: TileModel[]): [string, string] | null {
  const candidates = tiles.filter((t) => t.alive && isRemovable(t, tiles));
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i]!;
      const b = candidates[j]!;
      if (kindsCompatibleMatch(a.kind, b.kind)) return [a.id, b.id];
    }
  }
  return null;
}
