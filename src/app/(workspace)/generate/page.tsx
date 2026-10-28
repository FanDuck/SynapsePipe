import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig, WandSparkles } from "lucide-react";

import { PromptStudio } from "@/components/generate/prompt-studio";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { isLocalEndpoint } from "@/lib/ai";
import { getSettingsView } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "AI Prompt 扩写台",
  description: "把一句话灵感扩写为大师级中英双语 Prompt、镜头参数与分镜建议。",
};

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = getSettingsView();
  const configured = view.hasApiKey || isLocalEndpoint(view.llmBaseUrl);
  const initialIdea = typeof params.idea === "string" ? params.idea : "";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio · model agnostic"
        title={
          <>
            灵感，到 <span className="text-gradient">大师级 Prompt</span>
          </>
        }
        description="写下画面或情绪，Craft 会补齐主体、镜头、布光、材质与分镜参数。使用你自己配置的 OpenAI 兼容模型服务，密钥加密存储在本机。"
        icon={WandSparkles}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/prompts">
                <LibraryBig />
                Prompt 库
              </Link>
            </Button>
          </>
        }
      />
      <PromptStudio
        initialIdea={initialIdea}
        provider={{
          baseUrl: view.llmBaseUrl,
          model: view.llmModel,
          hasApiKey: view.hasApiKey,
          configured,
          defaultNegativePrompt: view.defaultNegativePrompt,
          defaultLanguage: view.defaultLanguage,
        }}
      />
      <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-border/60 bg-card/25 px-4 py-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center">
        <span className="flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-emerald-500" />
          当前服务：<span className="font-mono text-foreground/70">{view.llmBaseUrl}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono">{view.llmModel}</span>
        </span>
        <span>Prompt 由模型生成，请在入库前自行检查与微调。</span>
      </div>
    </div>
  );
}
