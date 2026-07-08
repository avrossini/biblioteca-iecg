import { requirePermissao } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { LivroForm } from "@/components/livros/LivroForm";
import { criarLivro } from "../actions";

export default async function NovoLivroPage() {
  await requirePermissao("livro.create");
  const supabase = await createClient();
  const [{ data: generos }, { data: autores }] = await Promise.all([
    supabase.from("generos").select("id, nome").order("nome"),
    supabase.from("autores").select("id, nome").order("nome"),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="font-serif text-2xl font-semibold">Novo livro</h1>
      <LivroForm generos={generos ?? []} autores={autores ?? []} onSalvar={criarLivro} />
    </div>
  );
}
