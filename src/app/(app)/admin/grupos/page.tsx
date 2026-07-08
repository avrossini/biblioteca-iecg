import { requirePermissao } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { GruposClient } from "./GruposClient";

export default async function GruposPage() {
  await requirePermissao("grupo.index");
  const supabase = await createClient();

  const [{ data: grupos }, { data: funcionalidades }, { data: atribuicoes }] =
    await Promise.all([
      supabase.from("grupos").select("id, nome, descricao").order("nome"),
      supabase
        .from("funcionalidades")
        .select("id, codigo, nome, categoria")
        .order("categoria")
        .order("nome"),
      supabase.from("grupo_funcionalidade").select("grupo_id, funcionalidade_id"),
    ]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 font-serif text-2xl font-semibold">
        Grupos e permissões
      </h1>
      <GruposClient
        grupos={grupos ?? []}
        funcionalidades={funcionalidades ?? []}
        atribuicoes={atribuicoes ?? []}
      />
    </div>
  );
}
