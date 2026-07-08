"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Can } from "@/components/permissoes/Can";
import { criarGrupo, excluirGrupo, salvarPermissoes } from "./actions";

type Grupo = { id: number; nome: string; descricao: string | null };
type Func = { id: number; codigo: string; nome: string; categoria: string | null };
type Atrib = { grupo_id: number; funcionalidade_id: number };

export function GruposClient({
  grupos,
  funcionalidades,
  atribuicoes,
}: {
  grupos: Grupo[];
  funcionalidades: Func[];
  atribuicoes: Atrib[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selId, setSelId] = useState<number | null>(grupos[0]?.id ?? null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDesc, setNovaDesc] = useState("");

  const porGrupo = useMemo(() => {
    const m = new Map<number, Set<number>>();
    for (const a of atribuicoes) {
      if (!m.has(a.grupo_id)) m.set(a.grupo_id, new Set());
      m.get(a.grupo_id)!.add(a.funcionalidade_id);
    }
    return m;
  }, [atribuicoes]);

  const categorias = useMemo(() => {
    const m = new Map<string, Func[]>();
    for (const f of funcionalidades) {
      const c = f.categoria ?? "Outros";
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(f);
    }
    return [...m.entries()];
  }, [funcionalidades]);

  // Estado da matriz do grupo selecionado (reseta ao trocar de grupo).
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [lastKey, setLastKey] = useState<number>(-999);
  const selKey = selId ?? -1;
  if (selKey !== lastKey) {
    setLastKey(selKey);
    setMarcadas(new Set(porGrupo.get(selKey) ?? []));
  }

  const grupoSel = grupos.find((g) => g.id === selId) ?? null;

  function toggle(id: number) {
    setMarcadas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function salvar() {
    if (selId == null) return;
    startTransition(async () => {
      await salvarPermissoes(selId, [...marcadas]);
      router.refresh();
    });
  }

  function adicionarGrupo() {
    if (!novoNome.trim()) return;
    startTransition(async () => {
      await criarGrupo(novoNome.trim(), novaDesc.trim());
      setNovoNome("");
      setNovaDesc("");
      setNovoAberto(false);
      router.refresh();
    });
  }

  function removerGrupo() {
    if (selId == null) return;
    startTransition(async () => {
      await excluirGrupo(selId);
      setSelId(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      {/* Lista de grupos */}
      <div className="rounded-xl border border-border bg-surface p-2">
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelId(g.id)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
              g.id === selId
                ? "bg-accent/10 text-accent"
                : "text-ink hover:bg-paper"
            }`}
          >
            <span className="font-medium">{g.nome}</span>
            {g.descricao && (
              <span className="block text-xs text-muted">{g.descricao}</span>
            )}
          </button>
        ))}
        <Can code="grupo.create">
          {novoAberto ? (
            <div className="mt-2 flex flex-col gap-2 border-t border-border p-2">
              <input
                aria-label="Nome do grupo"
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome"
              />
              <input
                aria-label="Descrição do grupo"
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
                value={novaDesc}
                onChange={(e) => setNovaDesc(e.target.value)}
                placeholder="Descrição (opcional)"
              />
              <div className="flex gap-2">
                <button
                  onClick={adicionarGrupo}
                  disabled={pending}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Criar
                </button>
                <button
                  onClick={() => setNovoAberto(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNovoAberto(true)}
              className="mt-2 w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-accent"
            >
              + Novo grupo
            </button>
          )}
        </Can>
      </div>

      {/* Matriz de permissões */}
      <div className="rounded-xl border border-border bg-surface">
        {grupoSel ? (
          <>
            <div className="flex items-center gap-3 border-b border-border p-4">
              <div>
                <h2 className="font-serif text-lg font-semibold">
                  {grupoSel.nome}
                </h2>
                {grupoSel.descricao && (
                  <p className="text-sm text-muted">{grupoSel.descricao}</p>
                )}
              </div>
              <div className="ml-auto flex gap-2">
                <Can code="grupo.destroy">
                  <button
                    onClick={removerGrupo}
                    disabled={pending}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
                  >
                    Excluir grupo
                  </button>
                </Can>
                <Can code="grupo.permissoes">
                  <button
                    onClick={salvar}
                    disabled={pending}
                    className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {pending ? "Salvando…" : "Salvar"}
                  </button>
                </Can>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-2 p-4 md:grid-cols-2">
              {categorias.map(([categoria, itens]) => (
                <div key={categoria} className="py-2">
                  <h3 className="mb-1 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    {categoria}
                  </h3>
                  {itens.map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center gap-3 py-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={marcadas.has(f.id)}
                        onChange={() => toggle(f.id)}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                      {f.nome}
                      <span className="ml-auto font-mono text-xs text-muted">
                        {f.codigo}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-muted">Selecione um grupo.</p>
        )}
      </div>
    </div>
  );
}
