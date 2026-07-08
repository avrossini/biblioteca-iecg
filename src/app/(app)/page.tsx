import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-xl p-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Bem-vindo
        </h1>
        <p className="mt-2 text-muted">
          Você está autenticado como{" "}
          <strong className="text-ink">{user?.email}</strong>.
        </p>
        <p className="mt-4 text-sm text-muted">
          O painel e as telas do sistema chegam nas próximas fases.
        </p>
      </Card>
    </div>
  );
}
