import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { LivrosClient } from "./LivrosClient";

type Row = {
  id: number;
  nome: string;
  codigo_livro: string | null;
  genero_id: number;
  generos: { nome: string } | null;
  livro_autor: { autores: { nome: string } | null }[];
  exemplares: { status: { codigo: string } | null }[];
};

export default async function LivrosPage() {
  await requirePermissao("livro.index");
  const supabase = await createClient();
  const [{ data }, permissoes] = await Promise.all([
    supabase
      .from("livros")
      .select(
        `id, nome, codigo_livro, genero_id,
         generos ( nome ),
         livro_autor ( autores ( nome ) ),
         exemplares ( status ( codigo ) )`,
      )
      .order("nome"),
    getPermissoes(),
  ]);

  const rows = (data ?? []) as unknown as Row[];
  const livros = rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    codigo_livro: r.codigo_livro,
    genero_id: r.genero_id,
    genero: r.generos?.nome ?? "—",
    autores: r.livro_autor
      .map((la) => la.autores?.nome)
      .filter(Boolean)
      .join(", "),
    total: r.exemplares.length,
    disponiveis: r.exemplares.filter((e) => e.status?.codigo === "disponivel").length,
  }));

  return (
    <div className="p-4 md:p-6">
      <LivrosClient livros={livros} podeCriar={permissoes.includes("livro.create")} />
    </div>
  );
}
