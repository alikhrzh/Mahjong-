import { getSupabaseBrowser } from "./client";
import type { Difficulty } from "@/lib/product/difficulty";

export type CloudGameRecord = {
  id: string;
  user_id: string;
  created_at: string;
  duration_seconds: number;
  won: boolean;
  difficulty: Difficulty;
  moves: number;
};

export type InsertGamePayload = {
  user_id: string;
  duration_seconds: number;
  won: boolean;
  difficulty: Difficulty;
  moves: number;
};

/**
 * Inserts a completed game record for the signed-in user.
 * Never throws — failures are swallowed silently.
 */
export async function insertCompletedGame(payload: InsertGamePayload): Promise<void> {
  try {
    const client = getSupabaseBrowser();
    if (!client) return;
    await client.from("completed_games").insert(payload);
  } catch {
    // Fail silently — local gameplay is unaffected
  }
}

/**
 * Fetches the most recent completed games for the signed-in user.
 * Returns an empty array on any failure.
 */
export async function fetchRecentCompletedGames(limit = 10): Promise<CloudGameRecord[]> {
  try {
    const client = getSupabaseBrowser();
    if (!client) return [];
    const { data, error } = await client
      .from("completed_games")
      .select("id, user_id, created_at, duration_seconds, won, difficulty, moves")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as CloudGameRecord[];
  } catch {
    return [];
  }
}
