# Padrão Visual — Biblioteca IECG

> Sistema de design "Sala de leitura", validado no mockup e aplicado no projeto.
> Os tokens vivem em [`src/app/globals.css`](../src/app/globals.css) (Tailwind v4 `@theme`);
> os primitivos em [`src/components/ui`](../src/components/ui).

## Direção

Calmo e escolar: papel morno, um único acento **azul-ardásia**, tipografia **serifada (Georgia)**
para títulos e a marca. Cores semânticas (ok/aviso/perigo) são separadas do acento. **Tema claro
único** por ora — a versão dark existe no mockup e fica como evolução futura.

## Paleta (tokens → utilitários Tailwind)

Cada token vira utilitário (`bg-*`, `text-*`, `border-*`).

| Token | Hex | Uso |
|-------|-----|-----|
| `paper` | `#F7F7F4` | Fundo da aplicação |
| `surface` | `#FFFFFF` | Cartões, sidebar, topbar |
| `surface-2` | `#F1F1EC` | Hover, faixas, trilhos |
| `border` | `#EAE9E3` | Bordas |
| `border-strong` | `#DBDAD2` | Borda em hover/ênfase |
| `ink` | `#26251F` | Texto principal |
| `muted` | `#77746A` | Texto secundário |
| `faint` | `#9C998E` | Rótulos, cabeçalhos de tabela |
| `accent` | `#43607F` | Ação primária, ativo |
| `accent-hover` | `#375270` | Hover da ação primária |
| `accent-tint` | `#EAF0F6` | Fundo de item ativo / chip de acento |
| `accent-ink` | `#2E455F` | Texto sobre `accent-tint` |
| `ok` / `ok-tint` | `#3F8F6B` / `#E7F2EC` | Estado positivo (ativo, disponível) |
| `warn` / `warn-tint` | `#B07E2B` / `#F6EEDB` | Atenção (vence hoje) |
| `danger` / `danger-tint` | `#B4544A` / `#F6E7E4` | Erro/negativo (atrasado, excluir) |
| `romance` `historia` `ciencia` `infantil` `poesia` | — | Lombadas por gênero (catálogo, Fase 4) |

## Tipografia

- **Títulos e marca:** `font-serif` (Georgia). Ex.: `font-serif text-2xl font-semibold`.
- **Interface/corpo:** `font-sans` (Geist/sistema).
- **Códigos, tombo:** `font-mono`.
- Rótulos/eyebrows: `text-[0.68rem] uppercase tracking-wider text-faint`.

## Forma

- Cartões: `--radius-card` (14px) → `rounded-card`; sombra `--shadow-card` → `shadow-card`.
- Controles menores: `rounded-lg`.

## Primitivos

- **`<Card>`** (`components/ui/Card.tsx`): `rounded-card border border-border bg-surface shadow-card`.
- **`<Chip tom="accent|ok|warn|danger|neutro">`** (`components/ui/Chip.tsx`): selo de estado/categoria.

## Padrões de componente

- **Item de navegação ativo:** `bg-accent-tint text-accent-ink` (+ `border-accent/20`); inativo:
  `text-muted hover:bg-surface-2 hover:text-ink`.
- **Botão primário:** `bg-accent text-white hover:bg-accent-hover rounded-lg`.
- **Botão secundário:** `border border-border text-muted hover:border-border-strong hover:text-ink`.
- **Tabela:** cabeçalho `text-faint uppercase`; linhas com `border-border`; hover `bg-surface-2`;
  container com `overflow-x-auto` dentro de um `Card`.
- **Campo de formulário:** `border border-border rounded-lg`; foco
  `focus:border-accent focus:ring-2 focus:ring-accent/20`.
- **Alertas:** erro `bg-danger-tint text-danger`; sucesso/positivo via `ok`.

## Responsividade

Mobile-first. Sidebar vira **drawer** (< `md`) com scrim; tabelas em `overflow-x-auto`. O shell fica
em `components/shell` (`AppShell`, `Sidebar`, `Topbar`).

## Como aplicar (resumo para novas telas)

1. Página com padding `p-4 md:p-6` e título `font-serif`.
2. Conteúdo em `<Card>`.
3. Estados com `<Chip>`; ações primárias com `bg-accent`.
4. Esconder ações por permissão com `<Can code="...">`.
5. Cores sempre via tokens (nunca hex solto nem paleta padrão do Tailwind).
