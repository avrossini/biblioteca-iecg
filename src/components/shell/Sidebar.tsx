"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { usePode } from "@/components/permissoes/PermissoesProvider";

type Item = { label: string; href: string; code: string };

const PRINCIPAL: Item[] = [{ label: "Painel", href: "/", code: "home.index" }];
const ADMIN: Item[] = [
  { label: "Usuários", href: "/admin/usuarios", code: "usuario.index" },
  { label: "Grupos e permissões", href: "/admin/grupos", code: "grupo.index" },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const podeAdmin = usePode(["usuario.index", "grupo.index"]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface p-4 transition-transform md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 px-2 py-2">
        <Brand />
      </div>
      <nav className="flex flex-col gap-1">
        {PRINCIPAL.map((i) => (
          <NavLink key={i.href} item={i} onNavigate={onNavigate} />
        ))}
        {podeAdmin && (
          <div className="mt-4 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Administração
          </div>
        )}
        {ADMIN.map((i) => (
          <NavLink key={i.href} item={i} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}

function NavLink({ item, onNavigate }: { item: Item; onNavigate: () => void }) {
  const pode = usePode(item.code);
  const pathname = usePathname();
  if (!pode) return null;
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        active
          ? "bg-accent/10 text-accent"
          : "text-muted hover:bg-paper hover:text-ink"
      }`}
    >
      {item.label}
    </Link>
  );
}
