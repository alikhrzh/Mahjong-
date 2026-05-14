import { useEffect } from "react";
import { GameClient } from "@/components/GameClient";

function App() {
  useEffect(() => {
    try {
      const v = localStorage.getItem("theme");
      const d = v === "dark" || (v !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", d);
    } catch {}
  }, []);

  return <GameClient />;
}

export default App;
