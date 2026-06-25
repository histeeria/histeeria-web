import { cn } from "@/lib/utils";

const steps = ["Workspace", "Domain", "Describe"];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === currentStep;
        const completed = stepNumber < currentStep;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition",
                  active && "border-gold bg-gold-soft text-gold",
                  completed && "border-gold/40 bg-gold text-black",
                  !active && !completed && "border-border text-muted",
                )}
              >
                {completed ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  active ? "text-foreground" : "text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "hidden h-px w-10 sm:block",
                  completed ? "bg-gold/50" : "bg-border",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
