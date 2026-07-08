import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Card className="p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Entre com suas credenciais para continuar</p>
      </div>
      <LoginForm next={next} />
    </Card>
  );
}
