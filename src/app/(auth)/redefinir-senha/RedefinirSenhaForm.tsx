"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validarNovaSenha } from "@/lib/auth-validation";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function RedefinirSenhaForm() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const erroValidacao = validarNovaSenha(senha, confirmacao);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      setErro("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {erro && (
        <p role="alert" className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Nova senha</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          className={inputCls}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Confirmar nova senha</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          className={inputCls}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {carregando ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
