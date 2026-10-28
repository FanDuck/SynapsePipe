import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient id="brand-mark-bg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset=".52" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="brand-mark-stroke" x1="12" y1="10" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity=".72" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="#09090B" />
      <rect x=".75" y=".75" width="38.5" height="38.5" rx="10.25" fill="url(#brand-mark-bg)" />
      <rect x=".75" y=".75" width="38.5" height="38.5" rx="10.25" stroke="white" strokeOpacity=".25" strokeWidth=".75" />
      <path
        d="M13.5 27V21.2C13.5 17.3 16.6 14.2 20.5 14.2H21C24.9 14.2 28 17.3 28 21.2V24.4C28 28.3 24.9 31.4 21 31.4H20.5C18.3 31.4 16.3 30.5 14.9 29"
        stroke="url(#brand-mark-stroke)"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <circle cx="13.5" cy="27" r="2.8" fill="#0B0B10" stroke="white" strokeWidth="1.6" />
      <circle cx="28" cy="13.5" r="2.3" fill="#22D3EE" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="text-[15px] font-semibold tracking-[-0.025em] text-foreground">
        Synapse<span className="text-brand">Pipe</span>
      </span>
      <span className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.24em] text-muted-foreground/80">
        Local-first AIGC
      </span>
    </div>
  );
}
