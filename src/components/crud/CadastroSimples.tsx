"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import type { Resultado } from "@/lib/erros-db";

export type Campo = {
  nome: string;
  label: string;
  tipo?: "text" | "textarea";
  obrigatorio?: boolean;
  somenteLeitura?: boolean;
};

export type ItemSimples = { id: number; [campo: string]: string | number | null };

export function CadastroSimples({
  titulo,
  singular,
  campos,
  itens,
  podeCriar,
  podeEditar,
  podeExcluir,
  onCriar,
  onSalvar,
  onExcluir,
}: {
  titulo: string;
  singular: string;
  campos: Campo[];
  itens: ItemSimples[];
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
  onCriar: (valores: Record<string, string>) => Promise<Resultado>;
  onSalvar: (id: number, valores: Record<string, string>) => Promise<Resultado>;
  onExcluir: (id: number) => Promise<Resultado>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: number | null; valores: Record<string, string> } | null>(
    null,
  );

  function abrirNovo() {
    setErro(null);
    setForm({ id: null, valores: Object.fromEntries(campos.map((c) => [c.nome, ""])) });
  }
  function abrirEdicao(item: ItemSimples) {
    setErro(null);
    setForm({
      id: item.id,
      valores: Object.fromEntries(campos.map((c) => [c.nome, (item[c.nome] as string) ?? ""])),
    });
  }

  function submeter() {
    if (!form) return;
    for (const c of campos) {
      if (c.obrigatorio && !form.valores[c.nome]?.trim()) {
        setErro(`Preencha o campo "${c.label}".`);
        return;
      }
    }
    startTransition(async () => {
      const res = form.id == null
        ? await onCriar(form.valores)
        : await onSalvar(form.id, form.valores);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setForm(null);
      router.refresh();
    });
  }

  function excluir(id: number) {
    setErro(null);
    startTransition(async () => {
      const res = await onExcluir(id);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      router.refresh();
    });
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold">{titulo}</h1>
        {podeCriar && (
          <button
            onClick={abrirNovo}
            className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Novo {singular}
          </button>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      )}

      {form && (
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            {campos.map((c) => (
              <label key={c.nome} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{c.label}</span>
                {c.tipo === "textarea" ? (
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={form.valores[c.nome]}
                    readOnly={c.somenteLeitura && form.id != null}
                    onChange={(e) =>
                      setForm({ ...form, valores: { ...form.valores, [c.nome]: e.target.value } })
                    }
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={form.valores[c.nome]}
                    readOnly={c.somenteLeitura && form.id != null}
                    onChange={(e) =>
                      setForm({ ...form, valores: { ...form.valores, [c.nome]: e.target.value } })
                    }
                  />
                )}
              </label>
            ))}
            <div className="flex gap-2">
              <button
                onClick={submeter}
                disabled={pending}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {form.id == null ? "Criar" : "Salvar"}
              </button>
              <button
                onClick={() => setForm(null)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
              {campos.map((c) => (
                <th key={c.nome} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 && (
              <tr>
                <td colSpan={campos.length + 1} className="px-4 py-6 text-center text-muted">
                  Nenhum registro.
                </td>
              </tr>
            )}
            {itens.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                {campos.map((c) => (
                  <td key={c.nome} className="px-4 py-3 text-ink">
                    {(item[c.nome] as string) ?? "—"}
                  </td>
                ))}
                <td className="px-4 py-3">
                  {(podeEditar || podeExcluir) && (
                    <div className="flex justify-end gap-2">
                      {podeEditar && (
                        <button
                          onClick={() => abrirEdicao(item)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
                        >
                          Editar
                        </button>
                      )}
                      {podeExcluir && (
                        <button
                          onClick={() => excluir(item.id)}
                          disabled={pending}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-danger disabled:opacity-60"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
