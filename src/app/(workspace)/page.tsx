import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { isLocalEndpoint } from "@/lib/ai";
import { getDashboardStats, getSettingsView } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "总览",
  description: "SynapsePipe 本地优先 AIGC 工作台：Prompt 库、AI 扩写与资产画廊的状态总览。",
};

export default function DashboardPage() {
  const stats = getDashboardStats();
  const settings = getSettingsView();
  const providerConfigured =
    settings.hasApiKey || isLocalEndpoint(settings.llmBaseUrl);

  return (
    <DashboardView
      stats={stats}
      providerConfigured={providerConfigured}
      providerModel={settings.llmModel}
      providerBaseUrl={settings.llmBaseUrl}
    />
  );
}
