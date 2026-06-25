import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-2.5">
        {label ? (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-border-strong bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/70 focus:bg-surface-3 focus:ring-2 focus:ring-accent-soft",
            error && "border-danger/80 focus:border-danger/80 focus:ring-danger-soft",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
    );
  },
);
Input.displayName = "Input";
