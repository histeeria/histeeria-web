"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link2, Check } from "lucide-react";

import { checkWorkspaceSlug, completeOnboarding, DOMAINS, type OnboardingPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = {
  workspace_name: string;
  workspace_slug: string;
  team_size: string;
  team_members: string;
  agent_name: string;
  domain_name: string;
  agent_description: string;
  full_name: string;
  role: string;
  heard_from: string;
};

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

const fieldClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#4f5ea3] focus:bg-[#101524]";
const labelClass = "block text-[12px] font-medium text-[#a1a1aa] select-none";

const onboardingSlides = [
  {
    image: "/images/shield.png",
    label: "Onboarding",
    title: "Build trust\nfrom day one.",
    description:
      "Set up your workspace, connect your first agent, and start monitoring decisions with evidence-backed judgment.",
  },
  {
    image: "/images/bridge.png",
    label: "Evaluation",
    title: "Connect.\nEvaluate.\nImprove.",
    description:
      "Bring traces, outputs, and tool calls into one command center for continuous judgment monitoring.",
  },
  {
    image: "/images/audit.jpg",
    label: "Audit trail",
    title: "Every decision\nvisible.",
    description:
      "Create a clear record of what your agent saw, decided, and changed before mistakes reach users.",
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [completionSlug, setCompletionSlug] = useState<string | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const slugManuallyEdited = useRef(false);

  const workspacePlaceholder = useMemo(() => {
    const firstName = session?.user?.name?.split(" ")[0] ?? "My";
    return `${firstName}'s Workspace`;
  }, [session?.user?.name]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % onboardingSlides.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!completionSlug) return;

    const timeout = window.setTimeout(() => {
      router.push(`/${completionSlug}/dashboard`);
      router.refresh();
    }, 4800);

    return () => window.clearTimeout(timeout);
  }, [completionSlug, router]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const updated = { ...current, [key]: value };

      if (key === "workspace_name" && typeof value === "string" && !slugManuallyEdited.current) {
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
      const agentName = form.agent_name.trim();
      const agentDescription = form.agent_description.trim();
      const hasAnyAgentField =
        Boolean(agentName) ||
        Boolean(form.domain_name) ||
        Boolean(agentDescription);

      if (!hasAnyAgentField) {
        setErrors(nextErrors);
        return true;
      }

      if (agentName.length < 2) {
        nextErrors.agent_name = "Agent name must be at least 2 characters.";
      }
      if (!form.domain_name) {
        nextErrors.domain_name = "Select a domain for your agent.";
      }
      if (agentDescription.length < 10) {
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

  async function verifySlugAvailability() {
    const slug = form.workspace_slug.trim() || slugify(form.workspace_name.trim() || workspacePlaceholder);

    setCheckingSlug(true);
    try {
      const tokenResponse = await fetch("/api/session-token");
      if (!tokenResponse.ok) {
        throw new Error("Unable to authenticate request");
      }
      const { token } = (await tokenResponse.json()) as { token: string };
      const result = await checkWorkspaceSlug(token, slug);

      if (!result.available) {
        setErrors((current) => ({
          ...current,
          workspace_slug: result.reason ?? "Workspace slug is already taken.",
        }));
        return false;
      }

      if (result.slug !== form.workspace_slug) {
        setForm((current) => ({ ...current, workspace_slug: result.slug }));
      }

      return true;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to verify slug");
      return false;
    } finally {
      setCheckingSlug(false);
    }
  }

  async function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    if (step === 1) {
      const slugOk = await verifySlugAvailability();
      if (!slugOk) {
        return;
      }
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
        agent_name: form.agent_name.trim() || undefined,
        domain_name: form.domain_name || undefined,
        agent_description: form.agent_description.trim() || undefined,
        full_name: (form.full_name || session?.user?.name || "").trim(),
        role: form.role?.trim() || undefined,
        heard_from: form.heard_from?.trim() || undefined,
      };

      const result = await completeOnboarding(token, payload);
      setApiKey(result.api_key);
      await update();
      setCompletionSlug(payload.workspace_slug);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkipInvites() {
    setStep(3);
  }

  function handleSkipAgentSetup() {
    setForm((current) => ({
      ...current,
      agent_name: "",
      domain_name: "",
      agent_description: "",
    }));
    setErrors({});
    setStep(4);
  }

  async function handleCopyInviteLink() {
    const inviteSlug = form.workspace_slug || slugify(form.workspace_name || workspacePlaceholder);
    const domain = typeof window !== "undefined" ? window.location.origin : "https://app.histeeria.com";
    const inviteLink = `${domain}/login?workspace=${inviteSlug}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      /* fallback */
    }
  }

  const primaryLabel = useMemo(() => {
    if (submitting) return "Creating...";
    if (checkingSlug) return "Checking...";
    if (step === 2) return form.team_members?.trim() ? "Send invitations" : "Continue";
    if (step === 4) return "Complete onboarding";
    return "Continue";
  }, [checkingSlug, form.team_members, step, submitting]);

  if (apiKey || completionSlug) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(143,156,255,0.12),transparent_36%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {!videoFailed ? (
            <video
              src="/logo-mov.mp4"
              autoPlay
              muted
              playsInline
              className="h-40 w-40 object-contain opacity-0 animate-[fade-up_0.6s_ease-out_forwards]"
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={130}
              height={130}
              className="h-32 w-auto object-contain opacity-0 animate-[fade-up_0.6s_ease-out_forwards]"
              priority
            />
          )}
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            Opening your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#020202] md:flex-row">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(236,168,214,0.16),transparent_28%),radial-gradient(circle_at_24%_14%,rgba(143,156,255,0.16),transparent_30%),linear-gradient(180deg,#020202_0%,#050505_45%,#020202_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      {/* Left: form */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-8 sm:px-12 md:px-14 lg:px-20">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-dark.png"
            alt="Histeeria"
            width={20}
            height={20}
            className="h-5 w-auto object-contain select-none opacity-90"
          />
          <span className="text-[13px] font-medium text-[#71717a] select-none">Histeeria</span>
        </div>

        <div className="mx-auto my-auto w-full max-w-[450px] py-4">
          <div className="rounded-[24px] border border-white/10 bg-[#070707]/86 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.72)] backdrop-blur-2xl md:p-7">
            <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-6"
            >
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-[26px] font-medium tracking-[-0.035em] text-[#fafafa] select-none">
                      Create your workspace
                    </h1>
                    <p className="text-[13px] leading-relaxed text-[#71717a] select-none">
                      Name your team space and choose a unique URL slug.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="workspace_name" className={labelClass}>
                        Workspace name
                      </label>
                      <input
                        id="workspace_name"
                        name="workspace_name"
                        placeholder={workspacePlaceholder}
                        value={form.workspace_name}
                        onChange={(event) => updateField("workspace_name", event.target.value)}
                        className={fieldClass}
                      />
                      {errors.workspace_name ? (
                        <p className="text-xs text-[#f87171]">{errors.workspace_name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="workspace_slug" className={labelClass}>
                        Workspace slug
                      </label>
                      <div className="flex overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.035] focus-within:border-[#4f5ea3]">
                        <span className="flex items-center border-r border-white/10 bg-[#0f0f0f] px-3 py-2.5 text-xs font-mono text-[#52525b] select-none">
                          app.histeeria.com/
                        </span>
                        <input
                          id="workspace_slug"
                          type="text"
                          name="workspace_slug"
                          placeholder={slugify(workspacePlaceholder)}
                          value={form.workspace_slug}
                          onChange={(e) => {
                            slugManuallyEdited.current = true;
                            updateField("workspace_slug", slugify(e.target.value));
                          }}
                          className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono text-[#ededed] outline-none placeholder:text-[#52525b]"
                        />
                      </div>
                      {errors.workspace_slug ? (
                        <p className="text-xs text-[#f87171]">{errors.workspace_slug}</p>
                      ) : (
                        <p className="text-xs text-[#52525b]">Must be unique across all workspaces.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="team_size" className={labelClass}>
                        Team size
                      </label>
                      <select
                        id="team_size"
                        value={form.team_size}
                        onChange={(e) => updateField("team_size", e.target.value)}
                        className={cn(fieldClass, "cursor-pointer")}
                      >
                        <option value="1">Just me</option>
                        <option value="2-5">2 – 5 people</option>
                        <option value="6-15">6 – 15 people</option>
                        <option value="16-50">16 – 50 people</option>
                        <option value="50+">50+ people</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h1 className="text-[26px] font-medium tracking-[-0.035em] text-[#fafafa] select-none">
                        Invite teammates
                      </h1>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#ededed] transition cursor-pointer select-none"
                      >
                        {copiedLink ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                        {copiedLink ? "Copied" : "Copy invite link"}
                      </button>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#71717a] select-none">
                      Get your team on Histeeria to start working. This step is optional.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="team_members" className={labelClass}>
                      Invitations
                    </label>
                    <textarea
                      id="team_members"
                      name="team_members"
                      placeholder="email@gmail.com, email2@gmail.com"
                      value={form.team_members}
                      onChange={(event) => updateField("team_members", event.target.value)}
                      className={cn(fieldClass, "min-h-[120px] resize-none")}
                    />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-[26px] font-medium tracking-[-0.035em] text-[#fafafa] select-none">
                      Configure your first agent
                    </h1>
                    <p className="text-[13px] leading-relaxed text-[#71717a] select-none">
                      Define your agent&apos;s name, domain, and description.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="agent_name" className={labelClass}>
                        Agent name
                      </label>
                      <input
                        id="agent_name"
                        name="agent_name"
                        placeholder="Support Copilot"
                        value={form.agent_name}
                        onChange={(event) => updateField("agent_name", event.target.value)}
                        className={fieldClass}
                      />
                      {errors.agent_name ? (
                        <p className="text-xs text-[#f87171]">{errors.agent_name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="domain_name" className={labelClass}>
                        Agent domain
                      </label>
                      <select
                        id="domain_name"
                        value={form.domain_name}
                        onChange={(e) => updateField("domain_name", e.target.value)}
                        className={cn(
                          fieldClass,
                          "cursor-pointer",
                          !form.domain_name ? "text-[#52525b]" : "text-[#ededed]",
                        )}
                      >
                        <option value="" disabled className="bg-[#0a0a0a]">
                          Select a domain...
                        </option>
                        {DOMAINS.map((domain) => (
                          <option key={domain.value} value={domain.value} className="bg-[#0a0a0a]">
                            {domain.label}
                          </option>
                        ))}
                      </select>
                      {errors.domain_name ? (
                        <p className="text-xs text-[#f87171]">{errors.domain_name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="agent_description" className={labelClass}>
                        What does your agent do?
                      </label>
                      <textarea
                        id="agent_description"
                        name="agent_description"
                        placeholder="Describe the context, tasks, and system prompts of your model..."
                        value={form.agent_description}
                        onChange={(event) => updateField("agent_description", event.target.value)}
                        className={cn(fieldClass, "min-h-[100px] resize-none")}
                      />
                      {errors.agent_description ? (
                        <p className="text-xs text-[#f87171]">{errors.agent_description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h1 className="text-[26px] font-medium tracking-[-0.035em] text-[#fafafa] select-none">
                      Set up your profile
                    </h1>
                    <p className="text-[13px] leading-relaxed text-[#71717a] select-none">
                      Choose how you&apos;ll appear in Histeeria.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="full_name" className={labelClass}>
                        Name
                      </label>
                      <input
                        id="full_name"
                        name="full_name"
                        placeholder="Alex Mercer"
                        value={form.full_name || session?.user?.name || ""}
                        onChange={(event) => updateField("full_name", event.target.value)}
                        className={fieldClass}
                      />
                      {errors.full_name ? (
                        <p className="text-xs text-[#f87171]">{errors.full_name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className={labelClass}>
                        Title
                      </label>
                      <input
                        id="role"
                        name="role"
                        placeholder="Software engineer"
                        value={form.role}
                        onChange={(event) => updateField("role", event.target.value)}
                        className={fieldClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="heard_from" className={labelClass}>
                        Where did you hear about us?
                      </label>
                      <input
                        id="heard_from"
                        name="heard_from"
                        placeholder="Twitter, GitHub, a friend..."
                        value={form.heard_from}
                        onChange={(event) => updateField("heard_from", event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
            </AnimatePresence>

            {submitError ? (
            <div className="mt-5 rounded-[10px] border border-red-900/30 bg-red-950/20 px-4 py-3 text-xs text-[#f87171] text-center">
              {submitError}
            </div>
          ) : null}

            <div className="mt-8 flex items-center justify-end gap-4">
            {step === 2 ? (
              <button
                type="button"
                disabled={submitting || checkingSlug}
                onClick={handleSkipInvites}
                className="text-[13px] text-[#71717a] hover:text-[#ededed] transition cursor-pointer disabled:opacity-50"
              >
                Skip
              </button>
            ) : step === 3 ? (
              <button
                type="button"
                disabled={submitting || checkingSlug}
                onClick={handleSkipAgentSetup}
                className="text-[13px] text-[#71717a] hover:text-[#ededed] transition cursor-pointer disabled:opacity-50"
              >
                Skip agent setup
              </button>
            ) : step > 1 ? (
              <button
                type="button"
                disabled={submitting || checkingSlug}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                className="text-[13px] text-[#71717a] hover:text-[#ededed] transition cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
            ) : null}

              <button
              type="button"
              onClick={handleNext}
              disabled={submitting || checkingSlug}
              className="cursor-pointer rounded-full border border-[#49558d] bg-[#20284a] px-5 py-2 text-[13px] font-medium text-[#eef0ff] transition hover:border-[#5b68a5] hover:bg-[#28325a] disabled:opacity-60"
            >
              {submitting || checkingSlug ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#71717a] border-t-transparent" />
                  {primaryLabel}
                </span>
              ) : (
                primaryLabel
              )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 select-none">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step === i ? "w-6 bg-[#fafafa]" : "w-1.5 bg-[#3f3f46]",
              )}
            />
          ))}
        </div>
      </div>

      {/* Right: ambient panel */}
      <div className="relative hidden flex-1 overflow-hidden border-l border-white/10 bg-black md:flex md:items-center md:justify-center">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={onboardingSlides[slideIndex].image}
            alt="Onboarding visual"
            className="h-full w-full object-cover opacity-80 transition-opacity duration-700"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(2,2,2,0.82)_0%,rgba(2,2,2,0.48)_45%,rgba(2,2,2,0.82)_100%)]" />
        <div className="relative z-10 max-w-[420px] px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            {onboardingSlides[slideIndex].label}
          </p>
          <h2 className="mt-3 text-[56px] font-medium leading-[0.9] tracking-[-0.05em] text-white">
            {onboardingSlides[slideIndex].title.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 text-[15px] leading-[1.85] text-white/68">
            {onboardingSlides[slideIndex].description}
          </p>
        </div>
      </div>
    </div>
  );
}
