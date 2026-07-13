import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-black/5 dark:bg-white/10 text-ink hover:bg-black/10 dark:hover:bg-white/20",
        wheat: "bg-wheat-100 text-wheat-600",
        soil: "bg-soil-100 text-soil-600",
        danger: "bg-danger-bg text-danger",
        info: "bg-sky-500/10 text-sky-500",
        success: "bg-success-bg text-success",
        neutral: "bg-paper-sunken text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
