import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { signInWithMagicLink, signOut } from "@/lib/supabase/auth";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function AuthBar() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initAuth = useAuthStore((s) => s.initAuth);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, [initAuth]);

  const configured = Boolean(getSupabaseBrowser());

  if (!configured || loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline truncate max-w-[160px]">
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex h-10 items-center rounded-full border border-white/50 bg-white/60 px-3 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-xl transition hover:bg-white/80 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900/80"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Magic link sent — check your email
      </span>
    );
  }

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);
    const err = await signInWithMagicLink(trimmed);
    setSending(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="your@email.com"
        className="h-10 w-40 rounded-full border border-white/50 bg-white/60 px-3 text-xs text-zinc-800 placeholder-zinc-400 shadow-sm backdrop-blur-xl outline-none focus:ring-1 focus:ring-zinc-400/60 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500 sm:w-48"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !email.trim()}
        className="inline-flex h-10 items-center rounded-full border border-white/50 bg-white/60 px-3 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-xl transition hover:bg-white/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900/80"
      >
        {sending ? "Sending…" : "Magic link"}
      </button>
    </div>
  );
}
