"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type { ApiKeyPermission, ApiKeySummary, MeResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const PERMISSION_OPTIONS: { value: ApiKeyPermission; label: string }[] = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "read_write", label: "Read & Write" },
];

function formatPermission(value: ApiKeyPermission) {
  return PERMISSION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      <div className="relative w-full max-w-md rounded-xl border border-[#27272a] bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
          <h2 className="text-[15px] font-medium text-[#fafafa]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ApiKeysManagerProps {
  profile: MeResponse;
  workspaceSlug: string;
  initialKeys: ApiKeySummary[];
}

export function ApiKeysManager({
  profile,
  workspaceSlug,
  initialKeys,
}: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeySummary[]>(initialKeys);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showReveal, setShowReveal] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<ApiKeySummary | null>(null);
  const [deletingKey, setDeletingKey] = useState<ApiKeySummary | null>(null);

  const [createName, setCreateName] = useState("");
  const [createAgent, setCreateAgent] = useState(profile.organization?.agent_name ?? "");
  const [createPermissions, setCreatePermissions] = useState<ApiKeyPermission>("read_write");
  const [creating, setCreating] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPermissions, setEditPermissions] = useState<ApiKeyPermission>("read_write");
  const [saving, setSaving] = useState(false);

  const [copied, setCopied] = useState(false);

  const defaultAgent = profile.organization?.agent_name ?? "Primary Agent";

  async function loadKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys");
      if (!res.ok) throw new Error("Failed to load API keys");
      const data = (await res.json()) as { keys: ApiKeySummary[] };
      setKeys(data.keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          agent_name: createAgent.trim() || defaultAgent,
          permissions: createPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create key");

      setShowCreate(false);
      setShowReveal(data.api_key as string);
      setCreateName("");
      setCreatePermissions("read_write");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(key: ApiKeySummary) {
    setEditingKey(key);
    setEditName(key.name);
    setEditPermissions(key.permissions);
  }

  async function handleSaveEdit() {
    if (!editingKey) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/api-keys/${editingKey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          permissions: editPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update key");

      setEditingKey(null);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update key");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingKey) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/api-keys/${deletingKey.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete key");
      }
      setDeletingKey(null);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
    } finally {
      setSaving(false);
    }
  }

  async function copyKey(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">API Keys</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#71717a]">
            Manage secret keys for your agents. Keys are shown once on creation and cannot be
            recovered afterward.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${workspaceSlug}/agents/analytics`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-[#fafafa]"
          >
            Usage
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreateAgent(defaultAgent);
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e4e4e7]"
          >
            <Plus className="h-3.5 w-3.5" />
            Create new API key
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#3f3f46] bg-[#141414] px-4 py-3 text-[13px] text-[#f87171]">
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-[#27272a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0a0a0a] text-[11px] font-medium uppercase tracking-wide text-[#52525b]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">For agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Secret key</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last used</th>
                <th className="px-4 py-3">Created by</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[#71717a]">
                    Loading API keys...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[#71717a]">
                    No API keys yet. Create one to start integrating your agent.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr
                    key={key.id}
                    className={cn(
                      "bg-black transition hover:bg-[#0a0a0a]",
                      key.status === "revoked" && "opacity-50",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-[#fafafa]">{key.name}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{key.agent_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          key.status === "active"
                            ? "bg-[#14532d]/40 text-[#86efac]"
                            : "bg-[#27272a] text-[#71717a]",
                        )}
                      >
                        {key.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717a]">
                      {key.tracking_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#a1a1aa]">
                      {key.secret_masked}
                    </td>
                    <td className="px-4 py-3 text-[#71717a]">{formatDate(key.created_at)}</td>
                    <td className="px-4 py-3 text-[#71717a]">{formatDate(key.last_used_at)}</td>
                    <td className="px-4 py-3 text-[#71717a]">{key.created_by_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">
                      {formatPermission(key.permissions)}
                    </td>
                    <td className="px-4 py-3">
                      {key.status === "active" ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(key)}
                            title="Edit"
                            className="rounded-md p-1.5 text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingKey(key)}
                            title="Delete"
                            className="rounded-md p-1.5 text-[#71717a] hover:bg-[#141414] hover:text-[#f87171]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate ? (
        <Modal title="Create new API key" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">Name</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Production key"
                className="w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#3f3f46]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">For agent</label>
              <select
                value={createAgent}
                onChange={(e) => setCreateAgent(e.target.value)}
                className="w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#3f3f46]"
              >
                <option value={defaultAgent}>{defaultAgent}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">Permissions</label>
              <select
                value={createPermissions}
                onChange={(e) => setCreatePermissions(e.target.value as ApiKeyPermission)}
                className="w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#3f3f46]"
              >
                {PERMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-full px-4 py-2 text-[13px] text-[#71717a] hover:text-[#fafafa]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creating || !createName.trim()}
                onClick={handleCreate}
                className="rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black disabled:opacity-50"
              >
                {creating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Reveal modal */}
      {showReveal ? (
        <Modal title="Save your API key" onClose={() => setShowReveal(null)}>
          <div className="space-y-4">
            <p className="text-[13px] leading-relaxed text-[#71717a]">
              This is the only time your full API key will be displayed. Copy it and store it
              securely — you won&apos;t be able to see it again.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#27272a] bg-[#141414] px-4 py-3">
              <code className="break-all font-mono text-[12px] text-[#fafafa]">{showReveal}</code>
              <button
                type="button"
                onClick={() => copyKey(showReveal)}
                className="shrink-0 text-[#71717a] hover:text-[#fafafa]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowReveal(null)}
              className="w-full rounded-full bg-[#fafafa] py-2.5 text-[13px] font-medium text-black"
            >
              Done
            </button>
          </div>
        </Modal>
      ) : null}

      {/* Edit modal */}
      {editingKey ? (
        <Modal title="Edit API key" onClose={() => setEditingKey(null)}>
          <div className="space-y-4">
            <p className="text-[12px] text-[#52525b]">
              Agent and secret key cannot be changed. Create a new key to rotate credentials.
            </p>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#3f3f46]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">For agent</label>
              <input
                value={editingKey.agent_name}
                disabled
                className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-[#52525b] cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#a1a1aa]">Permissions</label>
              <select
                value={editPermissions}
                onChange={(e) => setEditPermissions(e.target.value as ApiKeyPermission)}
                className="w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#3f3f46]"
              >
                {PERMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="rounded-full px-4 py-2 text-[13px] text-[#71717a] hover:text-[#fafafa]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !editName.trim()}
                onClick={handleSaveEdit}
                className="rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Delete confirm */}
      {deletingKey ? (
        <Modal title="Delete API key" onClose={() => setDeletingKey(null)}>
          <div className="space-y-4">
            <p className="text-[13px] leading-relaxed text-[#71717a]">
              Delete <span className="font-medium text-[#fafafa]">{deletingKey.name}</span>? This
              key will be revoked immediately and can no longer be used for ingestion.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingKey(null)}
                className="rounded-full px-4 py-2 text-[13px] text-[#71717a] hover:text-[#fafafa]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="rounded-full bg-[#7f1d1d] px-4 py-2 text-[13px] font-medium text-[#fecaca] hover:bg-[#991b1b] disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete key"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
