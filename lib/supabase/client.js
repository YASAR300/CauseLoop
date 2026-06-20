// ============================================================
// lib/supabase/client.js
// Browser-safe Supabase client — uses NEXT_PUBLIC_ keys ONLY.
// Never import SUPABASE_SERVICE_ROLE_KEY in this file.
// ============================================================

import { createBrowserClient } from "@supabase/ssr";

/**
 * Call once per React tree (or inside a hook) to get a Supabase client
 * that works on the browser side with the user's own session/cookies.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
