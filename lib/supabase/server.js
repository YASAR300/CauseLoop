// ============================================================
// lib/supabase/server.js
// Server-only Supabase clients — NEVER import in Client Components.
// - createServerClient : uses the user's session cookie (anon key)
// - createAdminClient  : uses the service-role key (bypasses RLS)
// ============================================================

import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// ⚠ Service-role key — only available in server bundle, never sent to browser
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Session-aware server client.
 * Reads/writes cookies so the user's JWT is forwarded correctly on
 * server-rendered pages and Route Handlers. RLS applies normally.
 *
 * Usage: const supabase = createServerClient();
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createServerClient() {
  const cookieStore = cookies();

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component that cannot set cookies.
          // Middleware handles session refresh instead.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same as above.
        }
      },
    },
  });
}

/**
 * Admin / service-role client.
 * Bypasses Row Level Security — use only in trusted server contexts
 * (webhooks, cron jobs, admin Route Handlers).
 * NEVER call this from a Client Component or expose it to the browser.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error(
      "[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to your .env file and never expose it to the browser."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable all session management — this client is stateless
      autoRefreshToken: false,
      persistSession:   false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Ensures that a profile exists in the profiles table for the given authenticated user.
 * If missing, it auto-creates it to heal orphaned auth users.
 *
 * @param {object} user - The auth user object from supabase.auth.getUser()
 * @returns {Promise<boolean>} - True if profile exists or was created, false otherwise
 */
export async function ensureUserProfile(user) {
  if (!user) return false;
  
  const adminSupabase = createAdminClient();
  try {
    const { data: profile, error: fetchError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("[ensureUserProfile Fetch Error]:", fetchError);
      return false;
    }

    if (!profile) {
      console.log(`[Self-Healing]: Profile missing for user ${user.id}. Creating on-the-fly.`);
      const { error: insertError } = await adminSupabase
        .from("profiles")
        .insert({
          id: user.id,
          role: "visitor",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          charity_contribution_percentage: 10.00
        });

      if (insertError) {
        console.error("[ensureUserProfile Insert Error]:", insertError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("[ensureUserProfile General Error]:", err);
    return false;
  }
}
