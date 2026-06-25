import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-accent bg-accent text-white hover:bg-[#7181f4] hover:border-[#7181f4] shadow-[0_10px_30px_rgba(124,140,255,0.28)]",
        secondary:
          "border-border-strong bg-surface-2 text-foreground hover:border-accent/45 hover:bg-surface-3",
        ghost: "border-transparent text-muted hover:text-foreground hover:bg-surface-2",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";
