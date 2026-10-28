"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { SidebarContent } from "@/components/layout/sidebar-content";
import { Topbar } from "@/components/layout/topbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SearchPrompt, ShellData } from "@/lib/types";

export function AppShell({
  shell,
  prompts,
  children,
}: {
  shell: ShellData;
  prompts: SearchPrompt[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-dvh">
      <div className="app-aurora" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] grid-bg opacity-60" aria-hidden="true" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-border/70 bg-background/55 backdrop-blur-2xl lg:flex">
        <SidebarContent shell={shell} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[282px] border-r-border/70 bg-background/95 p-0 sm:max-w-[282px]">
          <SheetTitle className="sr-only">SynapsePipe 导航</SheetTitle>
          <SheetDescription className="sr-only">工作台主要模块导航</SheetDescription>
          <SidebarContent shell={shell} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="relative z-10 lg:pl-[248px]">
        <Topbar prompts={prompts} onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1560px] px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-7">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
