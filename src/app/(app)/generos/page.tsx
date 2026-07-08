import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { CadastroSimples } from "@/components/crud/CadastroSimples";
import { criar, salvar, excluir } from "./actions";

export default async function GenerosPage() {
  await requirePermissao("genero.index");
  const supabase = await createClient();
  const [{ data: itens }, permissoes] = await Promise.all([
    supabase.from("generos").select("id, nome").order("nome"),
    getPermissoes(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <CadastroSimples
        titulo="Gêneros"
        singular="gênero"
        campos={[{ nome: "nome", label: "Nome", obrigatorio: true }]}
        itens={itens ?? []}
        podeCriar={permissoes.includes("genero.create")}
        podeEditar={permissoes.includes("genero.update")}
        podeExcluir={permissoes.includes("genero.destroy")}
        onCriar={criar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
    </div>
  );
}
