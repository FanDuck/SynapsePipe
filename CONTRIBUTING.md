# 贡献指南 · Contributing to SynapsePipe

> **中文为主，关键流程附英文标题。**
> 本指南适用于代码、文档、设计、演示素材与翻译贡献。提交 PR 即表示你已阅读并同意本指南、[行为准则](./CODE_OF_CONDUCT.md) 与 [开源协议与衍生开发规范](./README.zh-CN.md#license-policy)。

感谢你愿意花时间改进 **SynapsePipe**。这是一个本地优先的 AIGC 创意工作台，因此所有贡献都应坚持三条不变量：

1. **单进程可部署**：后端逻辑只通过 Next.js Server Actions 或 Route Handlers 实现，不引入独立的 Python / Go / Express 服务。
2. **数据归属用户**：运行时数据只能落在 `data/` 或用户明确配置的位置；不得引入遥测、强制云端账号、强制托管数据库或静默上报。
3. **体验即功能**：加载态、空态、错误态、键盘可达性、深浅主题与移动端适配属于功能的一部分，不是后续补丁。

## 1. 行为准则 / Code of Conduct

参与本项目即表示你同意遵守 [Contributor Covenant](./CODE_OF_CONDUCT.md)。请保持专业、友善、可协作的讨论方式；技术分歧应围绕代码、用户体验与可验证证据展开。

## 2. 开发环境 / Development Setup

```bash
git clone https://github.com/<your-fork>/SynapsePipe.git
cd SynapsePipe
npm install
cp .env.example .env.local
npm run dev
```

要求：Node.js **20.11+**（推荐 22 LTS）。首次启动会自动创建 `data/synapsepipe.db` 并填充演示数据。要重置本地数据，停止服务后删除 `data/`。

提交 PR 前至少运行：

```bash
npm run lint
npm run typecheck
npm run build
```

## 3. 代码与设计规范 / Code & Design Standards

### 3.1 架构边界

| 路径 | 职责 |
| --- | --- |
| `src/app/(workspace)` | 服务端页面与共享 App Shell |
| `src/app/api` | Route Handlers：下载、上传、备份、健康检查 |
| `src/components/ui` | shadcn/ui 基础组件（Radix + CVA） |
| `src/components/<domain>` | 业务级客户端组件 |
| `src/lib/actions` | Server Actions 与写入契约 |
| `src/lib/db` | Drizzle Schema、启动引导、seed、查询层 |
| `src/lib/ai.ts` | OpenAI 兼容客户端与 Prompt Director |

- 客户端组件不得直接访问数据库。
- Server Actions 必须使用 Zod 校验输入，并返回统一的 `ActionResult`；不要把原始异常直接抛给 UI。
- 任何外部 URL、上传文件、模型返回内容都视为不可信输入。
- 新增依赖前请先确认它解决的问题、许可证与维护状态，并在 PR 中说明。

### 3.2 TypeScript 与状态

- 保持 `strict` 类型安全；避免 `any`，优先使用明确的领域类型或 Zod 推导类型。
- 日期、金额、计数等展示值要避免服务端/客户端 hydration 不一致；相对时间使用项目提供的 `RelativeTime` 组件或 `suppressHydrationWarning`。
- 不要为了“看起来快”而牺牲错误处理：Server Action 失败必须给出可理解的 Toast / 内联错误。
- 数据变更后通过 `revalidatePath` 或本地乐观更新保持一致；复杂交互应回滚失败状态。

### 3.3 UI / 视觉规范

- 使用 `globals.css` 中的设计令牌：`bg-card`、`text-muted-foreground`、`border-border`、`text-brand` 等，不要硬编码颜色。
- 条件样式统一使用 `cn()`。
- 优先使用已有的 shadcn/ui 组件与 Lucide 图标，避免重复造轮子。
- 所有新的加载界面必须提供与最终布局对齐的 Skeleton；禁止白屏闪烁。
- 动画以 150–300ms 的 opacity / translate 为主，避免引发布局抖动；必须兼容 `prefers-reduced-motion`。
- 中文是产品主语言；新增用户可见文案需符合现有语气与信息密度。
- 桌面端与 **390px** 移动端都要检查；深浅主题至少各验证一次关键路径。

## 4. PR 提交标准 / Pull Request Standards

一个高质量的 PR 应满足：

- **单一目的**：一个 PR 解决一个问题；重构与行为变更尽量拆开。
- **可构建**：lint、typecheck、build 通过。
- **可验证**：在 PR 中说明复现步骤、验证命令、测试环境；UI 变更附深色/浅色截图或录屏。
- **向后兼容**：数据库 Schema / 环境变量 / API 行为变更必须说明迁移方式。
- **无敏感数据**：不得提交 API Key、`data/` 数据库、用户上传文件、私有 Prompt、个人信息或含密钥的截图。
- **文档同步**：修改配置、运行方式或用户可见行为时，同步更新 README、`.env.example` 或相关文档。

PR 模板中的开源合规确认框必须逐项勾选；未做版权/原创确认的 PR 将暂缓合并。

## 5. 提交信息规范 / Commit Convention

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
feat(prompts): add variable injector
fix(gallery): preserve uploaded file on metadata error
style(app-shell): tighten sidebar active state
docs: clarify derivative work attribution
chore(deps): bump lucide-react
```

保持每个提交可构建、可回滚。建议一个逻辑变更对应一个提交，不要在一个提交里混入无关格式化。

## 6. 贡献者版权与原创承诺 / Contributor Certification

提交 Pull Request、补丁或素材时，你声明并保证：

1. **原创或已获授权**：你创作的代码、文档、设计、图标、演示素材、Prompt 示例等内容为原创，或你已获得权利人的明确授权，可以在本项目中以 MIT License 分发。
2. **许可兼容**：你提交的内容不包含与 MIT License 不兼容的第三方代码、字体、图像、模型权重、数据集或其他素材；如包含第三方内容，你必须在 PR 描述与 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) 中准确标注来源、许可证与必要署名。
3. **入站 = 出站**：你同意你的贡献按本项目的 [MIT License](./LICENSE) 授权；你保留自己贡献的著作权，但授予项目维护者及下游用户 MIT 许可所允许的使用权利。
4. **不删除声明**：你不得删除、隐藏或弱化原项目的版权声明、许可证文本、署名、来源链接或 NOTICE 声明。
5. **无冒用与无虚假背书**：你不得在贡献中冒用他人身份、伪造出处，或暗示原作者 / 原项目为你的衍生版本提供背书、担保或官方认证。
6. **合规责任**：如你的贡献涉及数据、模型服务、第三方 API 或商业内容，你自行负责取得必要权限并遵守适用法律与服务条款。

如果你无法作出上述承诺，请不要提交该部分内容；可以先开 Issue 讨论替代方案。

### English summary of the contributor certification

By submitting a pull request or patch, you certify that you authored the contribution or have the rights to submit it, that it can be distributed under the project's MIT License, and that any third-party code, assets, fonts, models, or datasets are properly licensed and attributed. You agree not to remove copyright/license notices or misrepresent the origin of the work. Contributions are accepted under the project's [MIT License](./LICENSE).

## 7. 二创、Fork 与衍生项目 / Forks & Derivative Projects

- Fork 与二次开发是被欢迎的；公开衍生版本时，请遵守 [README 中的开源协议与衍生开发规范](./README.zh-CN.md#license-policy)。
- 衍生项目必须在 README 顶部与产品 About / 鸣谢页保留 SynapsePipe 名称、原仓库链接与原作者 FanDuck。
- 衍生分发必须附带完整 MIT License 文本与原始版权声明。
- 不要把衍生版本包装成官方版本，也不要暗示原作者提供商业担保或背书。
- 如果你修复的是通用问题，优先把补丁回馈到上游 PR；这比长期维护私有分支更可持续。

## 8. 安全与隐私 / Security & Privacy

- 发现安全漏洞时，**不要**公开提交 Issue；请通过 [SECURITY.md](./SECURITY.md) 中的私密渠道报告。
- 不要在日志、错误消息、截图或测试数据中暴露 API Key、本地路径中的个人信息或用户 Prompt。
- 处理上传文件、外部 URL 与模型输出时，保持与现有实现一致的服务端校验与大小限制。

## 9. 引用与出处 / Citation & Credits

- 如果你的文章、研究或衍生项目引用 SynapsePipe，请使用 [`CITATION.cff`](./CITATION.cff) 或 README 中的 BibTeX。
- 新增依赖或第三方素材时，同步更新 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。
- 项目会定期核对上游许可证变化；发现遗漏请及时提交 Issue 或 PR。

## 10. 许可证 / License

本项目以 [MIT License](./LICENSE) 开源，版权声明为 **Copyright © 2026 FanDuck and SynapsePipe contributors**。
提交贡献即表示你同意本指南与上述许可安排。
