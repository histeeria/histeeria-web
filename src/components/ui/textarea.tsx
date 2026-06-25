import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="space-y-2.5">
        {label ? (
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-32 w-full resize-y rounded-lg border border-border-strong bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/70 focus:bg-surface-3 focus:ring-2 focus:ring-accent-soft",
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
Textarea.displayName = "Textarea";
