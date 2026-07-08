import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Offline — Biblioteca IECG",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper p-6 text-ink">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <Brand />
        <h1 className="font-serif text-2xl font-semibold">Você está offline</h1>
        <p className="text-muted">
          Não foi possível conectar ao servidor. O acervo e a circulação precisam de
          conexão com a internet. Reconecte-se e tente novamente.
        </p>
      </Card>
    </main>
  );
}
