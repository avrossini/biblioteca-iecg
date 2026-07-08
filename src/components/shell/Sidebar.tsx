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

const iconeLivros = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
    <path d="M12 4h6.5A1.5 1.5 0 0 1 20 5.5v13" />
  </svg>
);
const iconeAutores = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);
const iconeTag = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8.5 11 4l7 4.5" /><path d="M4 10.5 11 15l3.5-2.2" />
  </svg>
);
const iconePredio = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V7l8-3 8 3v13" /><path d="M4 20h16" /><path d="M9 20v-5h6v5" />
  </svg>
);
const iconeStatus = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-4.5" />
  </svg>
);

const iconeLeitores = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.4" />
    <path d="M17.5 19a5.5 5.5 0 0 0-2.4-4.5" />
  </svg>
);

const iconeEmprestimos = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </svg>
);

const PRINCIPAL: Item[] = [
  { label: "Painel", href: "/", code: "home.index", icon: iconePainel },
  { label: "Leitores", href: "/leitores", code: "pessoa.index", icon: iconeLeitores },
  { label: "Empréstimos", href: "/emprestimos", code: "emprestimo.index", icon: iconeEmprestimos },
];
const CATALOGO: Item[] = [
  { label: "Livros", href: "/livros", code: "livro.index", icon: iconeLivros },
  { label: "Autores", href: "/autores", code: "autor.index", icon: iconeAutores },
  { label: "Gêneros", href: "/generos", code: "genero.index", icon: iconeTag },
  { label: "Bibliotecas", href: "/bibliotecas", code: "biblioteca.index", icon: iconePredio },
  { label: "Status", href: "/status", code: "status.index", icon: iconeStatus },
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
  const podeCatalogo = usePode([
    "livro.index",
    "autor.index",
    "genero.index",
    "biblioteca.index",
    "status.index",
  ]);
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
        {podeCatalogo && (
          <div className="mt-4 px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-wider text-faint">
            Catálogo
          </div>
        )}
        {CATALOGO.map((i) => (
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
