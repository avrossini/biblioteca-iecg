"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { excluirLivro } from "../actions";

export function LivroAcoes({
  id,
  podeEditar,
  podeExcluir,
}: {
  id: number;
  podeEditar: boolean;
  podeExcluir: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function excluir() {
    if (!window.confirm("Excluir este livro?")) return;
    setErro(null);
    start(async () => {
      const res = await excluirLivro(id);
      if (res.erro) {
        setErro(res.erro);
        return;
      }
      router.push("/livros");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {erro && <span className="text-sm text-danger">{erro}</span>}
      {podeEditar && (
        <Link
          href={`/livros/${id}/editar`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
        >
          Editar
        </Link>
      )}
      {podeExcluir && (
        <button
          onClick={excluir}
          disabled={pending}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-danger disabled:opacity-60"
        >
          Excluir
        </button>
      )}
    </div>
  );
}
