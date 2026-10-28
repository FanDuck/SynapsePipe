# Changelog

All notable changes to SynapsePipe are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.1] — 2026-10-28

**Documentation & Compliance Patch** — no application behavior changes.

### Docs & open-source compliance

- Added a full **License & Derivative Works Policy** to both READMEs: attribution/provenance requirements, MIT license inheritance, no-endorsement rules, commercial-use guidance, and derivative distribution expectations.
- Added an **Acknowledgements & Upstream Credits** section with verified licenses for Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Lucide, SQLite, Drizzle ORM, better-sqlite3, Framer Motion, Sonner, and Geist.
- Added [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) with a complete direct-dependency license inventory and asset provenance.
- Added [`CITATION.cff`](./CITATION.cff) for machine-readable citation.
- Reworked [`CONTRIBUTING.md`](./CONTRIBUTING.md) into a Chinese-first, bilingual-heading guide covering PR standards, code style, contributor copyright/originality certification, and derivative-work norms.
- Added open-source compliance checkboxes to the pull request template.
- Clarified the original copyright line in [`LICENSE`](./LICENSE) as `Copyright © 2026 FanDuck and SynapsePipe contributors`.
- Runtime Docker image now includes `LICENSE` and `THIRD_PARTY_NOTICES.md`.
- Updated application/package/citation version metadata to `1.0.1`.

## [1.0.0] — 2026-10-28

The first public release of SynapsePipe: a local-first AIGC workbench.

### Added

- **Prompt Library**
  - List and board views over `idea → crafting → ready` workflow stages
  - Bilingual Chinese/English prompts, negative prompts, camera language, target model, aspect ratio, style, tags, and director notes
  - Debounced search and filtering by style, model, camera, stage, favorites, and tags
  - Structured prompt creation/edit dialog with shot-parameter fields
  - Reusable `[variable]` detection, variable injector, live preview, and one-click copy
  - Favorites, duplicate, usage counters, and delete confirmation

- **AI Prompt Studio**
  - Configurable OpenAI-compatible provider (DeepSeek, OpenAI, OpenRouter, SiliconFlow, Ollama, LM Studio)
  - Inspiration → production-grade bilingual prompt, negative prompt, shot parameters, tags, variables, and director notes
  - JSON mode with graceful fallback for providers that do not support it
  - Style/model/language/creativity controls, examples, and keyboard shortcut
  - Save generated results directly into the Prompt Library

- **Asset Gallery**
  - Local image/video upload (max 30 MB) with MIME validation
  - External URL references with image/video type
  - Prompt association and automatic snapshot capture
  - Seed, model, category, params, tags, and dimensions metadata
  - Masonry-style responsive gallery with progressive blur placeholders
  - Detail preview, favorites, filters, search, download/re-export, recipe copy, and delete
  - Asset download endpoint with local file / remote URL support and Range requests for local uploads

- **Workbench experience**
  - Command palette (`⌘K`) for navigation and prompt search
  - Dark-first design with a complete light theme
  - Responsive app shell with mobile navigation
  - Skeleton-matched loading states, Framer Motion transitions, and Sonner toasts
  - Dashboard with prompt/asset/favorite/usage stats, 7-day activity pulse, workflow health, recent assets, and top prompts

- **Local-first infrastructure**
  - SQLite at `data/synapsepipe.db` with Drizzle ORM
  - Idempotent schema bootstrap and curated demo seed
  - AES-256-GCM encryption for provider API keys
  - JSON metadata backup endpoint
  - Health endpoint
  - Multi-stage Dockerfile and `docker-compose.yml`
  - CI workflow for lint, typecheck, and production build

### Security

- No telemetry, no accounts, no third-party analytics.
- Local-only by default; no built-in auth. See [SECURITY.md](./SECURITY.md).

[1.0.1]: https://github.com/FanDuck/SynapsePipe/releases/tag/v1.0.1
[1.0.0]: https://github.com/FanDuck/SynapsePipe/releases/tag/v1.0.0
