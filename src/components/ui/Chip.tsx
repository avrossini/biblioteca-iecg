const TONS = {
  accent: "bg-accent-tint text-accent-ink",
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  danger: "bg-danger-tint text-danger",
  neutro: "bg-surface-2 text-muted",
} as const;

export type ChipTom = keyof typeof TONS;

/** Selo compacto para estado/categoria (situação, grupos, etc.). */
export function Chip({
  tom = "neutro",
  children,
}: {
  tom?: ChipTom;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONS[tom]}`}
    >
      {children}
    </span>
  );
}
