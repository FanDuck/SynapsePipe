import { AppShell } from "@/components/layout/app-shell";
import { getSearchCatalog, getShellData } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = getShellData();
  const prompts = getSearchCatalog();

  return (
    <AppShell shell={shell} prompts={prompts}>
      {children}
    </AppShell>
  );
}
