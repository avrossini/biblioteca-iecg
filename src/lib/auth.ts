import { createClient } from "@/lib/supabase/server";

/** Usuário autenticado (ou null), no servidor. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
