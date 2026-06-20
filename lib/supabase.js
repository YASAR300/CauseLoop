// ============================================================
// lib/supabase.js
// Re-exports from the split client/server modules.
// Import from the specific file when you know the context:
//   - Client Components  → import from "@/lib/supabase/client"
//   - Server Components  → import from "@/lib/supabase/server"
// This barrel file exists for backwards compatibility only.
// ============================================================

export { createClient }      from "@/lib/supabase/client";
export { createServerClient, createAdminClient } from "@/lib/supabase/server";
