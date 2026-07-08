import { requirePermissao } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { NovoEmprestimoClient } from "./NovoEmprestimoClient";

type ExRow = {
  id: number;
  numero_tombo: string | null;
  livros: { nome: string } | null;
  status: { codigo: string } | null;
};

export default async function NovoEmprestimoPage() {
  await requirePermissao("emprestimo.emprestar");
  const supabase = await createClient();
  const [{ data: exsRaw }, { data: pessoas }] = await Promise.all([
    supabase
      .from("exemplares")
      .select("id, numero_tombo, livros ( nome ), status ( codigo )")
      .order("id"),
    supabase.from("pessoas").select("id, nome").order("nome"),
  ]);

  const disponiveis = ((exsRaw ?? []) as unknown as ExRow[])
    .filter((e) => e.status?.codigo === "disponivel")
    .map((e) => ({
      id: e.id,
      rotulo: `${e.livros?.nome ?? "—"}${e.numero_tombo ? ` (tombo ${e.numero_tombo})` : ""}`,
    }));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="font-serif text-2xl font-semibold">Novo empréstimo</h1>
      <NovoEmprestimoClient exemplares={disponiveis} leitores={pessoas ?? []} />
    </div>
  );
}
