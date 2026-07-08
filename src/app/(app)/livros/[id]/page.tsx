import { notFound } from "next/navigation";
import { requirePermissao, getPermissoes } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { corGenero } from "@/lib/cores-genero";
import { sanitizarResumo } from "@/lib/sanitize";
import { LivroAcoes } from "./LivroAcoes";

type LivroDetalhe = {
  id: number;
  nome: string;
  codigo_livro: string | null;
  resumo: string | null;
  genero_id: number;
  generos: { nome: string } | null;
  livro_autor: { autores: { id: number; nome: string } | null }[];
  temas: { nome: string }[];
};

export default async function LivroDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermissao("livro.show");
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("livros")
    .select(
      `id, nome, codigo_livro, resumo, genero_id,
       generos ( nome ),
       livro_autor ( autores ( id, nome ) ),
       temas ( nome )`,
    )
    .eq("id", Number(id))
    .single();

  if (!data) notFound();
  const livro = data as unknown as LivroDetalhe;
  const permissoes = await getPermissoes();
  const resumoHtml = sanitizarResumo(livro.resumo);
  const autores = livro.livro_autor.map((la) => la.autores?.nome).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-9 w-1.5 flex-none rounded"
          style={{ background: corGenero(livro.genero_id) }}
          aria-hidden
        />
        <div>
          <h1 className="font-serif text-2xl font-semibold">{livro.nome}</h1>
          <p className="mt-1 text-sm text-muted">
            {livro.generos?.nome ?? "—"}
            {livro.codigo_livro ? ` · ${livro.codigo_livro}` : ""}
          </p>
        </div>
        <div className="ml-auto">
          <LivroAcoes
            id={livro.id}
            podeEditar={permissoes.includes("livro.update")}
            podeExcluir={permissoes.includes("livro.destroy")}
          />
        </div>
      </div>

      {(autores.length > 0 || livro.temas.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {autores.map((a) => (
            <Chip key={a} tom="accent">
              {a}
            </Chip>
          ))}
          {livro.temas.map((t) => (
            <Chip key={t.nome} tom="neutro">
              {t.nome}
            </Chip>
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-2 font-serif text-lg font-semibold">Resumo</h2>
        {resumoHtml ? (
          <div className="conteudo-rico" dangerouslySetInnerHTML={{ __html: resumoHtml }} />
        ) : (
          <p className="text-muted">Sem resumo.</p>
        )}
      </Card>
    </div>
  );
}
