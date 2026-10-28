import { formatRelativeTime } from "@/lib/utils";

export function RelativeTime({
  value,
  className,
  prefix,
  suffix,
}: {
  value: Date | string | number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className={className} suppressHydrationWarning>
      {prefix}
      {formatRelativeTime(value)}
      {suffix}
    </span>
  );
}
