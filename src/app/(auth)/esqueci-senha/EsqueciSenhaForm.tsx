"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function EsqueciSenhaForm() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/redefinir-senha`,
    });
    setCarregando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <p className="text-sm text-muted" role="status">
        Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.
        Verifique sua caixa de entrada.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">E-mail</span>
        <input
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {carregando ? "Enviando…" : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
