import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon ? (
          <div className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 text-brand shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] sm:flex">
            <Icon className="size-[18px]" />
          </div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="size-1 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-[26px] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[30px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
