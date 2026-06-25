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
      <div className="space-y-2">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-32 w-full resize-y rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20",
            error && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
