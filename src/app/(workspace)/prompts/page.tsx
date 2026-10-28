import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig, WandSparkles } from "lucide-react";

import { PromptWorkspace } from "@/components/prompts/prompt-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getPrompts } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Prompt 创意库",
  description: "结构化 Prompt 库：列表与看板双视图、风格筛选、变量替换与一键复制。",
};

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const prompts = getPrompts();
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialCreate = params.new === "1";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library · synced locally"
        title={
          <>
            你的 <span className="text-gradient">Prompt 创意库</span>
          </>
        }
        description="把可复用的视觉配方结构化：双语 Prompt、镜头语言、变量与模型参数，一次沉淀，随时取用。"
        icon={LibraryBig}
        actions={
          <Button asChild variant="brand" size="sm">
            <Link href="/generate">
              <WandSparkles />
              AI 扩写
            </Link>
          </Button>
        }
      />
      <PromptWorkspace
        prompts={prompts}
        initialQuery={initialQuery}
        initialCreate={initialCreate}
      />
    </div>
  );
}
