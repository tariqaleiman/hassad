import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-crop-500 text-white shadow-md shadow-crop-500/20 hover:bg-crop-600 hover:shadow-lg hover:shadow-crop-600/30",
        secondary: "bg-paper-sunken text-ink hover:bg-black/5 dark:hover:bg-white/10 shadow-sm hover:shadow-md",
        outline: "border border-border bg-transparent text-ink hover:bg-black/5 dark:hover:bg-white/10",
        ghost: "text-ink hover:bg-black/5 dark:hover:bg-white/10",
        danger: "bg-danger text-white shadow-md shadow-danger/20 hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/30",
        wheat: "bg-wheat-500 text-ink shadow-md shadow-wheat-500/20 hover:bg-wheat-600 hover:shadow-lg hover:shadow-wheat-600/30",
        link: "text-sky-500 underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
