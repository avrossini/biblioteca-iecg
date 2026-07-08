"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { emprestar } from "../actions";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function NovoEmprestimoClient({
  exemplares,
  leitores,
}: {
  exemplares: { id: number; rotulo: string }[];
  leitores: { id: number; nome: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [exemplarId, setExemplarId] = useState("");
  const [pessoaId, setPessoaId] = useState("");

  function submeter() {
    setErro(null);
    if (!exemplarId) return setErro("Selecione um exemplar disponível.");
    if (!pessoaId) return setErro("Selecione um leitor.");
    start(async () => {
      const r = await emprestar(Number(exemplarId), Number(pessoaId));
      if (r.erro) return setErro(r.erro);
      router.push("/emprestimos");
      router.refresh();
    });
  }

  return (
    <Card className="flex max-w-lg flex-col gap-4 p-5">
      {erro && (
        <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{erro}</p>
      )}
      {exemplares.length === 0 ? (
        <p className="text-sm text-muted">Nenhum exemplar disponível para empréstimo.</p>
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Exemplar disponível</span>
            <select
              aria-label="Exemplar"
              className={inputCls}
              value={exemplarId}
              onChange={(e) => setExemplarId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {exemplares.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Leitor</span>
            <select
              aria-label="Leitor"
              className={inputCls}
              value={pessoaId}
              onChange={(e) => setPessoaId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {leitores.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button
              onClick={submeter}
              disabled={pending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Emprestando…" : "Emprestar"}
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
