import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { CadastroSimples } from "@/components/crud/CadastroSimples";
import { criar, salvar, excluir } from "./actions";

export default async function BibliotecasPage() {
  await requirePermissao("biblioteca.index");
  const supabase = await createClient();
  const [{ data: itens }, permissoes] = await Promise.all([
    supabase.from("bibliotecas").select("id, nome").order("nome"),
    getPermissoes(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <CadastroSimples
        titulo="Bibliotecas"
        singular="biblioteca"
        campos={[{ nome: "nome", label: "Nome", obrigatorio: true }]}
        itens={itens ?? []}
        podeCriar={permissoes.includes("biblioteca.create")}
        podeEditar={permissoes.includes("biblioteca.update")}
        podeExcluir={permissoes.includes("biblioteca.destroy")}
        onCriar={criar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
    </div>
  );
}
