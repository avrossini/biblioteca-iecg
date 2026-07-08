"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) {
      setCarregando(false);
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.push(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
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
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center text-sm font-medium text-ink">
          Senha
          <Link href="/esqueci-senha" className="ml-auto text-xs font-medium text-accent">
            Esqueci minha senha
          </Link>
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {carregando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
