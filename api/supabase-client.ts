// ============================================
// Supabase Client
// ============================================
import { createClient } from "@supabase/supabase-js";
import { env } from "./lib/env";

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRole, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});
