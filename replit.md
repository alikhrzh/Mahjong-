# Mahjong Solitaire

A browser-based Mahjong Solitaire game where players match and clear tile pairs from a classic turtle layout.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mahjong-solitaire/` — Vite + React frontend (the game)
- `artifacts/mahjong-solitaire/src/components/mahjong/` — Board, Tile, TileFace, TileShell, WinOverlay, HistoryPanel
- `artifacts/mahjong-solitaire/src/store/board-store.ts` — Zustand game state (tiles, undo, hints, difficulty)
- `artifacts/mahjong-solitaire/src/lib/mahjong/` — Game logic (deck, layout, matching, removability, randomness)
- `artifacts/mahjong-solitaire/src/lib/persistence/` — localStorage for game records and difficulty preference
- `artifacts/mahjong-solitaire/src/index.css` — Tailwind v4 theme with zinc-based color palette

## Architecture decisions

- Pure client-side game — no backend needed; all state lives in Zustand + localStorage
- Supabase is optional (gracefully returns null if env vars not set) — used for future leaderboard/sync
- Framer Motion drives tile press animations via TileShell's `whileTap`
- Turtle layout is a fixed raw layout string parsed at startup, not fetched from a server

## Product

- Play Mahjong Solitaire with Easy/Medium/Hard difficulty levels
- Undo moves, get hints, restart the same seed, or start a random new game
- Track win/loss record and best time across sessions via localStorage
- Light/dark mode toggle with system preference detection

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
