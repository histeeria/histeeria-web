"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import type { SettingsResponse } from "@/lib/api";
import { DOMAINS } from "@/lib/api";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "account", label: "Account" },
  { id: "workspace", label: "Workspace" },
  { id: "agent", label: "Agent" },
  { id: "team", label: "Team" },
  { id: "evaluation", label: "Evaluation" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface SettingsManagerProps {
  initial: SettingsResponse;
  workspaceSlug: string;
}

export function SettingsManager({ initial, workspaceSlug }: SettingsManagerProps) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<TabId>("account");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initial.account.full_name ?? "");
  const [role, setRole] = useState(initial.account.role ?? "");
  const [workspaceName, setWorkspaceName] = useState(initial.workspace.workspace_name);
  const [agentName, setAgentName] = useState(initial.workspace.agent_name);
  const [domainName, setDomainName] = useState(initial.workspace.domain_name);
  const [agentDescription, setAgentDescription] = useState(initial.workspace.agent_description ?? "");
  const [teamSize, setTeamSize] = useState(initial.team.team_size ?? "");
  const [teamMembers, setTeamMembers] = useState(initial.team.team_members ?? "");
  const [includeSystemPrompt, setIncludeSystemPrompt] = useState(
    initial.workspace.include_system_prompt_in_monitoring,
  );

  async function save(section: TabId) {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: Record<string, unknown> = {};
    if (section === "account") {
      payload.full_name = fullName;
      payload.role = role;
    }
    if (section === "workspace") {
      payload.workspace_name = workspaceName;
      payload.include_system_prompt_in_monitoring = includeSystemPrompt;
    }
    if (section === "agent") {
      payload.agent_name = agentName;
      payload.domain_name = domainName;
      payload.agent_description = agentDescription;
    }
    if (section === "team") {
      payload.team_size = teamSize;
      payload.team_members = teamMembers;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to save settings");
      }
      const updated = (await res.json()) as SettingsResponse;
      setData(updated);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div className="border-b border-[#27272a] pb-5">
        <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Settings</h1>
        <p className="mt-1 text-[13px] text-[#71717a]">
          Manage your account, workspace, agent defaults, team, and evaluation preferences.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#27272a] pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-[13px] transition",
              tab === t.id
                ? "bg-[#27272a] text-[#fafafa]"
                : "text-[#71717a] hover:bg-[#141414] hover:text-[#a1a1aa]",
            )}
          >
            {t.label}
          </button>
        ))}
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

      {tab === "account" ? (
        <Section title="Account" onSave={() => save("account")} saving={saving}>
          <Field label="Email">
            <input
              readOnly
              value={data.account.email}
              className="w-full cursor-not-allowed rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#71717a]"
            />
          </Field>
          <Field label="Full name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Field label="Role">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Engineering Lead"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Field label="Current plan">
            <div className="flex items-center justify-between rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2">
              <span className="text-[13px] capitalize text-[#fafafa]">{data.account.plan}</span>
              <Link
                href="https://histeeria.com/pricing"
                target="_blank"
                className="inline-flex cursor-pointer items-center gap-1 text-[12px] text-[#a1a1aa] hover:text-[#fafafa]"
              >
                Upgrade <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </Field>
        </Section>
      ) : null}

      {tab === "workspace" ? (
        <Section title="Workspace" onSave={() => save("workspace")} saving={saving}>
          <Field label="Workspace name">
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Field label="Workspace slug">
            <input
              readOnly
              value={data.workspace.workspace_slug ?? workspaceSlug}
              className="w-full cursor-not-allowed rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 font-mono text-[13px] text-[#71717a]"
            />
          </Field>
          <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
            <input
              type="checkbox"
              checked={includeSystemPrompt}
              onChange={(e) => setIncludeSystemPrompt(e.target.checked)}
              className="mt-0.5 cursor-pointer"
            />
            <div>
              <p className="text-[13px] font-medium text-[#fafafa]">
                Include system prompt in monitoring
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#71717a]">
                When off, system prompts are redacted before storage. Your secret sauce stays
                private by default.
              </p>
            </div>
          </label>
        </Section>
      ) : null}

      {tab === "agent" ? (
        <Section title="Agent defaults" onSave={() => save("agent")} saving={saving}>
          <Field label="Default agent name">
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Field label="Domain">
            <select
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className="w-full cursor-pointer rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agent description">
            <textarea
              rows={4}
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
        </Section>
      ) : null}

      {tab === "team" ? (
        <Section title="Team" onSave={() => save("team")} saving={saving}>
          <Field label="Team size">
            <input
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 1-10"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Field label="Team members">
            <textarea
              rows={3}
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              placeholder="Names or emails of collaborators"
              className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
          </Field>
          <Link
            href={`/${workspaceSlug}/team/invite`}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-[#a1a1aa] hover:text-[#fafafa]"
          >
            Invite members <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Section>
      ) : null}

      {tab === "evaluation" ? (
        <div className="space-y-4 rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
          <h2 className="text-[15px] font-medium text-[#fafafa]">Evaluation engine</h2>
          <p className="text-[13px] text-[#71717a]">
            These thresholds are configured on the server. Contact support to change model tiers or
            cadence on paid plans.
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat label="Warm-up" value={`${data.evaluation.warmup_min_decisions} decisions`} />
            <Stat label="Report every" value={`${data.evaluation.report_every} evals`} />
            <Stat label="Incident threshold" value={String(data.evaluation.incident_threshold)} />
            <Stat label="Streak threshold" value={String(data.evaluation.streak_threshold)} />
            <Stat label="Judge model" value={data.evaluation.judge_model} />
            <Stat label="Adjudicator" value={data.evaluation.adjudicator_model} />
            <Stat label="LLM enabled" value={data.evaluation.llm_enabled ? "Yes" : "No"} />
          </dl>
          <Link
            href={`/${workspaceSlug}/evaluation/engine`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#fafafa] hover:bg-[#141414]"
          >
            Open evaluation engine <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4 rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium text-[#fafafa]">{title}</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] text-[#a1a1aa]">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2">
      <dt className="text-[11px] text-[#52525b]">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-[#d4d4d8]">{value}</dd>
    </div>
  );
}
