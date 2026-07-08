import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { CadastroSimples } from "@/components/crud/CadastroSimples";
import { criar, salvar, excluir } from "./actions";

export default async function AutoresPage() {
  await requirePermissao("autor.index");
  const supabase = await createClient();
  const [{ data: itens }, permissoes] = await Promise.all([
    supabase.from("autores").select("id, nome, biografia").order("nome"),
    getPermissoes(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <CadastroSimples
        titulo="Autores"
        singular="autor"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "biografia", label: "Biografia", tipo: "textarea" },
        ]}
        itens={itens ?? []}
        podeCriar={permissoes.includes("autor.create")}
        podeEditar={permissoes.includes("autor.update")}
        podeExcluir={permissoes.includes("autor.destroy")}
        onCriar={criar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
    </div>
  );
}
