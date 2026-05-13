import type { TileKind } from "@/lib/mahjong/types";

function SuitBars({ plane, rank }: { plane: "bamboo" | "character" | "dot"; rank: number }) {
  if (plane === "bamboo") {
    const sticks = Math.min(9, Math.max(1, rank));
    return (
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {Array.from({ length: sticks }, (_, i) => {
          const col = Math.floor(i / 3);
          const row = i % 3;
          const x = 34 + col * 14;
          const y1 = 28 + row * 18;
          const y2 = y1 + 14;
          return <line key={i} x1={x} x2={x} y1={y1} y2={y2} />;
        })}
      </g>
    );
  }
  if (plane === "dot") {
    const dots = Math.min(9, Math.max(1, rank));
    const positions: Array<[number, number]> = [];
    const pattern = [
      [50, 44],
      [38, 56],
      [62, 56],
      [38, 72],
      [50, 64],
      [62, 72],
      [38, 88],
      [50, 80],
      [62, 88],
    ] as const satisfies readonly (readonly [number, number])[];
    for (let i = 0; i < dots; i++) positions.push([...pattern[i]!]);
    return (
      <g fill="currentColor">
        {positions.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={rank >= 7 && i === 4 ? 4.2 : 3.4} />
        ))}
      </g>
    );
  }
  /* character — minimal “stamp” bars */
  const bars = Math.min(9, Math.max(1, rank));
  return (
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="square">
      {Array.from({ length: bars }, (_, i) => {
        const x = 30 + i * (bars > 5 ? 8 : 10);
        return <line key={i} x1={x} x2={x} y1="36" y2="92" opacity={0.85} />;
      })}
    </g>
  );
}

function WindGlyph({ wind }: { wind: "east" | "south" | "west" | "north" }) {
  const label = { east: "E", south: "S", west: "W", north: "N" }[wind];
  return (
    <text
      x="50"
      y="68"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="currentColor"
      className="font-semibold"
      style={{ fontSize: 34, letterSpacing: -1 }}
    >
      {label}
    </text>
  );
}

function DragonMark({ dragon }: { dragon: "red" | "green" | "white" }) {
  if (dragon === "white") {
    return (
      <rect
        x="34"
        y="38"
        width="32"
        height="32"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
    );
  }
  if (dragon === "green") {
    return (
      <path
        d="M34 78c10-22 22-34 32-34s22 12 32 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    );
  }
  return (
    <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
      <line x1="38" y1="42" x2="62" y2="66" />
      <line x1="62" y1="42" x2="38" y2="66" />
    </g>
  );
}

export type TileVisualState = "available" | "blocked" | "selected";

export function TileFace({ kind, state }: { kind: TileKind; state: TileVisualState }) {
  const muted = state === "blocked";
  return (
    <svg viewBox="0 0 100 112" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="faceSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="84" height="96" rx="14" fill="url(#faceSheen)" opacity={muted ? 0.35 : 0.55} />
      <g
        className={
          muted
            ? "text-zinc-500/80"
            : state === "selected"
              ? "text-indigo-700"
              : "text-zinc-700"
        }
      >
        {kind.family === "suit" && <SuitBars plane={kind.plane} rank={kind.rank} />}
        {kind.family === "wind" && <WindGlyph wind={kind.wind} />}
        {kind.family === "dragon" && <DragonMark dragon={kind.dragon} />}
      </g>
    </svg>
  );
}
