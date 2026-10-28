# Third-Party Notices & Upstream Credits

SynapsePipe is built on the shoulders of excellent open-source software. This file records the direct dependencies and design resources used by the project, their licenses, and their upstream sources.

> This inventory is provided for transparency and attribution. It does not replace the full license text shipped with each dependency. If there is any conflict between this summary and an upstream license, the upstream license controls.

## Runtime & application dependencies

| Project | Version | Role in SynapsePipe | License | Upstream |
| --- | --- | --- | --- | --- |
| [Next.js](https://nextjs.org/) | 15.5.28 | App Router, RSC, Server Actions, Route Handlers | MIT | https://github.com/vercel/next.js |
| [React](https://react.dev/) | 19.1.0 | UI runtime | MIT | https://github.com/facebook/react |
| [React DOM](https://react.dev/) | 19.1.0 | Web renderer | MIT | https://github.com/facebook/react |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | Type system and compiler | Apache-2.0 | https://github.com/microsoft/TypeScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.3.3 | Utility-first styling, design tokens | MIT | https://github.com/tailwindlabs/tailwindcss |
| [shadcn/ui](https://ui.shadcn.com/) | source-based | Component architecture and primitives | MIT | https://github.com/shadcn-ui/ui |
| [Radix UI](https://www.radix-ui.com/) | 1.x–2.x | Accessible headless primitives | MIT | https://github.com/radix-ui/primitives |
| [Lucide](https://lucide.dev/) | 1.63.0 | Icon system | ISC | https://github.com/lucide-icons/lucide |
| [SQLite](https://sqlite.org/) | via better-sqlite3 | Embedded relational database | Public Domain | https://sqlite.org/copyright.html |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 13.0.3 | Synchronous SQLite driver | MIT | https://github.com/WiseLibs/better-sqlite3 |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.45.4 | Typed SQL schema and query layer | Apache-2.0 | https://github.com/drizzle-team/drizzle-orm |
| [Framer Motion](https://www.framer.com/motion/) | 14.7.1 | Micro-interactions and transitions | MIT | https://github.com/motiondivision/motion |
| [Sonner](https://sonner.emilkowal.ski/) | 2.0.8 | Toast notifications | MIT | https://github.com/emilkowalski/sonner |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Dark/light theme management | MIT | https://github.com/pacocoursey/next-themes |
| [Zod](https://zod.dev/) | 4.6.7 | Runtime input validation | MIT | https://github.com/colinhacks/zod |
| [class-variance-authority](https://cva.style/) | 0.7.1 | Component variant contracts | Apache-2.0 | https://github.com/joe-bell/cva |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.7.0 | Conflict-free class composition | MIT | https://github.com/dcastil/tailwind-merge |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Conditional class names | MIT | https://github.com/lukeed/clsx |
| [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | 1.4.0 | Tailwind v4 animation utilities | MIT | https://github.com/Wombosvideo/tw-animate-css |
| [Geist](https://vercel.com/font) | 1.8.2 | Interface typeface | SIL Open Font License 1.1 | https://github.com/vercel/geist-font |

## Development & build tooling

| Project | Role | License | Upstream |
| --- | --- | --- | --- |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Schema generation and studio | MIT | https://github.com/drizzle-team/drizzle-kit-mirror |
| [ESLint](https://eslint.org/) | Static analysis | MIT | https://github.com/eslint/eslint |
| [eslint-config-next](https://nextjs.org/docs/app/building-your-application/configuring/eslint) | Next.js lint rules | MIT | https://github.com/vercel/next.js |
| [@tailwindcss/postcss](https://tailwindcss.com/) | Tailwind v4 PostCSS integration | MIT | https://github.com/tailwindlabs/tailwindcss |
| [PostCSS](https://postcss.org/) | CSS transformation | MIT | https://github.com/postcss/postcss |

## Design, documentation & assets

- **Design language**: SynapsePipe's visual direction is inspired by the craft of Linear, Raycast, and Vercel. No proprietary source code, brand assets, or copyrighted UI screenshots were copied. SynapsePipe is not affiliated with or endorsed by these companies.
- **Demo artwork**: The eight SVG artworks under `public/demo/` were authored specifically for this repository and are distributed with the project under the MIT License.
- **Screenshots**: `docs/screenshots/*.webp` were captured from the running application by the project maintainers.
- **Fonts**: Geist is distributed under the SIL Open Font License 1.1; its license file is included in the `geist` package.
- **Provider names**: Midjourney, FLUX, OpenAI, DeepSeek, OpenRouter, Runway, Kling, Sora, Veo, Ollama, LM Studio, SiliconFlow, and other model/provider names are trademarks or registered trademarks of their respective owners. Their use here is descriptive only and does not imply affiliation or endorsement.

## Full dependency license texts

When you install SynapsePipe, npm downloads each dependency's package together with its license file. The authoritative license for each package is the one shipped in that package or published by its upstream project. The direct dependency versions above correspond to the versions resolved in `package-lock.json` at the time of release.

If you believe a credit is missing or incorrect, please open an issue so we can correct it promptly.
