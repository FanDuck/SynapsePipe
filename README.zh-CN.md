<p align="center">
  <img src="./public/logo.svg" width="92" alt="SynapsePipe logo" />
</p>

<h1 align="center">SynapsePipe</h1>

<p align="center">
  <strong>Next-gen Local-first AIGC Workbench &amp; Creative Pipeline</strong><br/>
  <sub>本地优先的 AIGC 创意工作台与资产管理管线</sub>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white" /></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" /></a>
  <a href="https://orm.drizzle.team/"><img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=111" /></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-8B5CF6?style=flat-square" /></a>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="#-快速开始">快速开始</a> ·
  <a href="#-架构">架构</a> ·
  <a href="#-功能">功能</a> ·
  <a href="#-docker">Docker</a> ·
  <a href="#license-policy">开源协议</a> ·
  <a href="#acknowledgements">鸣谢</a>
</p>

---

![SynapsePipe 总览](./docs/screenshots/dashboard.webp)

## 为什么是 SynapsePipe？

大多数 AIGC 工作流是断裂的：Prompt 留在聊天记录里，Seed 留在截图里，成片留在下载文件夹里。SynapsePipe 用一个本地优先的工作台把这条链路接起来：

- **结构化沉淀**：Prompt 不只是一段文本，还包含中英双语、风格、镜头语言、目标模型、画幅比例、负向词、可复用 `[变量]` 与导演阐述。
- **可复现的资产**：每件资产记录 Prompt 快照、Seed、模型、生成参数、分类与标签，让“重新出片”变成有据可依的操作。
- **数据属于你**：SQLite 与上传媒体都在 `data/`，API Key 使用 AES-256-GCM 加密。无账号、无遥测、无云端后端。
- **克制的速度感**：Server Components + Server Actions、乐观交互、防抖搜索、精确骨架屏、媒体模糊占位与 Framer Motion 微动效。

## 功能

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>◈ 结构化 Prompt 创意库</h3>
      <p>列表 / 看板双视图，按风格、模型、镜头语言、工作流阶段、收藏与标签筛选。支持中英双语、一键复制、变量填充（如 <code>[主体] in [场景]</code>）。</p>
    </td>
    <td width="50%" valign="top">
      <h3>✦ AI Prompt 魔法扩写台</h3>
      <p>一句话灵感 → 大师级中英双语 Prompt + 负向词 + 分镜参数 + 变量 + 导演建议。兼容 DeepSeek、OpenAI、OpenRouter、Ollama、LM Studio 等 OpenAI 格式服务。</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>▣ 可追溯资产画廊</h3>
      <p>支持本地图片 / 视频上传与外部 URL 引用。每件资产关联 Prompt 快照、Seed、模型与参数；支持收藏、分类筛选、详情预览、下载导出与一键复制生成配方。</p>
    </td>
    <td width="50%" valign="top">
      <h3>⌘ 高级 SaaS 级界面</h3>
      <p>深色优先的中性色系统、微边框、磨砂玻璃、紧凑排版、命令面板、深浅主题、响应式导航与 Sonner 轻提示。所有加载态都有对齐的骨架屏。</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>⛁ 数据路径完全可控</h3>
      <p><code>data/synapsepipe.db</code> 单文件存储，媒体位于 <code>data/uploads/</code>，加密盐位于 <code>data/.secret</code>。复制整个文件夹即可完整备份，也可在设置中导出元数据 JSON。</p>
    </td>
    <td width="50%" valign="top">
      <h3>⬡ 单进程，零额外服务</h3>
      <p>后端逻辑全部通过 Next.js Server Actions 与 Route Handlers 完成，不需要独立 Python / Go / Express 服务。附带多阶段构建 Docker 镜像。</p>
    </td>
  </tr>
</table>

## 界面预览

| Prompt 库 | AI 扩写台 |
| --- | --- |
| ![Prompt 库](./docs/screenshots/prompts.webp) | ![AI 扩写台](./docs/screenshots/studio.webp) |

| 资产画廊 | 设置 |
| --- | --- |
| ![资产画廊](./docs/screenshots/gallery.webp) | ![设置](./docs/screenshots/settings.webp) |

| 命令面板 | 看板视图 |
| --- | --- |
| ![命令面板](./docs/screenshots/command-palette.webp) | ![看板视图](./docs/screenshots/prompt-board.webp) |

<p align="center">
  <img src="./docs/screenshots/light.webp" width="49%" alt="SynapsePipe 浅色主题" />
  <img src="./docs/screenshots/mobile.webp" width="24%" alt="SynapsePipe 移动端" />
</p>

## 快速开始

**环境要求**：Node.js **20.11+**（推荐 22 LTS）、npm 10+。

```bash
git clone https://github.com/FanDuck/SynapsePipe.git
cd SynapsePipe
npm install
cp .env.example .env.local   # 可选：所有变量都有本地默认值
npm run dev
```

打开 **http://localhost:3000**。

首次启动会自动创建 `data/synapsepipe.db`、初始化表结构并写入演示内容（9 条 Prompt + 8 件离线演示资产）。删除 `data/` 即可重置；设置 `SYNAPSE_DISABLE_DEMO_SEED=1` 可跳过演示数据。

### 连接模型服务

1. 进入 **设置 → 模型服务**；
2. 选择预设，或填入任意兼容 OpenAI 的 **Base URL** 与 **模型名称**；
3. 填入 **API Key**（本地 Ollama / LM Studio 可留空），点击 **保存设置**；
4. 点击 **测试连接**，然后去 **AI 扩写台** 把灵感编译成 Prompt。

| 服务 | Base URL | 模型示例 |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4.1-mini` |
| OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4.1-mini` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| Ollama | `http://localhost:11434/v1` | `qwen2.5:7b` |
| LM Studio | `http://localhost:1234/v1` | 当前加载的模型 |

> 请求会发往 `/chat/completions`。支持 JSON mode 时自动启用，不支持时自动降级重试。

## Docker

```bash
docker compose up -d
# → http://localhost:3000
```

常用命令：

```bash
docker compose logs -f
docker compose down            # 保留数据
docker compose down -v         # 删除数据卷（危险）
```

可在 `docker-compose.yml` 同级 `.env` 中覆盖端口、加密盐与演示数据开关。SQLite 与上传媒体持久化在 `synapsepipe_data` 数据卷中。

## 架构

```mermaid
flowchart LR
  Browser["浏览器<br/>React 19 · Framer Motion"] --> App["Next.js 15 App Router"]
  App --> RSC["React Server Components"]
  App --> Actions["Server Actions"]
  App --> Routes["Route Handlers"]

  Actions --> Drizzle["Drizzle ORM"]
  Drizzle --> SQLite[("SQLite<br/>data/synapsepipe.db")]

  Routes --> Media["本地媒体<br/>data/uploads/"]
  Routes --> API["下载 / 备份<br/>/api"]

  Actions --> Provider["OpenAI 兼容模型<br/>用户自行配置"]
  Provider --> Actions
```

只有一个 Next.js 进程：浏览器与 App Router 通信，服务端负责 SQLite、文件存储、密钥加密与模型调用。

### 数据模型

| 表 | 用途 | 关键字段 |
| --- | --- | --- |
| `prompts` | 结构化创意配方 | `prompt_zh`、`prompt_en`、`negative_prompt`、`style`、`camera`、`model`、`aspect_ratio`、`stage`、`tags[]`、`variables[]`、`shot_params`、`is_favorite`、`usage_count` |
| `assets` | 生成 / 引用媒体 | `type`、`source`、`url`、`storage_key`、`prompt_id → prompts`、`prompt_snapshot`、`seed`、`model`、`category`、`tags[]`、`params`、`is_favorite` |
| `settings` | 单行本地配置 | `llm_base_url`、`llm_api_key_cipher`、`llm_model`、`default_negative_prompt`、`default_language` |

Drizzle Schema 位于 [`src/lib/db/schema.ts`](./src/lib/db/schema.ts)，启动时幂等建表与填充演示数据位于 [`src/lib/db/index.ts`](./src/lib/db/index.ts)。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `SYNAPSE_DATA_DIR` | `./data` | SQLite 与上传媒体的数据根目录 |
| `SYNAPSE_DB_PATH` | `<data>/synapsepipe.db` | 可选，Drizzle CLI 使用的数据库路径 |
| `SYNAPSE_SECRET` | 自动生成 | 用于加密 API Key；省略时写入 `data/.secret` |
| `SYNAPSE_LLM_BASE_URL` | `https://api.deepseek.com/v1` | 首次启动的模型服务地址 |
| `SYNAPSE_LLM_API_KEY` | 空 | 首次启动的 API Key（立即加密） |
| `SYNAPSE_LLM_MODEL` | `deepseek-chat` | 首次启动的模型名称 |
| `SYNAPSE_DISABLE_DEMO_SEED` | `0` | 设为 `1` 跳过演示内容 |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Metadata / Open Graph 基础地址 |

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | Turbopack 开发服务器 |
| `npm run build` | 生产构建（standalone） |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | 从 Drizzle Schema 生成迁移 |
| `npm run db:studio` | 启动 Drizzle Studio |

## 安全与隐私

- 无账号、无遥测、无云同步，默认面向 `localhost` 单机使用。
- API Key 使用 **AES-256-GCM** 加密，密钥来自 `SYNAPSE_SECRET` 或自动生成的 `data/.secret`；仅在向模型服务发起请求时于服务端解密。
- 上传文件校验 MIME 与扩展名（最大 30MB），存放在非公开目录并通过受控路由读取。
- **没有内置登录鉴权。** 不要把 SynapsePipe 直接暴露到公网；如需外网访问，请放在带认证的反向代理之后，或仅限可信局域网 / VPN。
- 完整备份请复制 `data/` 目录。丢失 `data/.secret` 后需要重新填写 API Key。

安全问题请参阅 [SECURITY.md](./SECURITY.md)。

## 路线图

- [x] Prompt 库 + 列表 / 看板双视图
- [x] 中英双语、变量占位符与一键复制
- [x] OpenAI 兼容 AI 扩写 + 加密配置
- [x] 本地 / URL 资产画廊 + Prompt / Seed 溯源
- [x] 深浅主题、命令面板、响应式 App Shell
- [x] Docker 镜像、Compose、JSON 元数据备份
- [ ] 可拖拽看板与键盘无障碍移动
- [ ] Prompt 版本历史与 Diff 视图
- [ ] 包含媒体的完整 ZIP 备份
- [ ] 视频缩略图与时间线预览
- [ ] 可选的多用户鉴权适配
- [ ] 从 JSON 备份导入
- [ ] 英文 UI 与语言切换

## 参与贡献

欢迎 Issue、想法与 PR。开始前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。提交 PR 前请至少运行：

```bash
npm run lint
npm run typecheck
npm run build
```

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)，例如 `feat:`, `fix:`, `style:`, `docs:`, `chore:`。项目遵循 [Contributor Covenant](./CODE_OF_CONDUCT.md)。

<a id="license-policy"></a>

## 开源协议与衍生开发规范

### 许可证

SynapsePipe 以 **[MIT License](./LICENSE)** 开源。

**Copyright © 2026 FanDuck and SynapsePipe contributors.**

你可以自由使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本，但必须在所有副本或实质性部分中保留原始版权声明与许可声明。软件按 **“原样”** 提供，不附带任何明示或默示担保。完整且具有控制力的许可文本见 [`LICENSE`](./LICENSE)。

### 二次创作、衍生开发、封装分发与商业使用

我们欢迎 Fork、二次开发、翻译、集成与商业部署。但如果你修改、重构、改名、重新封装、分发或托管 SynapsePipe 的衍生版本，必须遵守以下项目规范：

#### 1. 署名与溯源（必须）

你必须在**显著位置**保留并展示原项目身份：

- 你的 **README 顶部**；
- 产品 UI 中的 **关于 / 鸣谢页面**（或同等的可见致谢位置）。

署名内容必须包含：

- 原项目名称 **SynapsePipe**；
- 原仓库链接 **https://github.com/FanDuck/SynapsePipe**；
- 原作者 **FanDuck**；
- 明确说明你的版本是基于原项目的衍生作品。

如果你以托管服务 / SaaS 形式提供衍生版本，还应在产品页脚或关于页添加可见的 **“Powered by SynapsePipe”** 链接。

推荐直接使用的署名模板：

> **本项目基于 FanDuck 的 SynapsePipe** — https://github.com/FanDuck/SynapsePipe
> 遵循 MIT License。本作品为独立衍生版本，未获得原作者背书或隶属关系。

#### 2. 协议继承与原始版权声明

- 在每个衍生分发版本中包含**完整的原始 MIT License 文本**。
- 保留**原始版权声明**（`Copyright © 2026 FanDuck and SynapsePipe contributors`）。
- 清晰标注你修改过的文件与界面，不得将未修改的原始代码错误声明为自己的原创。
- 如果引入第三方代码、素材、字体、模型或数据集，请自行核验其许可证，并保留相应的署名与许可声明。

#### 3. 免责与不背书声明

- **不得**明示或暗示原作者 FanDuck 或 SynapsePipe 项目为你的衍生版本提供背书、赞助、认证或支持。
- **不得**以误导性方式使用 SynapsePipe 名称或 Logo，使他人误以为你的版本是官方版本。
- **不得**将原项目作为你分发版本的商业担保、服务等级承诺、安全认证或合规保证。
- 必须明确说明衍生版本由你独立维护，并由你自行承担责任。

### 商业使用

MIT License 允许商业使用。我们欢迎商业化的衍生作品，但必须同时满足上述署名、协议继承与不背书要求。你需自行负责产品声明、用户协议、隐私政策、安全实践与合规义务。

### 说明与法律边界

本节记录了 SynapsePipe 项目对署名、出处与项目身份的社区规范。它**不减少、不替代、也不额外限制** MIT License 就源代码授予的权利；如出现法律冲突，以 [`LICENSE`](./LICENSE) 中的 MIT 文本为准。SynapsePipe 名称与 Logo 用于识别原项目，不构成任何商标注册或背书授权。如果你不确定某种使用方式是否合适，请先通过 Issue / Discussion 与我们沟通。

<a id="acknowledgements"></a>

## 鸣谢与致敬

SynapsePipe 建立在开源社区的工作之上。我们诚挚感谢以下项目、团队与许可证，让这个工作台成为可能。

| 上游项目 | 在项目中的角色 | 许可证 | 出处 |
| --- | --- | --- | --- |
| [Next.js](https://nextjs.org/) | App Router、RSC、Server Actions、Route Handlers | MIT | [GitHub](https://github.com/vercel/next.js) |
| [React](https://react.dev/) | UI 运行时 | MIT | [GitHub](https://github.com/facebook/react) |
| [TypeScript](https://www.typescriptlang.org/) | 类型系统与编译器 | Apache-2.0 | [GitHub](https://github.com/microsoft/TypeScript) |
| [Tailwind CSS](https://tailwindcss.com/) | 原子化样式与设计令牌 | MIT | [GitHub](https://github.com/tailwindlabs/tailwindcss) |
| [shadcn/ui](https://ui.shadcn.com/) | 组件架构与基础组件 | MIT | [GitHub](https://github.com/shadcn-ui/ui) |
| [Radix UI](https://www.radix-ui.com/) | 无障碍 Headless 基础组件 | MIT | [GitHub](https://github.com/radix-ui/primitives) |
| [Lucide](https://lucide.dev/) | 图标系统 | ISC | [GitHub](https://github.com/lucide-icons/lucide) |
| [SQLite](https://sqlite.org/) | 嵌入式关系型数据库 | Public Domain | [sqlite.org](https://sqlite.org/copyright.html) |
| [Drizzle ORM](https://orm.drizzle.team/) | 类型安全 Schema 与查询层 | Apache-2.0 | [GitHub](https://github.com/drizzle-team/drizzle-orm) |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 同步 SQLite 驱动 | MIT | [GitHub](https://github.com/WiseLibs/better-sqlite3) |
| [Framer Motion](https://www.framer.com/motion/) | 动效与交互系统 | MIT | [GitHub](https://github.com/motiondivision/motion) |
| [Sonner](https://sonner.emilkowal.ski/) | Toast 轻提示 | MIT | [GitHub](https://github.com/emilkowalski/sonner) |
| [Geist](https://vercel.com/font) | 界面字体 | SIL OFL 1.1 | [GitHub](https://github.com/vercel/geist-font) |

更完整的版本、许可证与素材出处清单（包含开发工具、Radix 子包等）请见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

- **演示视觉资产**：`public/demo/` 下的 8 件 SVG 作品为本仓库专门创作。
- **设计启发**：视觉方向参考了 Linear、Raycast 与 Vercel 的工艺感；未复制任何专有代码、品牌素材或 UI 截图。SynapsePipe 与这些公司没有隶属关系。
- **服务与模型名称**：Midjourney、FLUX、OpenAI、DeepSeek、OpenRouter、Runway、Kling、Sora、Veo、Ollama、LM Studio、SiliconFlow 等名称归各自所有者所有，此处仅用于客观描述。

### 引用

如果你在文章、研究笔记、课程或衍生项目中引用 SynapsePipe，建议使用：

```bibtex
@software{synapsepipe2026,
  author  = {FanDuck and SynapsePipe contributors},
  title   = {SynapsePipe: Next-gen Local-first AIGC Workbench},
  year    = {2026},
  version = {1.0.0},
  url     = {https://github.com/FanDuck/SynapsePipe},
  license = {MIT}
}
```

机器可读的引用元数据见 [`CITATION.cff`](./CITATION.cff)。

## 许可证

[MIT](./LICENSE) © 2026 FanDuck and SynapsePipe contributors。

完整的衍生开发规范见上方「开源协议与衍生开发规范」。文中出现的模型与服务名称归各自所有者所有，SynapsePipe 与它们没有隶属关系。

---

<p align="center">
  <sub>如果 SynapsePipe 让你的创作管线更清晰一点，欢迎点一个 Star。</sub>
</p>
