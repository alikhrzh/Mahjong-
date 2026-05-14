import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { getSession, subscribeToAuthChanges } from "@/lib/supabase/auth";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
  /** Call once on app mount. Reads the existing session and subscribes to changes. */
  initAuth: () => () => void;
  _setUser: (user: User | null) => void;
  _setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  _setUser: (user) => set({ user }),
  _setLoading: (loading) => set({ loading }),

  initAuth: () => {
    if (!getSupabaseBrowser()) {
      set({ loading: false });
      return () => {};
    }

    getSession().then((session) => {
      set({ user: session?.user ?? null, loading: false });
    });

    const unsubscribe = subscribeToAuthChanges((_event, user) => {
      set({ user, loading: false });
    });

    return unsubscribe;
  },
}));
