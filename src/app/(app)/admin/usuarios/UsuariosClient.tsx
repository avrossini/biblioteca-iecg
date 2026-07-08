"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Can } from "@/components/permissoes/Can";
import { Chip } from "@/components/ui/Chip";
import {
  alternarAtivo,
  convidarUsuario,
  salvarGruposUsuario,
} from "./actions";

type Grupo = { id: number; nome: string };
type Usuario = {
  id: string;
  email: string;
  ativo: boolean;
  ultimoAcesso: string | null;
  grupos: number[];
};

export function UsuariosClient({
  usuarios,
  grupos,
}: {
  usuarios: Usuario[];
  grupos: Grupo[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<number>>(new Set());

  // Convite
  const [conviteAberto, setConviteAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [conviteGrupos, setConviteGrupos] = useState<Set<number>>(new Set());

  const nomeGrupo = (id: number) => grupos.find((g) => g.id === id)?.nome ?? id;

  function abrirEdicao(u: Usuario) {
    setEditId(u.id);
    setSel(new Set(u.grupos));
  }

  function salvarGrupos(userId: string) {
    startTransition(async () => {
      await salvarGruposUsuario(userId, [...sel]);
      setEditId(null);
      router.refresh();
    });
  }

  function toggleAtivo(u: Usuario) {
    startTransition(async () => {
      await alternarAtivo(u.id, !u.ativo);
      router.refresh();
    });
  }

  function enviarConvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      await convidarUsuario(email.trim(), [...conviteGrupos]);
      setEmail("");
      setConviteGrupos(new Set());
      setConviteAberto(false);
      router.refresh();
    });
  }

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<number>>>) {
    return (id: number) =>
      setter((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      });
  }
  const toggleSelEdit = toggleSet(setSel);
  const toggleSelConvite = toggleSet(setConviteGrupos);

  return (
    <div className="flex flex-col gap-4">
      <Can code="usuario.create">
        <div className="rounded-card border border-border bg-surface p-4 shadow-card">
          {conviteAberto ? (
            <div className="flex flex-col gap-3">
              <input
                aria-label="E-mail do convidado"
                type="email"
                placeholder="email@exemplo.com"
                className="rounded-lg border border-border px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                {grupos.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={conviteGrupos.has(g.id)}
                      onChange={() => toggleSelConvite(g.id)}
                    />
                    {g.nome}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={enviarConvite}
                  disabled={pending}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Enviar convite
                </button>
                <button
                  onClick={() => setConviteAberto(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConviteAberto(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Convidar usuário
            </button>
          )}
        </div>
      </Can>

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Grupos</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Último acesso</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{u.email}</td>
                <td className="px-4 py-3">
                  {editId === u.id ? (
                    <div className="flex flex-wrap gap-3">
                      {grupos.map((g) => (
                        <label
                          key={g.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={sel.has(g.id)}
                            onChange={() => toggleSelEdit(g.id)}
                          />
                          {g.nome}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.grupos.length ? (
                        u.grupos.map((id) => (
                          <Chip key={id} tom="accent">
                            {nomeGrupo(id)}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.ativo ? (
                    <Chip tom="ok">Ativo</Chip>
                  ) : (
                    <Chip tom="neutro">Desativado</Chip>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {u.ultimoAcesso
                    ? new Date(u.ultimoAcesso).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Can code="usuario.update">
                    <div className="flex justify-end gap-2">
                      {editId === u.id ? (
                        <button
                          onClick={() => salvarGrupos(u.id)}
                          disabled={pending}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() => abrirEdicao(u)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
                        >
                          Editar grupos
                        </button>
                      )}
                      <button
                        onClick={() => toggleAtivo(u)}
                        disabled={pending}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-60"
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
