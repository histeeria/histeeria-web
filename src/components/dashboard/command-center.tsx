"use client";

import type { AgentProfileSummary, ApiKeySummary, DecisionSummary, MeResponse } from "@/lib/api";

import { GetStartedChecklist } from "@/components/dashboard/get-started-checklist";

type DecisionStats = {
  total: number;
  queued: number;
  evaluated: number;
  agents: number;
  last_received_at: string | null;
};

interface CommandCenterProps {
  initial?: {
    stats: DecisionStats;
    decisions: DecisionSummary[];
    total: number;
    profiles: AgentProfileSummary[];
    keys: ApiKeySummary[];
  };
  profile: MeResponse;
  workspaceSlug: string;
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
      <p className="text-[11px] font-medium text-[#52525b]">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-[#fafafa]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#71717a]">{trend}</p>
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#27272a] px-4 py-3">
        <h2 className="text-[13px] font-medium text-[#fafafa]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function CommandCenter({ initial, profile, workspaceSlug }: CommandCenterProps) {
  const org = profile.organization;
  const stats = initial?.stats;
  const decisions = initial?.decisions ?? [];
  const profiles = initial?.profiles ?? [];
  const keys = initial?.keys ?? [];

  const hasProfile = profiles.length > 0;
  const hasKey = keys.some((key) => key.status === "active");
  const hasDecisions = decisions.length > 0;
  const setupComplete = hasProfile && hasKey && hasDecisions;
  const primaryProfile = profiles[0] ?? null;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="border-b border-[#27272a] pb-5">
        <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Command Center</h1>
        <p className="mt-1 text-[13px] text-[#71717a]">
          {org?.workspace_name ?? "Workspace"} · {getFormattedDate()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active agents"
          value={stats?.agents ?? profiles.length}
          trend={profiles.length > 0 ? `${profiles.length} profile${profiles.length === 1 ? "" : "s"}` : "No profiles yet"}
        />
        <StatCard
          label="Decisions today"
          value={stats ? stats.total.toLocaleString() : 0}
          trend={hasDecisions ? "Receiving observations" : "Waiting for first decision"}
        />
        <StatCard
          label="Queued"
          value={stats?.queued ?? 0}
          trend="Awaiting evaluation"
        />
        <StatCard label="Evaluated" value={stats?.evaluated ?? 0} trend="Scored decisions" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {!setupComplete ? (
            <Card title="Get started">
              <GetStartedChecklist
                workspaceSlug={workspaceSlug}
                initialProfiles={profiles}
                initialKeys={keys}
                hasDecisions={hasDecisions}
              />
            </Card>
          ) : (
            <Card
              title="Recent activity"
              action={
                <span className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Live
                </span>
              }
            >
              <ul className="divide-y divide-[#27272a]">
                {decisions.map((decision) => (
                  <li
                    key={decision.id}
                    className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-[#141414]/50"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#43d29e]" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#fafafa]">
                          {decision.agent_id ?? primaryProfile?.name ?? "Agent decision"}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-[#71717a]">
                          {decision.output_preview}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#52525b]">
                      {new Date(decision.received_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Inbox">
            <ul className="divide-y divide-[#27272a] text-[12px]">
              <li className="px-4 py-3">
                <p className="font-medium text-[#fafafa]">Workspace created</p>
                <p className="mt-0.5 text-[#71717a]">Welcome to Histeeria.</p>
              </li>
              {!hasProfile ? (
                <li className="px-4 py-3">
                  <p className="font-medium text-[#fafafa]">Create your first agent</p>
                  <p className="mt-0.5 text-[#71717a]">Add an agent profile to begin setup.</p>
                </li>
              ) : !hasKey ? (
                <li className="px-4 py-3">
                  <p className="font-medium text-[#fafafa]">Generate an API key</p>
                  <p className="mt-0.5 text-[#71717a]">
                    Create a key for {primaryProfile?.name} to connect the SDK.
                  </p>
                </li>
              ) : !hasDecisions ? (
                <li className="px-4 py-3">
                  <p className="font-medium text-[#fafafa]">Awaiting integration</p>
                  <p className="mt-0.5 text-[#71717a]">
                    {primaryProfile?.name ?? "Your agent"} hasn&apos;t sent a decision yet.
                  </p>
                </li>
              ) : (
                <li className="px-4 py-3">
                  <p className="font-medium text-[#fafafa]">Integration live</p>
                  <p className="mt-0.5 text-[#71717a]">Your agent is sending decisions.</p>
                </li>
              )}
            </ul>
          </Card>

          <Card title="System health">
            <div className="space-y-3 p-4 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">{primaryProfile?.name ?? "First agent"}</span>
                <span className="flex items-center gap-1.5 text-[#71717a]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${hasDecisions ? "bg-[#43d29e]" : "bg-[#71717a]"}`}
                  />
                  {hasDecisions ? "Active" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
                <span className="text-[#a1a1aa]">Ingestion pipeline</span>
                <span className="flex items-center gap-1.5 text-[#43d29e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
                <span className="text-[#a1a1aa]">Evaluation queue</span>
                <span className="flex items-center gap-1.5 text-[#43d29e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Healthy
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
