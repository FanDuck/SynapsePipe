import type { Metadata } from "next";
import { Settings2 } from "lucide-react";

import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { getSettingsView } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "设置",
  description: "配置 OpenAI 兼容模型服务、创作默认值、主题与本地数据管理。",
};

export default async function SettingsPage() {
  const view = getSettingsView();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control room · private by default"
        title={
          <>
            工作台 <span className="text-gradient">设置</span>
          </>
        }
        description="连接你自己的模型服务，调整创作默认值，管理本地数据与外观。所有敏感信息仅保存在这台设备上。"
        icon={Settings2}
      />
      <SettingsWorkspace view={view} />
    </div>
  );
}
