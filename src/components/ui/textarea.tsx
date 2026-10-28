import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-input bg-white/[0.015] px-3 py-2.5 text-sm leading-relaxed text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/70 focus-visible:border-brand/50 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.025]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
