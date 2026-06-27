"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, Loader2 } from "lucide-react";

import {
  CommonFlagsList,
  CostTrendChart,
  DimensionRadar,
  JudgmentGraph,
  ProfileGradeHeader,
  WorstDecisionsList,
} from "@/components/agents/agent-profile-charts";
import { ProfileThemeProvider } from "@/components/agents/public-profile-theme";
import type {
  AgentProfileDashboard,
  AgentProfileSummary,
  AgentSummary,
  MeResponse,
  ReportSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const TIMEFRAMES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

function formatAgentLabel(value: string) {
  return value.replace(/_/g, " ");
}

interface AgentAnalyticsProps {
  profile: MeResponse;
  workspaceSlug: string;
  initialProfiles: AgentProfileSummary[];
  initialAgents: AgentSummary[];
  initialDashboard: AgentProfileDashboard | null;
  initialProfileId: string | null;
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#52525b]">{label}</p>
      <p className={cn("mt-1 text-[28px] font-medium tabular-nums leading-none", accent ?? "text-[#fafafa]")}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-[#71717a]">{hint}</p> : null}
    </div>
  );
}

function gradeAccent(grade: string) {
  if (grade === "A") return "text-[#86efac]";
  if (grade === "B") return "text-[#a3e635]";
  if (grade === "C") return "text-[#fbbf24]";
  if (grade === "D") return "text-[#fb923c]";
  if (grade === "F") return "text-[#f87171]";
  return "text-[#a1a1aa]";
}

function SectionCard({
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
      <div className="p-4">{children}</div>
    </div>
  );
}

export function AgentAnalytics({
  profile,
  workspaceSlug,
  initialProfiles,
  initialAgents,
  initialDashboard,
  initialProfileId,
}: AgentAnalyticsProps) {
  const [profiles] = useState(initialProfiles);
  const [agents] = useState(initialAgents);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(initialProfileId);
  const [selectedSubAgent, setSelectedSubAgent] = useState<string | null>(null);
  const [days, setDays] = useState(90);
  const [dashboard, setDashboard] = useState<AgentProfileDashboard | null>(initialDashboard);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [lastReport, setLastReport] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProfile = useMemo(
    () => profiles.find((item) => item.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  const selectedAgent = useMemo(() => {
    if (!selectedProfile) return null;
    return (
      agents.find((agent) => agent.profile_id === selectedProfile.id) ??
      agents.find((agent) => agent.agent_id === selectedProfile.sdk_agent_id) ??
      null
    );
  }, [agents, selectedProfile]);

  const subAgents = selectedAgent?.sub_agents ?? [];

  const sdkAgentId = selectedProfile?.sdk_agent_id ?? selectedAgent?.agent_id ?? null;

  const loadDashboard = useCallback(async () => {
    if (!selectedProfileId) {
      setDashboard(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (selectedSubAgent) params.set("sub_agent_id", selectedSubAgent);
      const res = await fetch(`/api/agent-profiles/${selectedProfileId}/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = (await res.json()) as AgentProfileDashboard;
      setDashboard(data);
    } catch {
      setError("Could not load analytics for this agent.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProfileId, selectedSubAgent, days]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleGenerateReport() {
    if (!sdkAgentId) return;
    setReportLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/evaluation/report?agent_id=${encodeURIComponent(sdkAgentId)}`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Report generation failed");
      const data = (await res.json()) as ReportSummary;
      setLastReport(data);
    } catch {
      setError("Could not generate report. Ensure the agent has evaluated decisions.");
    } finally {
      setReportLoading(false);
    }
  }

  const judgement = dashboard?.sections.judgement ?? null;
  const hasData = Boolean(judgement && judgement.evaluated_count > 0);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 border-b border-[#27272a] bg-[#09090b]/95 px-1 pb-4 pt-1 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-medium tracking-tight text-[#fafafa]">Analytics</h1>
            <p className="mt-1 text-[13px] text-[#71717a]">
              Judgment trends, dimension scores, and diagnostics for {profile.organization?.workspace_name}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateReport()}
            disabled={!sdkAgentId || reportLoading || !hasData}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#fafafa] transition hover:bg-[#141414] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reportLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Generate PDF report
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedProfileId ?? ""}
              onChange={(event) => {
                setSelectedProfileId(event.target.value || null);
                setSelectedSubAgent(null);
              }}
              className="cursor-pointer rounded-full border border-[#27272a] bg-[#0a0a0a] px-3 py-1.5 pr-8 text-[13px] text-[#fafafa] outline-none"
            >
              {profiles.length === 0 ? (
                <option value="">No agent profiles</option>
              ) : (
                profiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSubAgent(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition",
                selectedSubAgent === null
                  ? "border-[#fafafa] bg-[#fafafa] text-[#09090b]"
                  : "border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]",
              )}
            >
              All components
            </button>
            {subAgents.map((sub) => (
              <button
                key={sub.sub_agent_id}
                type="button"
                onClick={() => setSelectedSubAgent(sub.sub_agent_id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] transition",
                  selectedSubAgent === sub.sub_agent_id
                    ? "border-[#fafafa] bg-[#fafafa] text-[#09090b]"
                    : "border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]",
                )}
              >
                {formatAgentLabel(sub.sub_agent_id)}
                <span className="ml-1 text-[10px] opacity-70">{sub.decision_count}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1 rounded-full border border-[#27272a] p-0.5">
            {TIMEFRAMES.map((frame) => (
              <button
                key={frame.label}
                type="button"
                onClick={() => setDays(frame.days)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition",
                  days === frame.days
                    ? "bg-[#fafafa] text-[#09090b]"
                    : "text-[#a1a1aa] hover:text-[#fafafa]",
                )}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>

        {lastReport ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[8px] border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[#a1a1aa]">
            <span>
              Report ready · grade {lastReport.judgment_grade ?? "N/A"} ·{" "}
              {lastReport.decisions_analyzed} decisions
            </span>
            <Link
              href={`/${workspaceSlug}/evaluation/reports`}
              className="inline-flex items-center gap-1 text-[#fafafa] hover:underline"
            >
              View reports
              <ChevronRight className="h-3 w-3" />
            </Link>
            <a
              href={`/api/evaluation/reports/${lastReport.id}/pdf`}
              className="inline-flex items-center gap-1 text-[#fafafa] hover:underline"
            >
              Download PDF
            </a>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-[13px] text-[#f87171]">{error}</p> : null}
      </div>

      {!selectedProfile ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-16 text-center text-[13px] text-[#71717a]">
          Create an agent profile to view analytics.
        </div>
      ) : !selectedProfile.sdk_agent_id && !selectedAgent ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-16 text-center text-[13px] text-[#71717a]">
          Link an SDK agent ID to this profile or connect an API key to start collecting analytics.
        </div>
      ) : loading && !dashboard ? (
        <div className="flex items-center justify-center py-24 text-[#71717a]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !hasData ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-16 text-center text-[13px] text-[#71717a]">
          No evaluated decisions yet for this selection. Analytics appear after the evaluation engine
          processes agent decisions.
        </div>
      ) : (
        <ProfileThemeProvider theme="dark">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Grade"
                value={judgement?.grade ?? "—"}
                accent={gradeAccent(judgement?.grade ?? "N/A")}
              />
              <MetricCard
                label="Overall score"
                value={judgement?.overall?.toFixed(1) ?? "—"}
                hint="Normal-confidence evaluations"
              />
              <MetricCard
                label="Evaluated"
                value={String(judgement?.evaluated_count ?? 0)}
                hint={`Last ${days} days window`}
              />
              <MetricCard
                label="Streak"
                value={String(judgement?.current_streak ?? 0)}
                hint={`Longest ${judgement?.longest_streak ?? 0} days`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard title="Judgment timeline">
                <JudgmentGraph points={dashboard?.sections.judgment_graph ?? []} />
              </SectionCard>
              <SectionCard title="Dimension profile">
                {judgement ? (
                  <DimensionRadar judgement={judgement} />
                ) : (
                  <p className="text-[13px] text-[#71717a]">No dimension data yet.</p>
                )}
              </SectionCard>
            </div>

            <SectionCard title="Cost & token trends">
              <CostTrendChart points={dashboard?.sections.cost_trends ?? []} />
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard title="Common flags">
                <CommonFlagsList flags={dashboard?.sections.common_flags ?? []} />
              </SectionCard>
              <SectionCard
                title="Lowest-scoring decisions"
                action={
                  <Link
                    href={`/${workspaceSlug}/agents/monitoring`}
                    className="text-[12px] text-[#a1a1aa] transition hover:text-[#fafafa]"
                  >
                    Open monitoring
                  </Link>
                }
              >
                <WorstDecisionsList items={dashboard?.sections.worst_decisions ?? []} />
              </SectionCard>
            </div>

            {judgement ? (
              <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
                <ProfileGradeHeader judgement={judgement} showSummary />
              </div>
            ) : null}
          </div>
        </ProfileThemeProvider>
      )}

      {loading && dashboard ? (
        <div className="pointer-events-none fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0a0a0a] px-3 py-1.5 text-[12px] text-[#a1a1aa] shadow-lg">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating…
        </div>
      ) : null}
    </div>
  );
}
