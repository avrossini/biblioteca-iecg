import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { CadastroSimples } from "@/components/crud/CadastroSimples";
import { criar, salvar, excluir } from "./actions";

export default async function StatusPage() {
  await requirePermissao("status.index");
  const supabase = await createClient();
  const [{ data: itens }, permissoes] = await Promise.all([
    supabase.from("status").select("id, codigo, nome").order("codigo"),
    getPermissoes(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <CadastroSimples
        titulo="Status"
        singular="status"
        campos={[
          { nome: "codigo", label: "Código", obrigatorio: true, somenteLeitura: true },
          { nome: "nome", label: "Nome", obrigatorio: true },
        ]}
        itens={itens ?? []}
        podeCriar={permissoes.includes("status.create")}
        podeEditar={permissoes.includes("status.update")}
        podeExcluir={permissoes.includes("status.destroy")}
        onCriar={criar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
    </div>
  );
}
