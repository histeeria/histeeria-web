"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";

import { AgentProfileLanding } from "@/components/agents/agent-profile-landing";
import type { AgentProfileDetailResponse, AgentProfileSummary, PublicSections } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AgentProfileDetailProps {
  initial: AgentProfileDetailResponse;
  workspaceSlug: string;
}

export function AgentProfileDetail({ initial, workspaceSlug }: AgentProfileDetailProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfileSummary>(initial.profile);
  const [dashboard] = useState(initial.dashboard);
  const [publicSections, setPublicSections] = useState<PublicSections>(initial.profile.public_sections);
  const [isPublic, setIsPublic] = useState(initial.profile.is_public);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${workspaceSlug}/${profile.slug}`
      : `/p/${workspaceSlug}/${profile.slug}`;

  async function persistVisibility(next: {
    is_public?: boolean;
    public_sections?: PublicSections;
  }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent-profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_public: next.is_public ?? isPublic,
          public_sections: next.public_sections ?? publicSections,
        }),
      });
      if (!res.ok) throw new Error("Failed to save visibility");
      const updated = (await res.json()) as AgentProfileSummary;
      setProfile(updated);
      setPublicSections(updated.public_sections);
      setIsPublic(updated.is_public);
      setMessage("Saved.");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function toggleSection(key: keyof PublicSections) {
    const next = { ...publicSections, [key]: !publicSections[key] };
    setPublicSections(next);
    void persistVisibility({ public_sections: next });
  }

  function togglePublicPage() {
    const next = !isPublic;
    setIsPublic(next);
    void persistVisibility({ is_public: next });
  }

  async function shareProfile() {
    if (navigator.share && isPublic) {
      try {
        await navigator.share({ title: profile.name, url: publicUrl });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteProfile() {
    if (!confirm(`Delete "${profile.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/agent-profiles/${profile.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push(`/${workspaceSlug}/agents/profiles`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-black">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 border-b border-[#27272a] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link
            href={`/${workspaceSlug}/agents/profiles`}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-[#71717a] hover:text-[#fafafa]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Profiles
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePublicPage}
              disabled={saving}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition disabled:opacity-50",
                isPublic
                  ? "border-[#14532d]/50 bg-[#14532d]/15 text-[#86efac]"
                  : "border-[#27272a] text-[#71717a]",
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              {isPublic ? "Public page on" : "Public page off"}
            </button>
            <button
              type="button"
              onClick={shareProfile}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#86efac]" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Share"}
            </button>
            {isPublic ? (
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
              href={`/${workspaceSlug}/agents/profiles/${profile.id}/edit`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              type="button"
              onClick={deleteProfile}
              disabled={deleting}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#7f1d1d]/40 px-3 py-1.5 text-[12px] text-[#fca5a5] hover:bg-[#7f1d1d]/10 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </button>
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-[#71717a]" /> : null}
          </div>
        </div>
        {message ? (
          <p className="mx-auto max-w-6xl px-6 pb-2 text-[12px] text-[#86efac]">{message}</p>
        ) : null}
        {error ? (
          <p className="mx-auto max-w-6xl px-6 pb-2 text-[12px] text-[#fca5a5]">{error}</p>
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <AgentProfileLanding
          profile={profile}
          dashboard={dashboard}
          mode="private"
          publicSections={publicSections}
          isPublicEnabled={isPublic}
          onToggleSection={toggleSection}
        />
      </div>
    </div>
  );
}
