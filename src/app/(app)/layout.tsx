import { getUser } from "@/lib/auth";
import { getPermissoes } from "@/lib/permissoes";
import { PermissoesProvider } from "@/components/permissoes/PermissoesProvider";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, permissoes] = await Promise.all([getUser(), getPermissoes()]);

  return (
    <PermissoesProvider permissoes={permissoes}>
      <AppShell userEmail={user?.email}>{children}</AppShell>
    </PermissoesProvider>
  );
}
