import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";
import { EsqueciSenhaForm } from "./EsqueciSenhaForm";

export default function EsqueciSenhaPage() {
  return (
    <Card className="p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Recuperar acesso</p>
      </div>
      <EsqueciSenhaForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-accent-ink">Voltar ao login</Link>
      </p>
    </Card>
  );
}
