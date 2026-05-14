import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

/** Returns the current session, or null if not signed in / Supabase not configured. */
export async function getSession(): Promise<Session | null> {
  const client = getSupabaseBrowser();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

/** Sends a magic-link email. Resolves with an error string on failure, null on success. */
export async function signInWithMagicLink(email: string): Promise<string | null> {
  const client = getSupabaseBrowser();
  if (!client) return "Supabase is not configured.";
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return error ? error.message : null;
}

/** Signs the current user out. */
export async function signOut(): Promise<void> {
  const client = getSupabaseBrowser();
  if (!client) return;
  await client.auth.signOut();
}

/**
 * Subscribes to auth state changes.
 * @returns An unsubscribe function — call it on cleanup.
 */
export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, user: User | null) => void,
): () => void {
  const client = getSupabaseBrowser();
  if (!client) return () => {};
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
