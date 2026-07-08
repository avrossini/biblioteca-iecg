"use client";

import { usePode } from "./PermissoesProvider";

/** Renderiza os filhos apenas se o usuário tiver a(s) permissão(ões). */
export function Can({
  code,
  children,
}: {
  code: string | string[];
  children: React.ReactNode;
}) {
  return usePode(code) ? <>{children}</> : null;
}
