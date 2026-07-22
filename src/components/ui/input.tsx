import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-paper-raised px-4 text-sm text-ink transition-all shadow-sm focus:outline-none focus:border-crop-600 focus:ring-4 focus:ring-crop-600/20 disabled:cursor-not-allowed disabled:bg-paper-sunken/50 disabled:opacity-70 placeholder:text-ink-faint hover:border-border",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium px-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
