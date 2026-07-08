import { Brand } from "@/components/Brand";
import { RedefinirSenhaForm } from "./RedefinirSenhaForm";

export default function RedefinirSenhaPage() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Defina uma nova senha</p>
      </div>
      <RedefinirSenhaForm />
    </div>
  );
}
