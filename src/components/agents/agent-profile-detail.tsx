"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Globe, Loader2, Lock, Save } from "lucide-react";

import { AgentProfileView, SECTION_LABELS } from "@/components/agents/agent-profile-view";
import type { AgentProfileDetailResponse, AgentProfileSummary, PublicSections } from "@/lib/api";
import { cn } from "@/lib/utils";

const SECTION_KEYS = Object.keys(SECTION_LABELS);

interface AgentProfileDetailProps {
  initial: AgentProfileDetailResponse;
  workspaceSlug: string;
}

export function AgentProfileDetail({ initial, workspaceSlug }: AgentProfileDetailProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfileSummary>(initial.profile);
  const [dashboard] = useState(initial.dashboard);
  const [publicSections, setPublicSections] = useState(initial.profile.public_sections);
  const [isPublic, setIsPublic] = useState(initial.profile.is_public);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicUrl = `/p/${workspaceSlug}/${profile.slug}`;

  async function saveVisibility() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/agent-profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: isPublic, public_sections: publicSections }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to save visibility settings");
      }
      const updated = (await res.json()) as AgentProfileSummary;
      setProfile(updated);
      setPublicSections(updated.public_sections);
      setIsPublic(updated.is_public);
      setMessage("Visibility settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save visibility settings");
    } finally {
      setSaving(false);
    }
  }

  function toggleSection(key: keyof PublicSections) {
    setPublicSections((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div className="space-y-3">
          <Link
            href={`/${workspaceSlug}/agents/profiles`}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-[#71717a] hover:text-[#fafafa]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All profiles
          </Link>
          <div>
            <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Agent profile</h1>
            <p className="mt-1 text-[13px] text-[#71717a]">
              Your daily judgment dashboard — private to this workspace unless you publish sections.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublic ? (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#fafafa] hover:bg-[#141414]"
            >
              View public page
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#71717a]">
              <Lock className="h-3.5 w-3.5" />
              Public page disabled
            </span>
          )}
        </div>
      </div>

      {message ? (
        <div className="rounded-[10px] border border-[#14532d]/40 bg-[#14532d]/20 px-4 py-3 text-[13px] text-[#86efac]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[10px] border border-[#7f1d1d]/50 bg-[#7f1d1d]/20 px-4 py-3 text-[13px] text-[#fca5a5]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <AgentProfileView profile={profile} dashboard={dashboard} mode="private" />

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[12px] border border-[#27272a] bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#71717a]" />
              <h2 className="text-[14px] font-medium text-[#fafafa]">Public visibility</h2>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#71717a]">
              Enable the public page, then choose which sections appear on your GitHub-style agent
              profile.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[8px] border border-[#27272a] bg-[#141414] p-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-0.5 cursor-pointer"
              />
              <div>
                <p className="text-[13px] text-[#fafafa]">Enable public profile page</p>
                <p className="text-[11px] text-[#52525b]">Creates a shareable URL at /p/{profile.slug}</p>
              </div>
            </label>

            <div className="mt-4 space-y-2">
              {SECTION_KEYS.map((key) => {
                const sectionKey = key as keyof PublicSections;
                return (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-[8px] border px-3 py-2 text-[12px]",
                    publicSections[sectionKey]
                      ? "border-[#14532d]/40 bg-[#14532d]/10 text-[#86efac]"
                      : "border-[#27272a] bg-[#141414] text-[#a1a1aa]",
                    !isPublic && "opacity-50",
                  )}
                >
                  <span>{SECTION_LABELS[key]}</span>
                  <input
                    type="checkbox"
                    disabled={!isPublic}
                    checked={Boolean(publicSections[sectionKey])}
                    onChange={() => toggleSection(sectionKey)}
                    className="cursor-pointer"
                  />
                </label>
              )})}
            </div>

            <button
              type="button"
              onClick={saveVisibility}
              disabled={saving}
              className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#e4e4e7] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save visibility
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${workspaceSlug}/agents/profiles?edit=${profile.id}`)}
            className="w-full cursor-pointer rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]"
          >
            Edit profile details
          </button>
        </aside>
      </div>
    </div>
  );
}
