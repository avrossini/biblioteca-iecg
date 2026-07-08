"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { situacaoEmprestimo } from "@/lib/emprestimo";
import { devolver } from "./actions";

type Emp = {
  id: number;
  livro: string;
  leitor: string;
  retirada: string;
  prevista: string;
  devolucao: string | null;
};

function fmt(d: string | null): string {
  return d ? d.slice(0, 10).split("-").reverse().join("/") : "—";
}

export function EmprestimosClient({
  emprestimos,
  podeDevolver,
  podeEmprestar,
  filtradoPorExemplar,
}: {
  emprestimos: Emp[];
  podeDevolver: boolean;
  podeEmprestar: boolean;
  filtradoPorExemplar: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [soAbertos, setSoAbertos] = useState(!filtradoPorExemplar);

  const lista = emprestimos.filter((e) => (soAbertos ? !e.devolucao : true));

  function dev(id: number) {
    setErro(null);
    start(async () => {
      const r = await devolver(id);
      if (r.erro) return setErro(r.erro);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold">
          {filtradoPorExemplar ? "Histórico do exemplar" : "Empréstimos"}
        </h1>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={soAbertos}
            onChange={(e) => setSoAbertos(e.target.checked)}
          />
          Só abertos
        </label>
        {podeEmprestar && (
          <Link
            href="/emprestimos/novo"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Novo empréstimo
          </Link>
        )}
      </div>

      {erro && (
        <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{erro}</p>
      )}

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
              <th className="px-4 py-3">Livro</th>
              <th className="px-4 py-3">Leitor</th>
              <th className="px-4 py-3">Retirada</th>
              <th className="px-4 py-3">Devolução prevista</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Nenhum empréstimo.
                </td>
              </tr>
            )}
            {lista.map((e) => {
              const s = situacaoEmprestimo(e.prevista, e.devolucao);
              return (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium text-ink">{e.livro}</td>
                  <td className="px-4 py-3">{e.leitor}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{fmt(e.retirada)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{fmt(e.prevista)}</td>
                  <td className="px-4 py-3">
                    <Chip tom={s.tom}>{s.label}</Chip>
                  </td>
                  <td className="px-4 py-3">
                    {podeDevolver && !e.devolucao && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => dev(e.id)}
                          disabled={pending}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-60"
                        >
                          Devolver
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
