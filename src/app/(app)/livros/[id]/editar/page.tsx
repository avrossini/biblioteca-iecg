import { notFound } from "next/navigation";
import { requirePermissao } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { LivroForm } from "@/components/livros/LivroForm";
import { atualizarLivro } from "../../actions";

type LivroEdit = {
  id: number;
  nome: string;
  codigo_livro: string | null;
  genero_id: number;
  resumo: string | null;
  livro_autor: { autor_id: number }[];
  temas: { nome: string }[];
};

export default async function EditarLivroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermissao("livro.update");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: generos }, { data: autores }] = await Promise.all([
    supabase
      .from("livros")
      .select(`id, nome, codigo_livro, genero_id, resumo, livro_autor ( autor_id ), temas ( nome )`)
      .eq("id", Number(id))
      .single(),
    supabase.from("generos").select("id, nome").order("nome"),
    supabase.from("autores").select("id, nome").order("nome"),
  ]);

  if (!data) notFound();
  const l = data as unknown as LivroEdit;
  const onSalvar = atualizarLivro.bind(null, l.id);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="font-serif text-2xl font-semibold">Editar livro</h1>
      <LivroForm
        generos={generos ?? []}
        autores={autores ?? []}
        inicial={{
          id: l.id,
          nome: l.nome,
          codigo_livro: l.codigo_livro,
          genero_id: l.genero_id,
          resumo: l.resumo,
          autores: l.livro_autor.map((x) => x.autor_id),
          temas: l.temas.map((t) => t.nome),
        }}
        onSalvar={onSalvar}
      />
    </div>
  );
}
