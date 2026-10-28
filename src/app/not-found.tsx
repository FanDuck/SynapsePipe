import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { BrandMark } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="app-aurora" aria-hidden="true" />
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative z-10 max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandMark className="size-14" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand">
          404 / Signal lost
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">这个节点不存在</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
          你访问的页面可能已移动，或尚未连接到 SynapsePipe 的创意管线。
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft />
              返回总览
            </Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/prompts">
              <Compass />
              浏览 Prompt 库
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
