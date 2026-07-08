import { Brand } from "@/components/Brand";
import { signOut } from "@/lib/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper text-ink">
      <header className="flex items-center gap-4 border-b border-border bg-surface px-6 py-3">
        <Brand />
        <form action={signOut} className="ml-auto">
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-muted hover:text-ink"
          >
            Sair
          </button>
        </form>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
