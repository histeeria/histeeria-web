import { cn } from "@/lib/utils";

const steps = ["Workspace", "Domain", "Describe"];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/75 px-4 py-3">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === currentStep;
        const completed = stepNumber < currentStep;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                  active && "border-accent bg-accent-soft text-accent",
                  completed && "border-accent/40 bg-accent text-white",
                  !active && !completed && "border-border-strong text-muted",
                )}
              >
                {completed ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  active ? "font-medium text-foreground" : "text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "hidden h-px w-10 sm:block",
                  completed ? "bg-accent/50" : "bg-border-strong",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
