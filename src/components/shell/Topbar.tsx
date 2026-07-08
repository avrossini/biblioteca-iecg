"use client";

import { signOut } from "@/lib/auth-actions";

export function Topbar({
  userEmail,
  onMenu,
}: {
  userEmail?: string | null;
  onMenu: () => void;
}) {
  const iniciais = (userEmail ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Abrir menu"
        className="rounded-lg border border-border p-2 text-muted hover:text-ink md:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div className="ml-auto flex items-center gap-3">
        {userEmail && (
          <span className="hidden text-sm text-muted sm:inline">{userEmail}</span>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-border-strong hover:text-ink"
          >
            Sair
          </button>
        </form>
        <span
          className="grid h-9 w-9 place-items-center rounded-full border border-accent/20 bg-accent-tint text-xs font-semibold text-accent-ink"
          aria-hidden
        >
          {iniciais}
        </span>
      </div>
    </header>
  );
}
