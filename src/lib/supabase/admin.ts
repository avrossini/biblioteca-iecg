import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Client Supabase com a service role — SOMENTE no servidor.
 * Ignora RLS; usado apenas para operações de auth (listar/convidar/banir
 * usuários). As Server Actions verificam a permissão antes de usá-lo.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
