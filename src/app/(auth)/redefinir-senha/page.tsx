import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";
import { RedefinirSenhaForm } from "./RedefinirSenhaForm";

export default function RedefinirSenhaPage() {
  return (
    <Card className="p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Defina uma nova senha</p>
      </div>
      <RedefinirSenhaForm />
    </Card>
  );
}
