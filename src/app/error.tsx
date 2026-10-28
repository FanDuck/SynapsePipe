"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Workspace interrupted
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">工作台遇到了一点阻力</h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        {error.message || "发生未知错误。你的本地数据仍然安全。"}
      </p>
      <Button className="mt-6" onClick={reset} variant="brand">
        <RotateCcw />
        重新载入模块
      </Button>
    </div>
  );
}
