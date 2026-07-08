import Link from "next/link";
import { getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { corGenero } from "@/lib/cores-genero";
import { situacaoEmprestimo, diasEmAtraso } from "@/lib/emprestimo";

type AbertoRow = {
  id: number;
  data_prevista_devolucao: string;
  data_devolucao: string | null;
  exemplares: { livros: { nome: string } | null } | null;
  pessoas: { nome: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  async function contar(tabela: "livros" | "exemplares" | "pessoas"): Promise<number> {
    const { count } = await supabase.from(tabela).select("*", { count: "exact", head: true });
    return count ?? 0;
  }

  const { data: st } = await supabase
    .from("status")
    .select("id")
    .eq("codigo", "disponivel")
    .single();
  const dispId = st?.id ?? -1;

  const [livros, exemplares, pessoas, generos, livrosGen, permissoes] = await Promise.all([
    contar("livros"),
    contar("exemplares"),
    contar("pessoas"),
    supabase.from("generos").select("id, nome").order("nome"),
    supabase.from("livros").select("genero_id"),
    getPermissoes(),
  ]);
  const { count: disponiveis } = await supabase
    .from("exemplares")
    .select("*", { count: "exact", head: true })
    .eq("status_id", dispId);
  const { data: abertosRaw } = await supabase
    .from("emprestimos")
    .select(
      `id, data_prevista_devolucao, data_devolucao, exemplares ( livros ( nome ) ), pessoas ( nome )`,
    )
    .is("data_devolucao", null)
    .order("data_prevista_devolucao");

  const abertos = (abertosRaw ?? []) as unknown as AbertoRow[];
  const atrasados = abertos.filter(
    (a) => diasEmAtraso(new Date(a.data_prevista_devolucao)) > 0,
  ).length;

  // Acervo por gênero
  const contagem = new Map<number, number>();
  for (const l of (livrosGen.data ?? []) as { genero_id: number }[]) {
    contagem.set(l.genero_id, (contagem.get(l.genero_id) ?? 0) + 1);
  }
  const barras = ((generos.data ?? []) as { id: number; nome: string }[])
    .map((g) => ({ id: g.id, nome: g.nome, total: contagem.get(g.id) ?? 0 }))
    .filter((g) => g.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxBar = Math.max(1, ...barras.map((b) => b.total));

  const kpis = [
    { rotulo: "Livros no catálogo", valor: livros },
    { rotulo: "Exemplares", valor: exemplares, nota: `${disponiveis ?? 0} disponíveis` },
    { rotulo: "Leitores", valor: pessoas },
    {
      rotulo: "Empréstimos em aberto",
      valor: abertos.length,
      nota: atrasados > 0 ? `${atrasados} atrasado(s)` : undefined,
      alerta: atrasados > 0,
    },
  ];

  const acoes = [
    { label: "Registrar empréstimo", href: "/emprestimos/novo", code: "emprestimo.emprestar" },
    { label: "Cadastrar livro", href: "/livros/novo", code: "livro.create" },
    { label: "Cadastrar leitor", href: "/leitores", code: "pessoa.create" },
  ].filter((a) => permissoes.includes(a.code));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="font-serif text-2xl font-semibold">Painel</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card
            key={k.rotulo}
            className={`p-4 ${k.alerta ? "border-warn/50" : ""}`}
          >
            <div className="text-[0.68rem] uppercase tracking-wide text-faint">{k.rotulo}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{k.valor}</div>
            {k.nota && (
              <div className={`mt-1 text-xs ${k.alerta ? "text-danger" : "text-muted"}`}>{k.nota}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-serif text-lg font-semibold">Empréstimos em aberto</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-4 py-2">Livro</th>
                  <th className="px-4 py-2">Leitor</th>
                  <th className="px-4 py-2">Situação</th>
                </tr>
              </thead>
              <tbody>
                {abertos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted">
                      Nenhum empréstimo em aberto.
                    </td>
                  </tr>
                )}
                {abertos.slice(0, 6).map((a) => {
                  const s = situacaoEmprestimo(a.data_prevista_devolucao, a.data_devolucao);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium text-ink">
                        {a.exemplares?.livros?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-muted">{a.pessoas?.nome ?? "—"}</td>
                      <td className="px-4 py-2">
                        <Chip tom={s.tom}>{s.label}</Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-3 font-serif text-lg font-semibold">Acervo por gênero</h2>
            {barras.length === 0 ? (
              <p className="text-sm text-muted">Sem dados.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {barras.map((b) => (
                  <div key={b.id} className="grid grid-cols-[80px_1fr_28px] items-center gap-2 text-sm">
                    <span className="truncate">{b.nome}</span>
                    <span className="h-2 rounded bg-surface-2">
                      <span
                        className="block h-2 rounded"
                        style={{ width: `${(b.total / maxBar) * 100}%`, background: corGenero(b.id) }}
                      />
                    </span>
                    <span className="text-right tabular-nums text-muted">{b.total}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {acoes.length > 0 && (
            <Card className="p-4">
              <h2 className="mb-3 font-serif text-lg font-semibold">Ações rápidas</h2>
              <div className="flex flex-col gap-2">
                {acoes.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent hover:bg-accent-tint hover:text-accent-ink"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
