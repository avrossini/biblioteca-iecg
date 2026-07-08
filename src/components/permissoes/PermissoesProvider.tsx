"use client";

import { createContext, useContext } from "react";

const PermissoesContext = createContext<string[]>([]);

export function PermissoesProvider({
  permissoes,
  children,
}: {
  permissoes: string[];
  children: React.ReactNode;
}) {
  return (
    <PermissoesContext.Provider value={permissoes}>
      {children}
    </PermissoesContext.Provider>
  );
}

export function usePermissoes(): string[] {
  return useContext(PermissoesContext);
}

/** Verdadeiro se o usuário possui alguma das permissões informadas. */
export function usePode(code: string | string[]): boolean {
  const permissoes = useContext(PermissoesContext);
  const codes = Array.isArray(code) ? code : [code];
  return codes.some((c) => permissoes.includes(c));
}
