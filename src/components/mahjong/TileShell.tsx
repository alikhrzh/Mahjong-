"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import type { TileVisualState } from "./TileFace";

const stateRing: Record<TileVisualState, string> = {
  available: "ring-1 ring-black/[0.06] shadow-tile",
  blocked: "ring-1 ring-black/[0.04] shadow-sm",
  selected: "ring-2 ring-indigo-400/80 shadow-[0_18px_40px_rgba(79,70,229,0.22)]",
};

export function TileShell({
  visual,
  children,
  style,
  ...rest
}: HTMLMotionProps<"button"> & { visual: TileVisualState; children: ReactNode }) {
  const elevated = visual !== "blocked";
  return (
    <motion.button
      type="button"
      whileTap={visual === "blocked" ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className={[
        "relative isolate flex select-none items-center justify-center overflow-hidden rounded-2xl",
        "bg-gradient-to-b from-white to-zinc-100/95",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
        stateRing[visual],
        visual === "blocked" ? "opacity-[0.68] saturate-[0.72] brightness-[0.98]" : "",
        visual === "selected" ? "scale-[1.04]" : elevated ? "hover:scale-[1.02]" : "",
      ].join(" ")}
      style={{
        width: "100%",
        height: "100%",
        transform: elevated ? "translateZ(0)" : undefined,
        ...style,
      }}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-x-3 top-2 h-[40%] rounded-xl bg-white/55 blur-[0.5px]" />
      <span className="pointer-events-none absolute inset-x-2 bottom-2 h-[22%] rounded-lg bg-black/[0.04]" />
      <div className="relative z-10 h-[78%] w-[82%]">{children}</div>
    </motion.button>
  );
}
