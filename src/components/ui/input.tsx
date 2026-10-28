import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-input bg-white/[0.015] px-3 py-1 text-sm text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/70 focus-visible:border-brand/50 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.025]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
