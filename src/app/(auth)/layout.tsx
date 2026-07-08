export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-6 py-16 text-ink">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
