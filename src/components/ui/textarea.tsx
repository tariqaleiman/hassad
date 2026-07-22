import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full rounded-xl border border-border/80 bg-paper-raised px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none transition-all shadow-sm focus:border-crop-600 focus:ring-4 focus:ring-crop-600/20 disabled:cursor-not-allowed disabled:bg-paper-sunken/50 disabled:opacity-70 hover:border-border",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
