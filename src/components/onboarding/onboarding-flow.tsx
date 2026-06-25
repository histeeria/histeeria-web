"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Link2, Check } from "lucide-react";

import { ApiKeyReveal } from "@/components/onboarding/api-key-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding, DOMAINS, type OnboardingPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = OnboardingPayload;

const initialForm: FormState = {
  workspace_name: "",
  workspace_slug: "",
  team_size: "1",
  team_members: "",
  agent_name: "",
  domain_name: "",
  agent_description: "",
  full_name: "",
  role: "",
  heard_from: "",
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
  const [copiedLink, setCopiedLink] = useState(false);

  const workspacePlaceholder = useMemo(() => {
    const firstName = session?.user?.name?.split(" ")[0] ?? "My";
    return `${firstName}'s Workspace`;
  }, [session?.user?.name]);

  // Helper to slugify workspace name
  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const updated = { ...current, [key]: value };
      
      // Auto-slugify workspace name to slug if the user hasn't manually edited slug yet
      if (key === "workspace_name" && typeof value === "string" && !errors.workspace_slug) {
        updated.workspace_slug = slugify(value);
      }
      return updated;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (currentStep === 1) {
      const name = form.workspace_name.trim() || workspacePlaceholder;
      if (name.length < 2) {
        nextErrors.workspace_name = "Workspace name must be at least 2 characters.";
      }
      const slug = form.workspace_slug.trim() || slugify(name);
      if (slug.length < 2) {
        nextErrors.workspace_slug = "Workspace slug must be at least 2 characters.";
      }
    }

    if (currentStep === 3) {
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

    if (currentStep === 4) {
      const actualName = form.full_name.trim() || session?.user?.name || "";
      if (actualName.trim().length < 2) {
        nextErrors.full_name = "Name must be at least 2 characters.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    if (step < 4) {
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
      
      const payload: OnboardingPayload = {
        workspace_name: form.workspace_name.trim() || workspacePlaceholder,
        workspace_slug: form.workspace_slug.trim() || slugify(form.workspace_name || workspacePlaceholder),
        team_size: form.team_size,
        team_members: form.team_members?.trim() || undefined,
        agent_name: form.agent_name.trim(),
        domain_name: form.domain_name,
        agent_description: form.agent_description.trim(),
        full_name: (form.full_name || session?.user?.name || "").trim(),
        role: form.role?.trim() || undefined,
        heard_from: form.heard_from?.trim() || undefined,
      };

      const result = await completeOnboarding(token, payload);
      setApiKey(result.api_key);
      await update();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyInviteLink() {
    const inviteSlug = form.workspace_slug || slugify(form.workspace_name || workspacePlaceholder);
    const domain = typeof window !== "undefined" ? window.location.origin : "https://app.histeeria.com";
    const inviteLink = `${domain}/join/${inviteSlug}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      /* fallback */
    }
  }

  if (apiKey) {
    const finalSlug = form.workspace_slug || slugify(form.workspace_name || workspacePlaceholder);
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#030407] px-4">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,140,255,0.08)_0%,transparent_60%)] blur-[70px]" />
        
        <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-border bg-[#0a0e14]/75 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-[12px]">
          <ApiKeyReveal
            apiKey={apiKey}
            onContinue={() => {
              router.push(`/${finalSlug}/dashboard`);
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
      <div className="flex flex-1 flex-col justify-between px-6 py-12 sm:px-12 md:px-16 lg:px-20">
        {/* Top Header Label */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo-dark.png"
            alt="Histeeria"
            width={24}
            height={24}
            className="h-6 w-auto object-contain select-none"
          />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-bold select-none">
            Histeeria
          </span>
        </div>

        {/* Center Form Section */}
        <div className="mx-auto my-auto w-full max-w-[380px] py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Step 1: Create your workspace */}
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground select-none">
                      Create your workspace
                    </h1>
                    <p className="text-[13px] leading-relaxed text-muted select-none">
                      Start by naming your team space inside Histeeria.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Workspace Name"
                      name="workspace_name"
                      placeholder={workspacePlaceholder}
                      value={form.workspace_name}
                      onChange={(event) => updateField("workspace_name", event.target.value)}
                      error={errors.workspace_name}
                    />

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted select-none">
                        Workspace Slug
                      </label>
                      <div className="flex rounded-lg border border-border-strong bg-[#131a26] overflow-hidden focus-within:ring-2 focus-within:ring-accent-soft focus-within:border-accent/70 transition">
                        <span className="flex items-center bg-[#0d131f] border-r border-border-strong/60 px-3 py-2 text-xs font-mono text-muted/65 select-none">
                          app.histeeria.com/
                        </span>
                        <input
                          type="text"
                          name="workspace_slug"
                          placeholder={slugify(workspacePlaceholder)}
                          value={form.workspace_slug}
                          onChange={(e) => updateField("workspace_slug", slugify(e.target.value))}
                          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-foreground outline-none border-none placeholder-muted/40"
                        />
                      </div>
                      {errors.workspace_slug ? (
                        <p className="text-xs text-danger">{errors.workspace_slug}</p>
                      ) : null}
                    </div>

                    {/* Team Size beautiful custom selector */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted select-none">
                        Team Size
                      </label>
                      <select
                        value={form.team_size}
                        onChange={(e) => updateField("team_size", e.target.value)}
                        className="w-full rounded-lg border border-border-strong bg-[#131a26] px-3.5 py-2.5 text-xs text-foreground outline-none transition focus:border-accent/70 focus:bg-[#1a2331] focus:ring-2 focus:ring-accent-soft cursor-pointer"
                      >
                        <option value="1">Just me (1 person)</option>
                        <option value="2-5">Small team (2 - 5 people)</option>
                        <option value="6-15">Growing team (6 - 15 people)</option>
                        <option value="16-50">Scale team (16 - 50 people)</option>
                        <option value="50+">Enterprise (50+ people)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Step 2: Invite Teammates */}
              {step === 2 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground select-none">
                        Invite teammates
                      </h1>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition cursor-pointer select-none"
                      >
                        {copiedLink ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Link2 className="h-3 w-3" />
                        )}
                        {copiedLink ? "Link copied" : "Copy invite link"}
                      </button>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted select-none">
                      Get your team on Histeeria to start observing decisions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      label="Invitations"
                      name="team_members"
                      placeholder="email@gmail.com, email2@gmail.com"
                      value={form.team_members}
                      onChange={(event) => updateField("team_members", event.target.value)}
                      error={errors.team_members}
                      hint="Enter emails separated by commas."
                    />
                  </div>
                </div>
              ) : null}

              {/* Step 3: Configure Agent */}
              {step === 3 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground select-none">
                      Configure your first agent
                    </h1>
                    <p className="text-[13px] leading-relaxed text-muted select-none">
                      Configure your primary agent context so we can start observing decisions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Agent Name"
                      name="agent_name"
                      placeholder="Acme Support Copilot"
                      value={form.agent_name}
                      onChange={(event) => updateField("agent_name", event.target.value)}
                      error={errors.agent_name}
                    />

                    {/* Domain Select Box */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted select-none">
                        Agent Domain
                      </label>
                      <select
                        value={form.domain_name}
                        onChange={(e) => updateField("domain_name", e.target.value)}
                        className={cn(
                          "w-full rounded-lg border border-border-strong bg-[#131a26] px-3.5 py-2.5 text-xs outline-none transition focus:border-accent/70 focus:bg-[#1a2331] focus:ring-2 focus:ring-accent-soft cursor-pointer",
                          !form.domain_name ? "text-muted/70" : "text-foreground"
                        )}
                      >
                        <option value="" disabled>Select a domain...</option>
                        {DOMAINS.map((domain) => (
                          <option key={domain.value} value={domain.value}>
                            {domain.label}
                          </option>
                        ))}
                      </select>
                      {errors.domain_name ? (
                        <p className="text-xs text-danger">{errors.domain_name}</p>
                      ) : null}
                    </div>

                    <Textarea
                      label="What does your agent do?"
                      name="agent_description"
                      placeholder="Describe the context, tasks, and system prompts of your model..."
                      value={form.agent_description}
                      onChange={(event) => updateField("agent_description", event.target.value)}
                      error={errors.agent_description}
                      hint="Minimum 10 characters."
                    />
                  </div>
                </div>
              ) : null}

              {/* Step 4: Set up profile */}
              {step === 4 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground select-none">
                      Set up your profile
                    </h1>
                    <p className="text-[13px] leading-relaxed text-muted select-none">
                      Tell us a bit about yourself to finalize your workspace setup.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Your Full Name"
                      name="full_name"
                      placeholder="Alex Mercer"
                      value={form.full_name || session?.user?.name || ""}
                      onChange={(event) => updateField("full_name", event.target.value)}
                      error={errors.full_name}
                    />

                    <Input
                      label="Role / Title"
                      name="role"
                      placeholder="AI Engineer"
                      value={form.role}
                      onChange={(event) => updateField("role", event.target.value)}
                      error={errors.role}
                    />

                    <Input
                      label="Where did you hear about us?"
                      name="heard_from"
                      placeholder="X (Twitter), GitHub, Friend, etc."
                      value={form.heard_from}
                      onChange={(event) => updateField("heard_from", event.target.value)}
                      error={errors.heard_from}
                    />
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {submitError ? (
            <div className="mt-5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-xs text-danger text-center">
              {submitError}
            </div>
          ) : null}

          {/* Action buttons matching split screen layout */}
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
              <div className="w-12" />
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="px-6 rounded-lg text-xs bg-accent text-white font-medium shadow-[0_10px_30px_rgba(124,140,255,0.22)] hover:bg-[#7181f4]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : step === 2 ? (
                "Send Invitations"
              ) : step === 4 ? (
                "Complete onboarding"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>

        {/* 4 dots navigation indicating active onboarding step */}
        <div className="flex justify-center gap-2 select-none">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i < step || validateStep(step)) {
                  setStep(i);
                }
              }}
              disabled={submitting}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step === i ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-muted"
              )}
            />
          ))}
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
