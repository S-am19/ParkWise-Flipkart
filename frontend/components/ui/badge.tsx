import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  default: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  info: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
