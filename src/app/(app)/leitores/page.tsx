import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { CadastroSimples } from "@/components/crud/CadastroSimples";
import { criar, salvar, excluir } from "./actions";

export default async function LeitoresPage() {
  await requirePermissao("pessoa.index");
  const supabase = await createClient();
  const [{ data: itens }, permissoes] = await Promise.all([
    supabase.from("pessoas").select("id, nome, cpf, email, telefone").order("nome"),
    getPermissoes(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <CadastroSimples
        titulo="Leitores"
        singular="leitor"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "cpf", label: "CPF" },
          { nome: "email", label: "E-mail" },
          { nome: "telefone", label: "Telefone" },
        ]}
        itens={itens ?? []}
        podeCriar={permissoes.includes("pessoa.create")}
        podeEditar={permissoes.includes("pessoa.update")}
        podeExcluir={permissoes.includes("pessoa.destroy")}
        onCriar={criar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
    </div>
  );
}
