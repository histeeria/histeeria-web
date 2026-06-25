"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { ApiKeyReveal } from "@/components/onboarding/api-key-reveal";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding, DOMAINS, type OnboardingPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = OnboardingPayload;

const initialForm: FormState = {
  workspace_name: "",
  agent_name: "",
  domain_name: "",
  agent_description: "",
};

export function OnboardingFlow() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const workspacePlaceholder = useMemo(() => {
    const firstName = session?.user?.name?.split(" ")[0] ?? "My";
    return `${firstName}'s Workspace`;
  }, [session?.user?.name]);

  const selectedDomain = useMemo(
    () => DOMAINS.find((domain) => domain.value === form.domain_name),
    [form.domain_name],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (currentStep === 1) {
      const workspaceName = form.workspace_name.trim() || workspacePlaceholder;
      if (workspaceName.length < 2) {
        nextErrors.workspace_name = "Workspace name must be at least 2 characters.";
      }
      if (form.agent_name.trim().length < 2) {
        nextErrors.agent_name = "Agent name must be at least 2 characters.";
      }
    }

    if (currentStep === 2 && !form.domain_name) {
      nextErrors.domain_name = "Select a domain for your agent.";
    }

    if (currentStep === 3 && form.agent_description.trim().length < 10) {
      nextErrors.agent_description = "Describe your agent in at least 10 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const tokenResponse = await fetch("/api/session-token");
      if (!tokenResponse.ok) {
        throw new Error("Unable to authenticate request");
      }
      const { token } = (await tokenResponse.json()) as { token: string };
      const result = await completeOnboarding(token, {
        workspace_name: form.workspace_name.trim() || workspacePlaceholder,
        agent_name: form.agent_name.trim(),
        domain_name: form.domain_name,
        agent_description: form.agent_description.trim(),
      });
      setApiKey(result.api_key);
      await update();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (apiKey) {
    return (
      <ApiKeyReveal
        apiKey={apiKey}
        onContinue={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-4">
        <StepIndicator currentStep={step} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Set up your agent</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Three quick steps to connect Histeeria and start observing judgment.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="panel rounded-2xl p-6 sm:p-8"
        >
          {step === 1 ? (
            <div className="space-y-5">
              <Input
                label="Workspace name"
                name="workspace_name"
                placeholder={workspacePlaceholder}
                value={form.workspace_name}
                onChange={(event) => updateField("workspace_name", event.target.value)}
                error={errors.workspace_name}
                hint="This is your team space inside Histeeria."
              />
              <Input
                label="Agent name"
                name="agent_name"
                placeholder="Support Copilot"
                value={form.agent_name}
                onChange={(event) => updateField("agent_name", event.target.value)}
                error={errors.agent_name}
                hint="What do you call the agent you're monitoring?"
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">Choose the primary domain your agent operates in.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {DOMAINS.map((domain) => {
                  const selected = form.domain_name === domain.value;
                  return (
                    <button
                      key={domain.value}
                      type="button"
                      onClick={() => updateField("domain_name", domain.value)}
                      className={cn(
                        "rounded-lg border px-4 py-4 text-left transition",
                        selected
                          ? "border-accent bg-accent-soft"
                          : "border-border-strong bg-surface-2 hover:border-accent/35 hover:bg-surface-3",
                      )}
                    >
                      <p className="font-medium text-foreground">{domain.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{domain.description}</p>
                    </button>
                  );
                })}
              </div>
              {errors.domain_name ? (
                <p className="text-xs text-danger">{errors.domain_name}</p>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-sm">
                <p className="text-muted">Review</p>
                <p className="mt-1 font-medium">{form.agent_name}</p>
                <p className="text-muted">
                  {form.workspace_name} · {selectedDomain?.label}
                </p>
              </div>
              <Textarea
                label="What does your agent do?"
                name="agent_description"
                placeholder="Describe the decisions your agent makes, who it serves, and any constraints it must follow."
                value={form.agent_description}
                onChange={(event) => updateField("agent_description", event.target.value)}
                error={errors.agent_description}
                hint="This context helps Histeeria judge decisions more accurately."
              />
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 1 || submitting}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
            >
              Back
            </Button>
            <Button type="button" onClick={handleNext} disabled={submitting}>
              {submitting ? "Creating..." : step === 3 ? "Generate API key" : "Continue"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
