"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { MediaUploadField } from "@/components/agents/media-upload-field";
import type { AgentProfilePayload, AgentProfileSummary, OwnerProfile } from "@/lib/api";
import { DOMAINS } from "@/lib/api";

interface AgentProfileEditorProps {
  profile: AgentProfileSummary;
  onClose: () => void;
  onSaved: (profile: AgentProfileSummary) => void;
}

export function AgentProfileEditor({ profile, onClose, onSaved }: AgentProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [slug, setSlug] = useState(profile.slug);
  const [description, setDescription] = useState(profile.description ?? "");
  const [domain, setDomain] = useState(profile.domain ?? "general");
  const [sdkAgentId, setSdkAgentId] = useState(profile.sdk_agent_id ?? "");
  const [agentAvatar, setAgentAvatar] = useState(profile.agent_avatar_url ?? "");
  const [demoVideo, setDemoVideo] = useState(profile.demo_video_url ?? "");
  const [owner, setOwner] = useState<OwnerProfile>(profile.owner_profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSocial(key: keyof OwnerProfile["social"], value: string) {
    setOwner((current) => ({
      ...current,
      social: { ...current.social, [key]: value || null },
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload: Partial<AgentProfilePayload> = {
      name,
      slug,
      description: description || undefined,
      domain,
      sdk_agent_id: sdkAgentId || undefined,
      agent_avatar_url: agentAvatar || undefined,
      demo_video_url: demoVideo || undefined,
      owner_profile: owner,
    };
    try {
      const res = await fetch(`/api/agent-profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to save");
      }
      onSaved((await res.json()) as AgentProfileSummary);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-[#27272a] bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
          <h2 className="text-[15px] font-medium text-[#fafafa]">Edit profile</h2>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-md p-1 text-[#71717a] hover:text-[#fafafa]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {error ? (
            <div className="rounded-[8px] border border-[#7f1d1d]/50 bg-[#7f1d1d]/20 px-3 py-2 text-[13px] text-[#fca5a5]">
              {error}
            </div>
          ) : null}

          <fieldset className="space-y-3">
            <legend className="text-[12px] font-medium uppercase tracking-wide text-[#52525b]">Agent</legend>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 font-mono text-[13px] text-[#fafafa]"
            />
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this agent does"
              className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            />
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              value={sdkAgentId}
              onChange={(e) => setSdkAgentId(e.target.value)}
              placeholder="SDK agent ID"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 font-mono text-[13px] text-[#fafafa]"
            />
            <MediaUploadField
              label="Agent picture"
              hint="PNG/JPG/WebP — stored on Cloudflare R2 when configured"
              purpose="agent_avatar"
              accept="image/*"
              value={agentAvatar}
              onChange={setAgentAvatar}
            />
            <MediaUploadField
              label="Demo video"
              hint="MP4/WebM or YouTube/Vimeo URL"
              purpose="demo_video"
              accept="video/*"
              value={demoVideo}
              onChange={setDemoVideo}
            />
          </fieldset>

          <fieldset className="space-y-3 border-t border-[#27272a] pt-5">
            <legend className="text-[12px] font-medium uppercase tracking-wide text-[#52525b]">
              Your builder profile
            </legend>
            <input
              value={owner.name ?? ""}
              onChange={(e) => setOwner((c) => ({ ...c, name: e.target.value || null }))}
              placeholder="Your name"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            />
            <textarea
              rows={3}
              value={owner.description ?? ""}
              onChange={(e) => setOwner((c) => ({ ...c, description: e.target.value || null }))}
              placeholder="Short bio"
              className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            />
            <input
              value={owner.email ?? ""}
              onChange={(e) => setOwner((c) => ({ ...c, email: e.target.value || null }))}
              placeholder="Contact email"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
            />
            <MediaUploadField
              label="Your photo"
              purpose="owner_avatar"
              accept="image/*"
              hint="Shown in the builder section at the bottom of your public page"
              value={owner.avatar_url ?? ""}
              onChange={(url) => setOwner((c) => ({ ...c, avatar_url: url || null }))}
            />
            {(
              [
                ["linkedin", "LinkedIn URL"],
                ["github", "GitHub URL"],
                ["x", "X (Twitter) URL"],
                ["instagram", "Instagram URL"],
                ["youtube", "YouTube URL"],
                ["patreon", "Patreon URL"],
                ["website", "Personal website"],
              ] as const
            ).map(([key, placeholder]) => (
              <input
                key={key}
                value={owner.social[key] ?? ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa]"
              />
            ))}
          </fieldset>
        </div>
        <div className="border-t border-[#27272a] p-5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fafafa] py-2.5 text-[13px] font-medium text-black disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
