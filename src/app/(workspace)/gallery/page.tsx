import type { Metadata } from "next";
import Link from "next/link";
import { Images, WandSparkles } from "lucide-react";

import { AssetGallery } from "@/components/gallery/asset-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getAssets, getPromptCatalog } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "资产画廊",
  description: "AIGC 图像与视频资产库，记录 Prompt、Seed、模型参数，支持本地归档、筛选与导出。",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const assets = getAssets();
  const prompts = getPromptCatalog();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gallery · indexed locally"
        title={
          <>
            可追溯的 <span className="text-gradient">资产画廊</span>
          </>
        }
        description="每一次生成都留下配方：Prompt 快照、Seed、模型与参数。收藏、筛选、下载，或沿线索回到原始 Prompt。"
        icon={Images}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/generate">
              <WandSparkles />
              生成新资产
            </Link>
          </Button>
        }
      />
      <AssetGallery assets={assets} prompts={prompts} initialUpload={params.upload === "1"} />
    </div>
  );
}
