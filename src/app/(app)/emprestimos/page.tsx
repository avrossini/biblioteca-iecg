import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { EmprestimosClient } from "./EmprestimosClient";

type Row = {
  id: number;
  data_emprestimo: string;
  data_prevista_devolucao: string;
  data_devolucao: string | null;
  exemplar_id: number;
  exemplares: { numero_tombo: string | null; livros: { nome: string } | null } | null;
  pessoas: { nome: string } | null;
};

export default async function EmprestimosPage({
  searchParams,
}: {
  searchParams: Promise<{ exemplar?: string }>;
}) {
  await requirePermissao("emprestimo.index");
  const { exemplar } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("emprestimos")
    .select(
      `id, data_emprestimo, data_prevista_devolucao, data_devolucao, exemplar_id,
       exemplares ( numero_tombo, livros ( nome ) ),
       pessoas ( nome )`,
    )
    .order("id", { ascending: false });
  if (exemplar) query = query.eq("exemplar_id", Number(exemplar));

  const [{ data }, permissoes] = await Promise.all([query, getPermissoes()]);
  const rows = (data ?? []) as unknown as Row[];
  const emprestimos = rows.map((r) => ({
    id: r.id,
    livro: r.exemplares?.livros?.nome ?? "—",
    leitor: r.pessoas?.nome ?? "—",
    retirada: r.data_emprestimo,
    prevista: r.data_prevista_devolucao,
    devolucao: r.data_devolucao,
  }));

  return (
    <div className="p-4 md:p-6">
      <EmprestimosClient
        emprestimos={emprestimos}
        podeDevolver={permissoes.includes("emprestimo.devolver")}
        podeEmprestar={permissoes.includes("emprestimo.emprestar")}
        filtradoPorExemplar={Boolean(exemplar)}
      />
    </div>
  );
}
