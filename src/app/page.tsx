import { Brand } from "@/components/Brand";

const prontos = [
  "Next.js + Tailwind",
  "Ambiente 100% em Docker",
  "Supabase (local via CLI)",
  "Testes: Vitest · Playwright · pgTAP",
  "Integração contínua no GitHub Actions",
];

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-6 py-16 text-ink">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-10 shadow-sm">
        <Brand />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">
          Fundação pronta
        </h1>
        <p className="mt-2 text-muted">
          Base da reconstrução (v2) do sistema de gestão da biblioteca. As telas
          seguem o mockup validado e o desenvolvimento é test-first.
        </p>
        <ul className="mt-6 flex flex-col gap-2">
          {prontos.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/10 text-accent">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
