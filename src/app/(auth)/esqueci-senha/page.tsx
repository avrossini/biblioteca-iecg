import Link from "next/link";
import { Brand } from "@/components/Brand";
import { EsqueciSenhaForm } from "./EsqueciSenhaForm";

export default function EsqueciSenhaPage() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Brand />
        <p className="text-sm text-muted">Recuperar acesso</p>
      </div>
      <EsqueciSenhaForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-accent">Voltar ao login</Link>
      </p>
    </div>
  );
}
