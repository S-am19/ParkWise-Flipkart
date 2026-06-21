import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const bounded = Math.min(Math.max(value, 0), 1);

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-800", className)}>
      <div
        className={cn("h-full rounded-full bg-cyan-300 transition-all", indicatorClassName)}
        style={{ width: `${bounded * 100}%` }}
      />
    </div>
  );
}
