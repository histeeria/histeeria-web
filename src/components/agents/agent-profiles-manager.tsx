"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type { AgentProfilePayload, AgentProfileSummary, MeResponse, ProfileLink } from "@/lib/api";
import { DOMAINS } from "@/lib/api";
import { cn } from "@/lib/utils";

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-[#27272a] bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
          <h2 className="text-[15px] font-medium text-[#fafafa]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ProfileForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial?: AgentProfileSummary;
  saving: boolean;
  onSubmit: (payload: AgentProfilePayload) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "general");
  const [sdkAgentId, setSdkAgentId] = useState(initial?.sdk_agent_id ?? "");
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? false);
  const [links, setLinks] = useState<ProfileLink[]>(initial?.links ?? []);

  function updateLink(index: number, field: keyof ProfileLink, value: string) {
    setLinks((current) =>
      current.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  function addLink() {
    setLinks((current) => [...current, { label: "", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          slug: slug || undefined,
          description: description || undefined,
          domain: domain || undefined,
          sdk_agent_id: sdkAgentId || undefined,
          is_public: isPublic,
          links: links.filter((link) => link.label.trim() && link.url.trim()),
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">Profile name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
          placeholder="Security Scanner"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">URL slug</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 font-mono text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
          placeholder="security-scanner"
        />
        <span className="text-[11px] text-[#52525b]">Used in the public profile link.</span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">Description</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
          placeholder="What this agent does and how it is evaluated."
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">Domain</span>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full cursor-pointer rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
        >
          {DOMAINS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">SDK agent ID (optional)</span>
        <input
          value={sdkAgentId}
          onChange={(e) => setSdkAgentId(e.target.value)}
          className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 font-mono text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
          placeholder="security_scanner"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[12px] text-[#a1a1aa]">Links</span>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                placeholder="Label"
                className="w-1/3 rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder="https://"
                className="min-w-0 flex-1 rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="cursor-pointer rounded-[8px] border border-[#27272a] px-2 text-[#71717a] hover:text-[#fafafa]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="cursor-pointer text-[12px] text-[#71717a] hover:text-[#fafafa]"
          >
            + Add link
          </button>
        </div>
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-3">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="cursor-pointer"
        />
        <div>
          <p className="text-[13px] text-[#fafafa]">Public profile</p>
          <p className="text-[11px] text-[#52525b]">
            Enables a public URL. Choose which sections to show from the profile page.
          </p>
        </div>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="cursor-pointer rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#141414] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#e4e4e7] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Saving…" : initial ? "Save changes" : "Create profile"}
        </button>
      </div>
    </form>
  );
}

interface AgentProfilesManagerProps {
  profile: MeResponse;
  workspaceSlug: string;
  initialProfiles: AgentProfileSummary[];
  initialOpenCreate?: boolean;
  initialEditId?: string | null;
}

export function AgentProfilesManager({
  profile,
  workspaceSlug,
  initialProfiles,
  initialOpenCreate = false,
  initialEditId = null,
}: AgentProfilesManagerProps) {
  const [profiles, setProfiles] = useState<AgentProfileSummary[]>(initialProfiles);
  const [modal, setModal] = useState<"create" | "edit" | null>(() => {
    if (initialOpenCreate) return "create";
    if (initialEditId) return "edit";
    return null;
  });
  const [editing, setEditing] = useState<AgentProfileSummary | null>(() => {
    if (!initialEditId) return null;
    return initialProfiles.find((p) => p.id === initialEditId) ?? null;
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function publicUrl(slug: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/p/${workspaceSlug}/${slug}`;
  }

  async function reload() {
    const res = await fetch("/api/agent-profiles");
    if (res.ok) {
      const data = (await res.json()) as { profiles: AgentProfileSummary[] };
      setProfiles(data.profiles);
    }
  }

  async function handleCreate(payload: AgentProfilePayload) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agent-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to create profile");
      }
      setModal(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(payload: AgentProfilePayload) {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent-profiles/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to update profile");
      }
      setModal(null);
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this agent profile? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/agent-profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete profile");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setDeletingId(null);
    }
  }

  async function copyLink(id: string, slug: string) {
    await navigator.clipboard.writeText(publicUrl(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">
            Agent Profiles
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#71717a]">
            GitHub-style judgment profiles for your agents. Open a profile for the daily dashboard,
            then choose what to publish publicly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModal("create");
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e4e4e7]"
        >
          <Plus className="h-3.5 w-3.5" />
          New profile
        </button>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#7f1d1d]/50 bg-[#7f1d1d]/20 px-4 py-3 text-[13px] text-[#fca5a5]">
          {error}
        </div>
      ) : null}

      {profiles.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-12 text-center">
          <p className="text-[13px] text-[#71717a]">No agent profiles yet.</p>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="mt-3 cursor-pointer text-[13px] text-[#a1a1aa] underline hover:text-[#fafafa]"
          >
            Create your first profile
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4 transition hover:border-[#3f3f46]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/${workspaceSlug}/agents/profiles/${p.id}`}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-medium text-[#fafafa]">{p.name}</h2>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        p.is_public
                          ? "bg-[#14532d]/40 text-[#86efac]"
                          : "bg-[#27272a] text-[#71717a]",
                      )}
                    >
                      {p.is_public ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {p.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-[#52525b]">/{p.slug}</p>
                  {p.description ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-[#a1a1aa]">
                      {p.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#52525b]">
                    {p.domain ? <span>Domain: {p.domain.replace(/_/g, " ")}</span> : null}
                    {p.sdk_agent_id ? (
                      <span className="font-mono">SDK: {p.sdk_agent_id}</span>
                    ) : null}
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/${workspaceSlug}/agents/profiles/${p.id}`}
                    className="rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]"
                  >
                    Open profile
                  </Link>
                  {p.is_public ? (
                    <>
                      <button
                        type="button"
                        onClick={() => copyLink(p.id, p.slug)}
                        title="Copy public link"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
                      >
                        {copiedId === p.id ? (
                          <Check className="h-4 w-4 text-[#86efac]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/p/${workspaceSlug}/${p.slug}`}
                        target="_blank"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
                        title="Open public page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </>
                  ) : null}
                  <Link
                    href={`/${workspaceSlug}/agents/profiles/${p.id}/edit`}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#71717a] hover:bg-[#141414] hover:text-[#f87171] disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "create" ? (
        <Modal title="New agent profile" onClose={() => setModal(null)}>
          <ProfileForm saving={saving} onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}

      {modal === "edit" && editing ? (
        <Modal title="Edit agent profile" onClose={() => setModal(null)}>
          <ProfileForm
            initial={editing}
            saving={saving}
            onSubmit={handleUpdate}
            onCancel={() => setModal(null)}
          />
        </Modal>
      ) : null}

      <p className="text-[11px] text-[#52525b]">
        Workspace: {profile.organization?.workspace_name ?? workspaceSlug}
      </p>
    </div>
  );
}
