# Contributing to SynapsePipe

Thanks for taking the time to improve SynapsePipe. This project is a local-first AIGC workbench, so changes should preserve three invariants:

1. **One deployable process.** Backend logic stays inside Next.js Server Actions or Route Handlers. Do not add a separate Python/Go/Express service.
2. **Local ownership.** Runtime state belongs in `data/`. Never add a mandatory cloud dependency, telemetry, account system, or hosted database.
3. **Craft.** Loading states, empty states, error states, keyboard access, and dark/light themes are part of the feature — not follow-up work.

## Development setup

```bash
git clone https://github.com/<your-fork>/SynapsePipe.git
cd SynapsePipe
npm install
cp .env.example .env.local
npm run dev
```

Requirements: Node.js 20.11+ (22 LTS recommended). The first launch seeds a demo library and creates `data/synapsepipe.db`.

Useful commands:

```bash
npm run lint
npm run typecheck
npm run build
```

To reset local data during development, stop the server and remove `data/`.

## Project layout

| Path | Responsibility |
| --- | --- |
| `src/app/(workspace)` | Server-rendered pages and shared app shell |
| `src/components/ui` | shadcn/ui primitives (Radix + CVA) |
| `src/components/<domain>` | Feature-level client components |
| `src/lib/actions` | Server Actions and mutation contracts |
| `src/lib/db` | Drizzle schema, bootstrap, seed, query layer |
| `src/lib/ai.ts` | OpenAI-compatible provider client + prompt director |

Keep database access out of client components. Server Actions validate input with Zod and return `ActionResult`; do not throw raw errors at the UI.

## Design conventions

- Use tokens from `globals.css` (`bg-card`, `text-muted-foreground`, `border-border`, `text-brand`) rather than hard-coded colors.
- Use `cn()` for conditional classes.
- Use Lucide icons and the existing shadcn primitives before adding a new dependency.
- New loading surfaces need a skeleton that matches the final layout.
- Avoid layout-shifting animations; prefer opacity / Y transforms and `prefers-reduced-motion` remains respected globally.
- Chinese is the primary product language. English UI localization is on the roadmap.

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(prompts): add variable injector
fix(gallery): preserve uploaded file on metadata error
style(app-shell): tighten sidebar active state
docs: document Docker data volume
chore(deps): bump lucide-react
```

Keep commits scoped and buildable. One logical change per commit is preferred.

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] I tested the affected flow in the browser (dark **and** light theme where relevant)
- [ ] I checked mobile width (390px) for layout regressions
- [ ] New user-facing strings are in Chinese, with English where the product already provides it
- [ ] No API keys, local databases, uploads, or screenshots containing private data are committed
- [ ] I updated docs / `.env.example` when configuration changed

## Reporting bugs

Open an issue with:

- SynapsePipe version / commit
- OS, Node.js version, browser
- Steps to reproduce
- Expected vs. actual behavior
- Console output or screenshots if available

For security issues, do **not** open a public issue — see [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](./LICENSE).
