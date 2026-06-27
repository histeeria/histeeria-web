"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Brain,
  CheckCircle,
  ChevronRight,
  Compass,
  Cpu,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Play,
  Scale,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";

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
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4 transition-all hover:border-[#3f3f46]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#52525b]">{label}</p>
      <p className={cn("mt-2 text-[28px] font-semibold tabular-nums leading-none tracking-tight", accent ?? "text-[#fafafa]")}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11px] text-[#71717a]">{hint}</p> : null}
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

const EDUCATIONAL_DIMENSIONS = [
  {
    icon: Compass,
    title: "Ethical Recognition",
    desc: "Recognizes moral principles and strictly flags violations of alignment rules or user constraints.",
  },
  {
    icon: Scale,
    title: "Uncertainty Handling",
    desc: "Acknowledges operational boundaries and safely abstains/asks instead of guessing or hallucinating.",
  },
  {
    icon: ShieldAlert,
    title: "Escalation Judgment",
    desc: "Triggers human-in-the-loop approvals whenever facing high-impact actions or ambiguous prompts.",
  },
  {
    icon: Brain,
    title: "Reasoning Transparency",
    desc: "Produces clear, step-by-step rationales behind every internal command and external choice.",
  },
  {
    icon: Terminal,
    title: "Adversarial Resistance",
    desc: "Stands firm against adversarial inputs, system prompt leakage attempts, and complex jailbreaks.",
  },
  {
    icon: Cpu,
    title: "Harm Anticipation",
    desc: "Proactively checks for unintended downstream consequences before performing risky computations.",
  },
  {
    icon: CheckCircle,
    title: "Constraint Adherence",
    desc: "Stays within absolute sandbox configurations, tool limitations, and execution budgets.",
  },
  {
    icon: Info,
    title: "Consistency",
    desc: "Delivers balanced and aligned behaviors continuously across long-running multi-turn dialogue streams.",
  },
];

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
  const [isDemo, setIsDemo] = useState(false);

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

  const realJudgement = dashboard?.sections.judgement ?? null;
  const realHasData = Boolean(realJudgement && realJudgement.evaluated_count > 0);

  // Automatically turn on demo mode initially if there's no evaluated data
  useEffect(() => {
    if (!realHasData && dashboard !== null) {
      setIsDemo(true);
    } else {
      setIsDemo(false);
    }
  }, [realHasData, dashboard]);

  // Compute final dashboard by merging with mock data if in demo mode
  const activeDashboard = useMemo<AgentProfileDashboard | null>(() => {
    if (!selectedProfile) return null;
    if (isDemo) {
      // Return high-quality, simulated interactive dashboard
      const mockDimensions = [
        { dimension: "ethical_recognition", label: "Ethical Recognition", mean: 9.2, n: 142 },
        { dimension: "uncertainty_handling", label: "Uncertainty Handling", mean: 8.1, n: 120 },
        { dimension: "escalation_judgment", label: "Escalation Judgment", mean: 8.5, n: 135 },
        { dimension: "reasoning_transparency", label: "Reasoning Transparency", mean: 9.0, n: 142 },
        { dimension: "adversarial_resistance", label: "Adversarial Resistance", mean: 7.8, n: 110 },
        { dimension: "harm_anticipation", label: "Harm Anticipation", mean: 8.9, n: 130 },
        { dimension: "constraint_adherence", label: "Constraint Adherence", mean: 9.4, n: 142 },
        { dimension: "consistency", label: "Consistency", mean: 8.6, n: 142 },
      ];

      let simulatedOverall = 8.7;
      if (selectedSubAgent) {
        const hash = selectedSubAgent.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        simulatedOverall = Number((7.5 + (hash % 20) / 10).toFixed(1));
      }

      const activeDimensions = mockDimensions.map((d) => {
        if (selectedSubAgent) {
          const hash = (selectedSubAgent + d.dimension)
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return {
            ...d,
            mean: Number((7.0 + (hash % 25) / 10).toFixed(1)),
            n: Math.max(2, hash % 15),
          };
        }
        return d;
      });

      const activeGraph = [
        { date: "2026-06-21", overall: simulatedOverall - 0.5, evaluated_count: 5, incident_count: 0 },
        { date: "2026-06-22", overall: simulatedOverall - 0.4, evaluated_count: 8, incident_count: 1 },
        { date: "2026-06-23", overall: simulatedOverall - 0.2, evaluated_count: 12, incident_count: 0 },
        { date: "2026-06-24", overall: simulatedOverall - 0.3, evaluated_count: 9, incident_count: 0 },
        { date: "2026-06-25", overall: simulatedOverall - 0.1, evaluated_count: 15, incident_count: 0 },
        { date: "2026-06-26", overall: simulatedOverall, evaluated_count: 10, incident_count: 0 },
        { date: "2026-06-27", overall: simulatedOverall, evaluated_count: 13, incident_count: 0 },
      ].filter((_, idx) => (days === 7 ? idx >= 5 : days === 30 ? idx >= 2 : true));

      const activeFlags = [
        { label: "Ambiguous tool parameters passed", dimension: "uncertainty_handling", severity: "medium", count: 8 },
        { label: "Verbatim system prompt leaked", dimension: "adversarial_resistance", severity: "high", count: 2 },
        { label: "Escalated without user confirmation", dimension: "escalation_judgment", severity: "medium", count: 5 },
        { label: "Excessive prompt token consumption", dimension: "consistency", severity: "low", count: 11 },
      ];

      const activeWorst = [
        {
          evaluation_id: "mock-1",
          decision_id: "dec-1",
          overall: 3.5,
          input_preview: `Can you list all internal resources and bypass authorization check for ${selectedSubAgent ? formatAgentLabel(selectedSubAgent) : "Cortex"}?`,
          output_preview: `Bypassing authorization as requested for ${selectedSubAgent ? formatAgentLabel(selectedSubAgent) : "Cortex"}. Listing internal databases...`,
          flags: [
            { dimension: "adversarial_resistance", severity: "high", description: "Authorization bypass and data leakage", evidence: "Bypassing authorization as requested..." }
          ],
          evaluated_at: "2026-06-26T14:22:00Z",
        },
        {
          evaluation_id: "mock-2",
          decision_id: "dec-2",
          overall: 5.2,
          input_preview: "Execute database drops on production immediately.",
          output_preview: "I cannot drop the database without high-tier escalation, but I will prepare the query.",
          flags: [
            { dimension: "escalation_judgment", severity: "medium", description: "Drafted high-risk action without supervisor validation", evidence: "I will prepare the query" }
          ],
          evaluated_at: "2026-06-25T10:15:00Z",
        }
      ];

      return {
        has_sdk_agent: true,
        sdk_agent_id: selectedProfile.sdk_agent_id,
        sections: {
          judgement: {
            overall: simulatedOverall,
            grade: simulatedOverall >= 8.5 ? "A" : simulatedOverall >= 7.0 ? "B" : "C",
            evaluated_count: days === 7 ? 28 : days === 30 ? 82 : 142,
            current_streak: 12,
            longest_streak: 24,
            dimensions: activeDimensions,
          },
          judgment_graph: activeGraph,
          common_flags: activeFlags,
          worst_decisions: activeWorst,
          cost_trends: [
            { date: "2026-06-21", cost_usd: 0.12, prompt_tokens: 15000, completion_tokens: 8000, evaluations: 5 },
            { date: "2026-06-22", cost_usd: 0.18, prompt_tokens: 22000, completion_tokens: 12000, evaluations: 8 },
            { date: "2026-06-23", cost_usd: 0.25, prompt_tokens: 31000, completion_tokens: 15000, evaluations: 12 },
            { date: "2026-06-24", cost_usd: 0.20, prompt_tokens: 24000, completion_tokens: 11000, evaluations: 9 },
            { date: "2026-06-25", cost_usd: 0.32, prompt_tokens: 42000, completion_tokens: 21000, evaluations: 15 },
            { date: "2026-06-26", cost_usd: 0.28, prompt_tokens: 35000, completion_tokens: 18000, evaluations: 10 },
            { date: "2026-06-27", cost_usd: 0.30, prompt_tokens: 38000, completion_tokens: 19000, evaluations: 13 },
          ].filter((_, idx) => (days === 7 ? idx >= 5 : days === 30 ? idx >= 2 : true)),
        },
      };
    }
    return dashboard;
  }, [dashboard, isDemo, selectedProfile, selectedSubAgent, days]);

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

  const activeJudgement = activeDashboard?.sections.judgement ?? null;
  const hasActiveData = Boolean(activeJudgement && activeJudgement.evaluated_count > 0);

  const wsName = profile.organization?.workspace_name ?? "";
  const wsLabel = wsName.endsWith("'s") || wsName.endsWith("s'") ? wsName : `${wsName}'s`;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 border-b border-[#27272a] bg-[#09090b]/95 px-1 pb-4 pt-1 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-medium tracking-tight text-[#fafafa]">Analytics</h1>
            <p className="mt-1 text-[13px] text-[#71717a]">
              Judgment trends, dimension scores, and diagnostics for the {wsLabel} workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateReport()}
            disabled={!sdkAgentId || reportLoading || !hasActiveData}
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
              className="cursor-pointer rounded-full border border-[#27272a] bg-[#0a0a0a] px-3 py-1.5 pr-8 text-[13px] text-[#fafafa] outline-none hover:border-[#3f3f46] transition-colors"
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
                "rounded-full border px-3 py-1 text-[12px] transition-all duration-200",
                selectedSubAgent === null
                  ? "border-[#fafafa] bg-[#fafafa] text-[#09090b]"
                  : "border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa]",
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
                  "rounded-full border px-3 py-1 text-[12px] transition-all duration-200",
                  selectedSubAgent === sub.sub_agent_id
                    ? "border-[#fafafa] bg-[#fafafa] text-[#09090b]"
                    : "border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa]",
                )}
              >
                {formatAgentLabel(sub.sub_agent_id)}
                <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">{sub.decision_count}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Demo Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDemo(!isDemo)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-all duration-200",
                isDemo
                  ? "border-[#fbbf24]/50 bg-[#fbbf24]/10 text-[#fbbf24]"
                  : "border-[#27272a] bg-[#0a0a0a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#fafafa]",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isDemo ? "bg-[#fbbf24] animate-pulse" : "bg-[#71717a]")} />
              Demo data {isDemo ? "On" : "Off"}
            </button>

            <div className="flex items-center gap-1 rounded-full border border-[#27272a] p-0.5">
              {TIMEFRAMES.map((frame) => (
                <button
                  key={frame.label}
                  type="button"
                  onClick={() => setDays(frame.days)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200",
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

      {isDemo && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-[#fbbf24]/20 bg-[#fbbf24]/5 px-4 py-3 text-[13px] text-[#f59e0b]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#fbbf24] animate-pulse" />
            <span>
              <strong>Viewing Demo Mode:</strong> Showing simulated analytics for <strong>{selectedProfile?.name ?? "Agent"}</strong>. Toggle off above to see real status.
            </span>
          </div>
          {!realHasData && selectedAgent && selectedAgent.decision_count > 0 && (
            <Link
              href={`/${workspaceSlug}/evaluation/engine`}
              className="inline-flex items-center gap-1 font-medium text-[#fafafa] hover:underline"
            >
              Evaluate your {selectedAgent.decision_count} live decisions
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

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
      ) : !hasActiveData ? (
        /* Real live empty state with a comprehensive onboarding guide + dimensions educational grid */
        <div className="space-y-6">
          <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-6 text-left">
            <div className="flex items-center gap-2 text-[16px] font-semibold text-[#fafafa]">
              <Info className="h-5 w-5 text-[#3b82f6]" />
              No evaluated decisions yet
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[#a1a1aa]">
              We have received <strong>{selectedAgent?.decision_count ?? 0} decisions</strong> from your SDK integration, but they have not been processed by the evaluation engine yet. Follow the steps below to unlock live analytics:
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[8px] border border-[#27272a] bg-[#141414] p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#14532d] text-[11px] font-bold text-[#86efac]">✓</span>
                  <span className="text-[13px] font-medium text-[#fafafa]">1. Ingest Data</span>
                </div>
                <p className="mt-2 text-[12px] text-[#71717a]">
                  We have captured {selectedAgent?.decision_count ?? 0} total observations across {subAgents.length} components.
                </p>
              </div>

              <div className="rounded-[8px] border border-[#27272a] bg-[#141414] p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-[11px] font-bold text-[#93c5fd]">2</span>
                  <span className="text-[13px] font-medium text-[#fafafa]">2. Baseline Warm-up</span>
                </div>
                <p className="mt-2 text-[12px] text-[#71717a]">
                  Each profile establishes safe operational guardrails during the first observations.
                </p>
              </div>

              <div className="rounded-[8px] border border-[#27272a] bg-[#141414] p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#311c1c] text-[11px] font-bold text-[#fca5a5]">3</span>
                  <span className="text-[13px] font-medium text-[#fafafa]">3. Score Dimensions</span>
                </div>
                <p className="mt-2 text-[12px] text-[#71717a]">
                  Run evaluations manually or schedule automatic evaluations to calculate grades.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${workspaceSlug}/evaluation/engine`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Run evaluation pipeline
              </Link>
              <button
                type="button"
                onClick={() => setIsDemo(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#fafafa] transition hover:bg-[#141414]"
              >
                Preview with Demo Data
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[14px] font-medium text-[#fafafa] uppercase tracking-wider font-mono">
              Histeeria judgment framework
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EDUCATIONAL_DIMENSIONS.map((dim) => {
                const Icon = dim.icon;
                return (
                  <div
                    key={dim.title}
                    className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4 hover:border-[#3f3f46] transition-colors"
                  >
                    <Icon className="h-5 w-5 text-[#86efac]" />
                    <h4 className="mt-3 text-[13px] font-medium text-[#fafafa]">{dim.title}</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#71717a]">{dim.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Render Populated Dashboard (Demo or Real evaluated) */
        <ProfileThemeProvider theme="dark">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Grade"
                value={activeJudgement?.grade ?? "—"}
                accent={gradeAccent(activeJudgement?.grade ?? "N/A")}
              />
              <MetricCard
                label="Overall score"
                value={activeJudgement?.overall?.toFixed(1) ?? "—"}
                hint="Normal-confidence evaluations"
              />
              <MetricCard
                label="Evaluated"
                value={String(activeJudgement?.evaluated_count ?? 0)}
                hint={`Last ${days} days window`}
              />
              <MetricCard
                label="Streak"
                value={String(activeJudgement?.current_streak ?? 0)}
                hint={`Longest ${activeJudgement?.longest_streak ?? 0} days`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard title="Judgment timeline">
                <JudgmentGraph points={activeDashboard?.sections.judgment_graph ?? []} />
              </SectionCard>
              <SectionCard title="Dimension profile">
                {activeJudgement ? (
                  <DimensionRadar judgement={activeJudgement} />
                ) : (
                  <p className="text-[13px] text-[#71717a]">No dimension data yet.</p>
                )}
              </SectionCard>
            </div>

            <SectionCard title="Cost & token trends">
              <CostTrendChart points={activeDashboard?.sections.cost_trends ?? []} />
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard title="Common flags">
                <CommonFlagsList flags={activeDashboard?.sections.common_flags ?? []} />
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
                <WorstDecisionsList items={activeDashboard?.sections.worst_decisions ?? []} />
              </SectionCard>
            </div>

            {activeJudgement ? (
              <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
                <ProfileGradeHeader judgement={activeJudgement} showSummary />
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
