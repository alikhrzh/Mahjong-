export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

/** More Fisher–Yates passes = stronger mixing (deterministic per seed + difficulty). */
export const DIFFICULTY_SHUFFLE_PASSES: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 6,
};

export function difficultyLabel(d: Difficulty): string {
  if (d === "easy") return "Easy";
  if (d === "hard") return "Hard";
  return "Medium";
}
