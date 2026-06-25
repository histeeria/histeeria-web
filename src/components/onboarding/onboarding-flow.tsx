"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { ApiKeyReveal } from "@/components/onboarding/api-key-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding, DOMAINS, type OnboardingPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = OnboardingPayload & {
  team_size?: string;
  team_members?: string;
};

const initialForm: FormState = {
  workspace_name: "",
  team_size: "1",
  team_members: "",
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
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const workspacePlaceholder = useMemo(() => {
    const firstName = session?.user?.name?.split(" ")[0] ?? "My";
    return `${firstName}'s Workspace`;
  }, [session?.user?.name]);

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
    }

    if (currentStep === 2) {
      if (form.agent_name.trim().length < 2) {
        nextErrors.agent_name = "Agent name must be at least 2 characters.";
      }
      if (!form.domain_name) {
        nextErrors.domain_name = "Select a domain for your agent.";
      }
      if (form.agent_description.trim().length < 10) {
        nextErrors.agent_description = "Describe your agent in at least 10 characters.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    if (step < 2) {
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
      
      const payload = {
        workspace_name: form.workspace_name.trim() || workspacePlaceholder,
        team_size: form.team_size,
        team_members: form.team_members,
        agent_name: form.agent_name.trim(),
        domain_name: form.domain_name,
        agent_description: form.agent_description.trim(),
      };

      const result = await completeOnboarding(token, payload);
      setApiKey(result.api_key);
      
      // Calculate dynamic slug from workspace name
      const slug = (form.workspace_name.trim() || workspacePlaceholder)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-");
      setCreatedSlug(slug);

      await update();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (apiKey) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#030407] px-4">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,140,255,0.08)_0%,transparent_60%)] blur-[70px]" />
        
        <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-border bg-[#0a0e14]/75 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-[12px]">
          <ApiKeyReveal
            apiKey={apiKey}
            onContinue={() => {
              const destination = createdSlug ? `/${createdSlug}/dashboard` : "/dashboard";
              router.push(destination);
              router.refresh();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#030407]">
      {/* LEFT COLUMN: Clean, Centered Form */}
      <div className="flex flex-1 flex-col justify-between px-6 py-12 sm:px-12 md:px-20 lg:px-24">
        {/* Top Header Label */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo-dark.png"
            alt="Histeeria"
            width={24}
            height={24}
            className="h-6 w-auto object-contain"
          />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Histeeria
          </span>
        </div>

        {/* Center Form Section */}
        <div className="mx-auto my-auto w-full max-w-[400px] py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 1 ? 16 : -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Set up your profile
                    </h1>
                    <p className="text-[13px] leading-relaxed text-muted">
                      Choose how you&apos;ll appear and interact in Histeeria.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Workspace name"
                      name="workspace_name"
                      placeholder={workspacePlaceholder}
                      value={form.workspace_name}
                      onChange={(event) => updateField("workspace_name", event.target.value)}
                      error={errors.workspace_name}
                      hint="Must be completely unique. Every space gets its own dashboard link."
                    />

                    {/* Team Size Dropdown */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                        Team Size (Optional)
                      </label>
                      <select
                        value={form.team_size}
                        onChange={(e) => updateField("team_size", e.target.value)}
                        className="w-full rounded-lg border border-border-strong bg-[#131a26] px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/70 focus:bg-[#1a2331] focus:ring-2 focus:ring-accent-soft"
                      >
                        <option value="1">Just me (1 person)</option>
                        <option value="2-5">Small team (2 - 5 people)</option>
                        <option value="6-15">Growing team (6 - 15 people)</option>
                        <option value="16-50">Scale team (16 - 50 people)</option>
                        <option value="50+">Enterprise (50+ people)</option>
                      </select>
                    </div>

                    {/* Add Team Members */}
                    <Textarea
                      label="Invite Team Members (Optional)"
                      name="team_members"
                      placeholder="colleague1@company.com, colleague2@company.com"
                      value={form.team_members}
                      onChange={(event) => updateField("team_members", event.target.value)}
                      error={errors.team_members}
                      hint="Add emails, comma-separated, to invite your team."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Configure your first agent
                    </h1>
                    <p className="text-[13px] leading-relaxed text-muted">
                      Define your LLM agent&apos;s name, evaluation domain, and description.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Agent name"
                      name="agent_name"
                      placeholder="Acme Support Copilot"
                      value={form.agent_name}
                      onChange={(event) => updateField("agent_name", event.target.value)}
                      error={errors.agent_name}
                      hint="The conversational identifier of your model."
                    />

                    {/* Domain Select Box */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                        Agent Domain
                      </label>
                      <select
                        value={form.domain_name}
                        onChange={(e) => updateField("domain_name", e.target.value)}
                        className={cn(
                          "w-full rounded-lg border border-border-strong bg-[#131a26] px-3.5 py-2.5 text-sm outline-none transition focus:border-accent/70 focus:bg-[#1a2331] focus:ring-2 focus:ring-accent-soft",
                          !form.domain_name ? "text-muted/70" : "text-foreground"
                        )}
                      >
                        <option value="" disabled>Select a domain...</option>
                        {DOMAINS.map((domain) => (
                          <option key={domain.value} value={domain.value}>
                            {domain.label} — {domain.description}
                          </option>
                        ))}
                      </select>
                      {errors.domain_name ? (
                        <p className="text-xs text-danger">{errors.domain_name}</p>
                      ) : null}
                    </div>

                    <Textarea
                      label="Agent Description"
                      name="agent_description"
                      placeholder="What context, tasks, and system prompts define your agent's behavior?"
                      value={form.agent_description}
                      onChange={(event) => updateField("agent_description", event.target.value)}
                      error={errors.agent_description}
                      hint="Helps the judge understand evaluation boundaries."
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {submitError ? (
            <div className="mt-5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-xs text-danger text-center">
              {submitError}
            </div>
          ) : null}

          {/* Action buttons matching Linear split screen layout */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                className="text-muted hover:text-foreground text-sm"
              >
                Back
              </Button>
            ) : (
              <div className="w-12" /> // spacer to align right
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="px-6 rounded-lg text-sm bg-accent text-white font-medium shadow-[0_10px_30px_rgba(124,140,255,0.22)] hover:bg-[#7181f4]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : step === 2 ? (
                "Create workspace"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Horizontal Dots Navigation Indicator matching the Linear.app slide Dots */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => step > 1 && setStep(1)}
            disabled={submitting}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === 1 ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-muted"
            )}
          />
          <button
            type="button"
            onClick={() => step < 2 && handleNext()}
            disabled={submitting}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === 2 ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-muted"
            )}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Premium Ambient Light & Large Faded Logo Mockup */}
      <div className="relative hidden md:flex flex-1 flex-col items-center justify-center overflow-hidden border-l border-border bg-[#05060b]">
        {/* Subtle grid backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Epic center light projection */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,140,255,0.07)_0%,transparent_60%)] blur-[50px]" />
        
        {/* Abstract orbits */}
        <div className="absolute h-[340px] w-[340px] rounded-full border border-border/25 animate-[spin_60s_linear_infinite]" />
        <div className="absolute h-[500px] w-[500px] rounded-full border border-dashed border-border/10 animate-[spin_120s_linear_infinite]" />

        {/* Faded logo mockup */}
        <div className="relative z-10 flex flex-col items-center space-y-4 opacity-[0.8]">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-[#0a0e14]/50 shadow-2xl backdrop-blur-sm">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={56}
              height={56}
              priority
              className="h-14 w-auto object-contain select-none"
            />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="font-mono text-lg font-bold tracking-[0.2em] text-foreground uppercase select-none">
              Histeeria
            </h2>
            <p className="text-[12px] font-medium tracking-wide text-muted/75 select-none">
              Infrastructure for machine judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
