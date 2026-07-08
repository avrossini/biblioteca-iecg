import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Usuário autenticado (ou null), no servidor. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Server Action: encerra a sessão e volta ao login. */
export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
