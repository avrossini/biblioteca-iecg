"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { corGenero } from "@/lib/cores-genero";

type Livro = {
  id: number;
  nome: string;
  codigo_livro: string | null;
  genero_id: number;
  genero: string;
  autores: string;
  total: number;
  disponiveis: number;
};

export function LivrosClient({
  livros,
  podeCriar,
}: {
  livros: Livro[];
  podeCriar: boolean;
}) {
  const [q, setQ] = useState("");
  const filtrados = livros.filter((l) =>
    `${l.nome} ${l.autores} ${l.codigo_livro ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold">Livros</h1>
        {podeCriar && (
          <Link
            href="/livros/novo"
            className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Novo livro
          </Link>
        )}
      </div>

      <input
        aria-label="Buscar"
        placeholder="Buscar por título, autor ou código…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Autores</th>
              <th className="px-4 py-3">Gênero</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Exemplares</th>
              <th className="px-4 py-3">Disponíveis</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Nenhum livro.
                </td>
              </tr>
            )}
            {filtrados.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span
                      className="h-7 w-1.5 flex-none rounded"
                      style={{ background: corGenero(l.genero_id) }}
                      aria-hidden
                    />
                    <Link
                      href={`/livros/${l.id}`}
                      className="font-serif font-medium text-ink hover:text-accent-ink"
                    >
                      {l.nome}
                    </Link>
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{l.autores || "—"}</td>
                <td className="px-4 py-3">
                  <Chip tom="neutro">{l.genero}</Chip>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{l.codigo_livro ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{l.total}</td>
                <td className="px-4 py-3">
                  <Chip tom={l.disponiveis > 0 ? "ok" : "neutro"}>{l.disponiveis} livres</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
