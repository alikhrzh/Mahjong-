import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tile: "0 10px 28px rgba(15, 23, 42, 0.18)",
        "tile-inner": "inset 0 1px 0 rgba(255,255,255,0.65)",
      },
    },
  },
  plugins: [],
} satisfies Config;
