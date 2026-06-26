"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Share2,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import { MediaUploadField } from "@/components/agents/media-upload-field";
import type { AgentProfilePayload, AgentProfileSummary, OwnerProfile, ProfileLink } from "@/lib/api";
import { DOMAINS } from "@/lib/api";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-[13px] text-[#fafafa] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#181818]";
const labelClass = "block text-[13px] font-medium text-[#a1a1aa]";

const EDIT_SECTIONS = [
  { id: "basics", label: "Agent info", icon: Zap, description: "Name, slug, domain, and description" },
  { id: "media", label: "Media", icon: ImageIcon, description: "Agent picture and demo video" },
  { id: "integration", label: "Integration", icon: Link2, description: "SDK agent ID and resource links" },
  { id: "builder", label: "Builder profile", icon: User, description: "Your name, bio, and contact" },
  { id: "social", label: "Social links", icon: Share2, description: "LinkedIn, GitHub, X, and more" },
] as const;

type SectionId = (typeof EDIT_SECTIONS)[number]["id"];

const SOCIAL_FIELDS = [
  { key: "linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
  { key: "github" as const, label: "GitHub", placeholder: "https://github.com/you" },
  { key: "x" as const, label: "X (Twitter)", placeholder: "https://x.com/you" },
  { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/you" },
  { key: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/@you" },
  { key: "patreon" as const, label: "Patreon", placeholder: "https://patreon.com/you" },
  { key: "website" as const, label: "Personal website", placeholder: "https://yoursite.com" },
];

function normalizeOwner(owner: OwnerProfile): OwnerProfile {
  return {
    name: owner.name ?? null,
    description: owner.description ?? null,
    email: owner.email ?? null,
    avatar_url: owner.avatar_url ?? null,
    social: {
      linkedin: owner.social?.linkedin ?? null,
      github: owner.social?.github ?? null,
      x: owner.social?.x ?? null,
      instagram: owner.social?.instagram ?? null,
      youtube: owner.social?.youtube ?? null,
      patreon: owner.social?.patreon ?? null,
      website: owner.social?.website ?? null,
    },
  };
}

function EditSection({
  id,
  title,
  description,
  children,
}: {
  id: SectionId;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[16px] border border-[#27272a] bg-[#0a0a0a]">
      <div className="border-b border-[#27272a] px-6 py-5">
        <h2 className="text-[17px] font-medium text-[#fafafa]">{title}</h2>
        <p className="mt-1 text-[13px] text-[#71717a]">{description}</p>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

interface AgentProfileEditFormProps {
  profile: AgentProfileSummary;
  workspaceSlug: string;
}

function toPayload(values: {
  name: string;
  slug: string;
  description: string;
  domain: string;
  sdkAgentId: string;
  agentAvatar: string;
  demoVideo: string;
  links: ProfileLink[];
  owner: OwnerProfile;
}): Partial<AgentProfilePayload> {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    domain: values.domain,
    sdk_agent_id: values.sdkAgentId || undefined,
    agent_avatar_url: values.agentAvatar || undefined,
    demo_video_url: values.demoVideo || undefined,
    links: values.links.filter((link) => link.label.trim() && link.url.trim()),
    owner_profile: values.owner,
  };
}

export function AgentProfileEditForm({ profile, workspaceSlug }: AgentProfileEditFormProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("basics");

  const [name, setName] = useState(profile.name);
  const [slug, setSlug] = useState(profile.slug);
  const [description, setDescription] = useState(profile.description ?? "");
  const [domain, setDomain] = useState(profile.domain ?? "general");
  const [sdkAgentId, setSdkAgentId] = useState(profile.sdk_agent_id ?? "");
  const [agentAvatar, setAgentAvatar] = useState(profile.agent_avatar_url ?? "");
  const [demoVideo, setDemoVideo] = useState(profile.demo_video_url ?? "");
  const [links, setLinks] = useState<ProfileLink[]>(profile.links.length ? profile.links : []);
  const [owner, setOwner] = useState<OwnerProfile>(normalizeOwner(profile.owner_profile));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicUrl = `/p/${workspaceSlug}/${slug}`;

  const isDirty = useMemo(() => {
    const initial = toPayload({
      name: profile.name,
      slug: profile.slug,
      description: profile.description ?? "",
      domain: profile.domain ?? "general",
      sdkAgentId: profile.sdk_agent_id ?? "",
      agentAvatar: profile.agent_avatar_url ?? "",
      demoVideo: profile.demo_video_url ?? "",
      links: profile.links,
      owner: normalizeOwner(profile.owner_profile),
    });
    return (
      JSON.stringify(
        toPayload({ name, slug, description, domain, sdkAgentId, agentAvatar, demoVideo, links, owner }),
      ) !== JSON.stringify(initial)
    );
  }, [name, slug, description, domain, sdkAgentId, agentAvatar, demoVideo, links, owner, profile]);

  function updateSocial(key: keyof OwnerProfile["social"], value: string) {
    setOwner((current) => ({
      ...current,
      social: { ...current.social, [key]: value || null },
    }));
  }

  function updateLink(index: number, field: keyof ProfileLink, value: string) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function scrollToSection(id: SectionId) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0.1, 0.3, 0.6] },
    );

    for (const section of EDIT_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  async function save() {
    if (!name.trim()) {
      setError("Agent name is required.");
      scrollToSection("basics");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/agent-profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          toPayload({ name, slug, description, domain, sdkAgentId, agentAvatar, demoVideo, links, owner }),
        ),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => {
        router.push(`/${workspaceSlug}/agents/profiles/${profile.id}`);
        router.refresh();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[#27272a] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <Link
              href={`/${workspaceSlug}/agents/profiles/${profile.id}`}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-[#71717a] hover:text-[#fafafa]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to profile
            </Link>
            <h1 className="mt-1 truncate text-[20px] font-medium text-[#fafafa]">Edit {profile.name}</h1>
            <p className="text-[12px] text-[#52525b]">Update agent details, media, and your builder section.</p>
          </div>
          <div className="flex items-center gap-2">
            {profile.is_public ? (
              <Link
                href={publicUrl}
                target="_blank"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414]"
              >
                Preview
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
            <Link
              href={`/${workspaceSlug}/agents/profiles/${profile.id}`}
              className="rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#141414]"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving || !isDirty}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
        {error ? (
          <p className="mx-auto max-w-6xl px-6 pb-3 text-[12px] text-[#fca5a5]">{error}</p>
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {EDIT_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                activeSection === section.id
                  ? "border-[#52525b] bg-[#141414] text-[#fafafa]"
                  : "border-[#27272a] text-[#71717a]",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="hidden lg:block">
          <div className="sticky top-28 space-y-1">
            <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.15em] text-[#52525b]">Sections</p>
            {EDIT_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition",
                    activeSection === section.id
                      ? "bg-[#141414] text-[#fafafa]"
                      : "text-[#71717a] hover:bg-[#0f0f0f] hover:text-[#a1a1aa]",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-[13px] font-medium">{section.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#52525b]">{section.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
          </nav>

          <div className="space-y-6">
          <EditSection id="basics" title="Agent info" description="Core details shown in the profile hero.">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className={labelClass}>Agent name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Security Scanner"
                  className={fieldClass}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={labelClass}>URL slug</span>
                <div className="flex overflow-hidden rounded-[10px] border border-[#27272a] bg-[#141414] focus-within:border-[#3f3f46]">
                  <span className="flex items-center border-r border-[#27272a] bg-[#0f0f0f] px-3 py-2.5 text-[11px] font-mono text-[#52525b]">
                    /p/{workspaceSlug}/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="security-scanner"
                    className="flex-1 bg-transparent px-3 py-2.5 font-mono text-[13px] text-[#fafafa] outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What this agent does, how it is evaluated, and what makes it trustworthy."
                  className={cn(fieldClass, "resize-none")}
                />
                <p className="text-[11px] text-[#52525b]">{description.length}/500 recommended</p>
              </label>
            </div>

            <div className="space-y-3">
              <span className={labelClass}>Domain</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDomain(d.value)}
                    className={cn(
                      "cursor-pointer rounded-[10px] border px-4 py-3 text-left transition",
                      domain === d.value
                        ? "border-[#52525b] bg-[#141414]"
                        : "border-[#27272a] bg-[#0f0f0f] hover:border-[#3f3f46]",
                    )}
                  >
                    <p className="text-[13px] font-medium text-[#fafafa]">{d.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#71717a]">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </EditSection>

          <EditSection id="media" title="Media" description="Visual assets for your public landing page.">
            <MediaUploadField
              label="Agent picture"
              hint="Square image works best. Uploaded to Cloudflare R2 — your pub-*.r2.dev URL is fine until you add a custom domain."
              purpose="agent_avatar"
              accept="image/png,image/jpeg,image/webp,image/gif"
              value={agentAvatar}
              onChange={setAgentAvatar}
              variant="image"
            />
            <div className="border-t border-[#27272a] pt-5">
              <MediaUploadField
                label="Demo video"
                hint="Upload MP4/WebM to R2, or paste a YouTube, Vimeo, or direct video URL."
                purpose="demo_video"
                accept="video/mp4,video/webm,video/quicktime"
                value={demoVideo}
                onChange={setDemoVideo}
                variant="video"
              />
            </div>
          </EditSection>

          <EditSection id="integration" title="Integration" description="Connect SDK telemetry and external resources.">
            <label className="block space-y-2">
              <span className={labelClass}>SDK agent ID</span>
              <input
                value={sdkAgentId}
                onChange={(e) => setSdkAgentId(e.target.value)}
                placeholder="security_scanner"
                className={cn(fieldClass, "font-mono")}
              />
              <p className="text-[11px] text-[#52525b]">
                Must match the agent ID in your SDK instrumentation to unlock judgment charts.
              </p>
            </label>

            <div className="space-y-3 border-t border-[#27272a] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className={labelClass}>Resource links</p>
                  <p className="mt-0.5 text-[11px] text-[#52525b]">Docs, repos, or product pages shown in the hero.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinks((c) => [...c, { label: "", url: "" }])}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add link
                </button>
              </div>
              {links.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-8 text-center text-[12px] text-[#52525b]">
                  No links yet. Add documentation or GitHub repo links for visitors.
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={link.label}
                        onChange={(e) => updateLink(index, "label", e.target.value)}
                        placeholder="Label"
                        className={cn(fieldClass, "w-1/3")}
                      />
                      <input
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                        placeholder="https://"
                        className={cn(fieldClass, "min-w-0 flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => setLinks((c) => c.filter((_, i) => i !== index))}
                        className="cursor-pointer rounded-[10px] border border-[#27272a] px-2.5 text-[#71717a] hover:text-[#fca5a5]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </EditSection>

          <EditSection id="builder" title="Builder profile" description="Your identity at the bottom of the public page.">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_200px]">
              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className={labelClass}>Your name</span>
                  <input
                    value={owner.name ?? ""}
                    onChange={(e) => setOwner((c) => ({ ...c, name: e.target.value || null }))}
                    placeholder="Jane Doe"
                    className={fieldClass}
                  />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Bio</span>
                  <textarea
                    rows={4}
                    value={owner.description ?? ""}
                    onChange={(e) => setOwner((c) => ({ ...c, description: e.target.value || null }))}
                    placeholder="What you build and why you care about agent judgment."
                    className={cn(fieldClass, "resize-none")}
                  />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Contact email</span>
                  <input
                    type="email"
                    value={owner.email ?? ""}
                    onChange={(e) => setOwner((c) => ({ ...c, email: e.target.value || null }))}
                    placeholder="you@company.com"
                    className={fieldClass}
                  />
                </label>
              </div>
              <div>
                <MediaUploadField
                  label="Your photo"
                  hint="Shown in the Built by section."
                  purpose="owner_avatar"
                  accept="image/png,image/jpeg,image/webp"
                  value={owner.avatar_url ?? ""}
                  onChange={(url) => setOwner((c) => ({ ...c, avatar_url: url || null }))}
                  variant="image"
                  previewClassName="h-40 w-40 mx-auto"
                />
              </div>
            </div>
          </EditSection>

          <EditSection id="social" title="Social links" description="Connect your profiles — only filled fields are shown publicly.">
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((field) => (
                <label key={field.key} className="block space-y-2">
                  <span className={labelClass}>{field.label}</span>
                  <input
                    value={owner.social[field.key] ?? ""}
                    onChange={(e) => updateSocial(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          </EditSection>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      {isDirty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <p className="flex items-center gap-2 text-[13px] text-[#a1a1aa]">
              <Wrench className="h-4 w-4" />
              Unsaved changes
            </p>
            <div className="flex gap-2">
              <Link
                href={`/${workspaceSlug}/agents/profiles/${profile.id}`}
                className="rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa]"
              >
                Discard
              </Link>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
