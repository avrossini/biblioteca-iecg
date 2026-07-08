import { getUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-10 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Bem-vindo</h1>
        <p className="mt-2 text-muted">
          Você está autenticado como <strong className="text-ink">{user?.email}</strong>.
        </p>
        <p className="mt-4 text-sm text-muted">
          O painel e as telas do sistema chegam nas próximas fases.
        </p>
      </div>
    </main>
  );
}
