import { cn } from "@/lib/utils";

export function TagPill({
  children,
  className,
  muted = false,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-4 tracking-tight",
        muted
          ? "border-transparent bg-foreground/[0.045] text-muted-foreground"
          : "border-border bg-background/40 text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className={cn("relative flex size-1.5", className)}>
      {pulse ? (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
      ) : null}
      <span className="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
  );
}
