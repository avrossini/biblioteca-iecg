"use client";

import { signOut } from "@/lib/auth-actions";

export function Topbar({
  userEmail,
  onMenu,
}: {
  userEmail?: string | null;
  onMenu: () => void;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Abrir menu"
        className="rounded-lg border border-border p-2 text-muted md:hidden"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
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
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-muted hover:text-ink"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
