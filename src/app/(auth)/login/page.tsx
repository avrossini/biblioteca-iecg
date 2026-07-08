import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Entre com suas credenciais para continuar</p>
      </div>
      <LoginForm next={next} />
    </div>
  );
}
