"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import {
  criarExemplar,
  atualizarExemplar,
  excluirExemplar,
  type DadosExemplar,
} from "./exemplares/actions";

type Opcao = { id: number; nome: string };
type Exemplar = {
  id: number;
  biblioteca_id: number;
  status_id: number;
  numero_tombo: string | null;
  data_aquisicao: string | null;
  biblioteca: string;
  statusCodigo: string;
  statusNome: string;
};

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function ExemplaresSecao({
  livroId,
  exemplares,
  bibliotecas,
  statuses,
  podeCriar,
  podeEditar,
  podeExcluir,
}: {
  livroId: number;
  exemplares: Exemplar[];
  bibliotecas: Opcao[];
  statuses: Opcao[];
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: number | null; dados: DadosExemplar } | null>(null);

  const statusDisponivel = statuses.find((s) => s.nome)?.id;

  function novo() {
    setErro(null);
    setForm({
      id: null,
      dados: {
        biblioteca_id: bibliotecas[0]?.id ?? 0,
        status_id: statusDisponivel ?? statuses[0]?.id ?? 0,
        numero_tombo: "",
        data_aquisicao: "",
      },
    });
  }
  function editar(e: Exemplar) {
    setErro(null);
    setForm({
      id: e.id,
      dados: {
        biblioteca_id: e.biblioteca_id,
        status_id: e.status_id,
        numero_tombo: e.numero_tombo ?? "",
        data_aquisicao: e.data_aquisicao ?? "",
      },
    });
  }

  function salvar() {
    if (!form) return;
    if (!form.dados.biblioteca_id || !form.dados.status_id) {
      setErro("Selecione biblioteca e status.");
      return;
    }
    start(async () => {
      const res =
        form.id == null
          ? await criarExemplar(livroId, form.dados)
          : await atualizarExemplar(form.id, livroId, form.dados);
      if (res.erro) return setErro(res.erro);
      setForm(null);
      router.refresh();
    });
  }
  function excluir(id: number) {
    setErro(null);
    start(async () => {
      const res = await excluirExemplar(id, livroId);
      if (res.erro) return setErro(res.erro);
      router.refresh();
    });
  }

  function set(campo: keyof DadosExemplar, valor: string | number) {
    if (!form) return;
    setForm({ ...form, dados: { ...form.dados, [campo]: valor } });
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-serif text-lg font-semibold">Exemplares</h2>
        {podeCriar && (
          <button
            onClick={novo}
            className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Novo exemplar
          </button>
        )}
      </div>

      {erro && (
        <p role="alert" className="mb-3 rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      )}

      {form && (
        <div className="mb-4 grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Biblioteca</span>
            <select
              aria-label="Biblioteca"
              className={inputCls}
              value={form.dados.biblioteca_id}
              onChange={(e) => set("biblioteca_id", Number(e.target.value))}
            >
              {bibliotecas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Status</span>
            <select
              aria-label="Status"
              className={inputCls}
              value={form.dados.status_id}
              onChange={(e) => set("status_id", Number(e.target.value))}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nº de tombo</span>
            <input
              aria-label="Nº de tombo"
              className={inputCls}
              value={form.dados.numero_tombo}
              onChange={(e) => set("numero_tombo", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Data de aquisição</span>
            <input
              type="date"
              aria-label="Data de aquisição"
              className={inputCls}
              value={form.dados.data_aquisicao}
              onChange={(e) => set("data_aquisicao", e.target.value)}
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              onClick={salvar}
              disabled={pending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {form.id == null ? "Adicionar" : "Salvar"}
            </button>
            <button
              onClick={() => setForm(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
              <th className="py-2 pr-4">Biblioteca</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Nº tombo</th>
              <th className="py-2 pr-4">Aquisição</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {exemplares.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted">
                  Nenhum exemplar.
                </td>
              </tr>
            )}
            {exemplares.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="py-2 pr-4">{e.biblioteca}</td>
                <td className="py-2 pr-4">
                  <Chip tom={e.statusCodigo === "disponivel" ? "ok" : "neutro"}>{e.statusNome}</Chip>
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-muted">{e.numero_tombo ?? "—"}</td>
                <td className="py-2 pr-4 text-muted">{e.data_aquisicao ?? "—"}</td>
                <td className="py-2">
                  {(podeEditar || podeExcluir) && (
                    <div className="flex justify-end gap-2">
                      {podeEditar && (
                        <button
                          onClick={() => editar(e)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:text-ink"
                        >
                          Editar
                        </button>
                      )}
                      {podeExcluir && (
                        <button
                          onClick={() => excluir(e.id)}
                          disabled={pending}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs text-danger disabled:opacity-60"
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
    </Card>
  );
}
