"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { usePode } from "@/components/permissoes/PermissoesProvider";

type Item = { label: string; href: string; code: string; icon: React.ReactNode };

const iconePainel = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="11" width="8" height="10" rx="1.5" />
    <rect x="3" y="14" width="8" height="7" rx="1.5" />
  </svg>
);
const iconeUsuarios = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <circle cx="18" cy="9" r="2.2" />
    <path d="M15.5 19a4 4 0 0 1 5.5-3.7" />
  </svg>
);
const iconeGrupos = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const PRINCIPAL: Item[] = [
  { label: "Painel", href: "/", code: "home.index", icon: iconePainel },
];
const ADMIN: Item[] = [
  { label: "Usuários", href: "/admin/usuarios", code: "usuario.index", icon: iconeUsuarios },
  { label: "Grupos e permissões", href: "/admin/grupos", code: "grupo.index", icon: iconeGrupos },
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
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 border-r border-border bg-surface p-4 transition-transform md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-3 px-2 py-2">
        <Brand />
      </div>
      <nav className="flex flex-col gap-1">
        {PRINCIPAL.map((i) => (
          <NavLink key={i.href} item={i} onNavigate={onNavigate} />
        ))}
        {podeAdmin && (
          <div className="mt-4 px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-wider text-faint">
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
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border border-accent/20 bg-accent-tint text-accent-ink"
          : "border border-transparent text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
      {item.label}
    </Link>
  );
}
