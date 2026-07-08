"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichText } from "@/components/ui/RichText";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { DadosLivro, ResultadoLivro } from "@/lib/livro-tipos";

type Opcao = { id: number; nome: string };

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LivroForm({
  generos,
  autores,
  inicial,
  onSalvar,
}: {
  generos: Opcao[];
  autores: Opcao[];
  inicial?: {
    id: number;
    nome: string;
    codigo_livro: string | null;
    genero_id: number;
    resumo: string | null;
    autores: number[];
    temas: string[];
  };
  onSalvar: (dados: DadosLivro) => Promise<ResultadoLivro>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [codigo, setCodigo] = useState(inicial?.codigo_livro ?? "");
  const [generoId, setGeneroId] = useState<string>(inicial ? String(inicial.genero_id) : "");
  const [autoresSel, setAutoresSel] = useState<Set<number>>(new Set(inicial?.autores ?? []));
  const [temas, setTemas] = useState<string[]>(inicial?.temas ?? []);
  const [temaInput, setTemaInput] = useState("");
  const [resumo, setResumo] = useState(inicial?.resumo ?? "");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const autoresFiltrados = autores.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  function toggleAutor(id: number) {
    setAutoresSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function addTema() {
    const t = temaInput.trim();
    if (t && !temas.includes(t)) setTemas([...temas, t]);
    setTemaInput("");
  }

  function submeter() {
    setErro(null);
    if (!nome.trim()) return setErro("Informe o título.");
    if (!generoId) return setErro("Selecione o gênero.");
    start(async () => {
      const res = await onSalvar({
        nome,
        codigo_livro: codigo,
        genero_id: Number(generoId),
        resumo,
        autores: [...autoresSel],
        temas,
      });
      if (res.erro) return setErro(res.erro);
      router.push(res.id ? `/livros/${res.id}` : "/livros");
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {erro && (
        <p role="alert" className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      )}

      <Card className="flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Título</span>
          <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Código do livro</span>
            <input className={inputCls} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Gênero</span>
            <select className={inputCls} value={generoId} onChange={(e) => setGeneroId(e.target.value)}>
              <option value="">Selecione…</option>
              {generos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Autores</span>
          <input
            aria-label="Buscar autor"
            className={inputCls}
            placeholder="Buscar autor…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-2">
            {autoresFiltrados.length === 0 && (
              <p className="px-1 py-2 text-sm text-muted">Nenhum autor.</p>
            )}
            {autoresFiltrados.map((a) => (
              <label key={a.id} className="flex items-center gap-2 px-1 py-1 text-sm">
                <input type="checkbox" checked={autoresSel.has(a.id)} onChange={() => toggleAutor(a.id)} />
                {a.nome}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Temas</span>
          <div className="flex gap-2">
            <input
              aria-label="Novo tema"
              className={inputCls}
              value={temaInput}
              onChange={(e) => setTemaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTema();
                }
              }}
            />
            <button
              type="button"
              onClick={addTema}
              className="rounded-lg border border-border px-3 text-sm text-muted hover:text-ink"
            >
              Adicionar
            </button>
          </div>
          {temas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {temas.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemas(temas.filter((x) => x !== t))}
                  title="Remover"
                >
                  <Chip tom="neutro">{t} ✕</Chip>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Resumo</span>
          <RichText value={resumo} onChange={setResumo} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={submeter}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/livros")}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
          >
            Cancelar
          </button>
        </div>
      </Card>
    </div>
  );
}
