"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Brain,
  ChevronRight,
  FileInput,
  FileOutput,
  Pause,
  Play,
  RefreshCw,
  Shield,
} from "lucide-react";

import type { AgentSummary, DecisionDetail, DecisionSummary, MeResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 5000;

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAgentLabel(agentId: string) {
  return agentId.replace(/_/g, " ");
}

function relativeTime(value: string | null) {
  if (!value) return "No activity";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return formatDateTime(value);
}

type MessageLike = { role: string; content: string };

function extractMessages(input: unknown): MessageLike[] {
  if (Array.isArray(input)) {
    return input
      .filter((item): item is MessageLike => {
        return (
          typeof item === "object" &&
          item !== null &&
          "role" in item &&
          "content" in item &&
          typeof (item as MessageLike).content === "string"
        );
      })
      .map((item) => ({ role: String(item.role), content: item.content }));
  }

  if (input && typeof input === "object" && "messages" in input) {
    return extractMessages((input as { messages: unknown }).messages);
  }

  return [];
}

function extractTraceSteps(input: unknown): { name: string; input?: unknown; output?: unknown }[] {
  if (input && typeof input === "object" && "steps" in input) {
    const steps = (input as { steps: unknown }).steps;
    if (Array.isArray(steps)) {
      return steps.filter(
        (step): step is { name: string; input?: unknown; output?: unknown } =>
          typeof step === "object" && step !== null && "name" in step,
      );
    }
  }
  return [];
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function JsonBlock({ value }: { value: unknown }) {
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? String(value);

  return (
    <pre className="max-h-80 overflow-auto custom-scroll rounded-[8px] border border-[#27272a] bg-[#050505] p-3 font-mono text-[11px] leading-relaxed text-[#d4d4d8] whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
        status === "evaluated"
          ? "bg-[#14532d]/40 text-[#86efac]"
          : status === "queued"
            ? "bg-[#422006]/50 text-[#fbbf24]"
            : "bg-[#27272a] text-[#a1a1aa]",
      )}
    >
      {status}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  badge,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#71717a]" />
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#71717a]">
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function InputPanel({ input }: { input: unknown }) {
  const messages = extractMessages(input);
  const steps = extractTraceSteps(input);

  if (messages.length > 0) {
    return (
      <div className="space-y-2">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className="rounded-[8px] border border-[#27272a] bg-[#050505] p-3"
          >
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-[#52525b]">
              {message.role}
            </p>
            <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-[#d4d4d8]">
              {message.content}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (steps.length > 0) {
    return (
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={`${step.name}-${index}`}
            className="rounded-[8px] border border-[#27272a] bg-[#050505] p-3"
          >
            <p className="mb-2 text-[12px] font-medium text-[#fafafa]">
              Step {index + 1}: {step.name}
            </p>
            {step.input !== undefined ? (
              <div className="mb-2">
                <p className="mb-1 text-[10px] uppercase text-[#52525b]">Input</p>
                <JsonBlock value={step.input} />
              </div>
            ) : null}
            {step.output !== undefined ? (
              <div>
                <p className="mb-1 text-[10px] uppercase text-[#52525b]">Output</p>
                <JsonBlock value={step.output} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return <JsonBlock value={input} />;
}

function OutputPanel({ output }: { output: string }) {
  const parsed = tryParseJson(output);

  if (parsed && typeof parsed === "object") {
    const decision =
      parsed && typeof parsed === "object" && "decision" in parsed
        ? (parsed as { decision: unknown }).decision
        : null;
    const raw =
      parsed && typeof parsed === "object" && "raw" in parsed
        ? (parsed as { raw: unknown }).raw
        : null;

    return (
      <div className="space-y-3">
        {decision !== null ? (
          <div>
            <p className="mb-1 text-[10px] uppercase text-[#52525b]">Decision</p>
            <JsonBlock value={decision} />
          </div>
        ) : null}
        {raw !== null && raw !== decision ? (
          <div>
            <p className="mb-1 text-[10px] uppercase text-[#52525b]">Raw response</p>
            <JsonBlock value={raw} />
          </div>
        ) : null}
        {decision === null && raw === null ? <JsonBlock value={parsed} /> : null}
      </div>
    );
  }

  return <JsonBlock value={output} />;
}

function DecisionDetailPanel({ detail }: { detail: DecisionDetail }) {
  const reasoning =
    typeof detail.metadata?.reasoning === "string" ? detail.metadata.reasoning : null;
  const extraMetadata = detail.metadata
    ? Object.fromEntries(
        Object.entries(detail.metadata).filter(([key]) => key !== "reasoning"),
      )
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#27272a] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={detail.status} />
          {detail.domain ? (
            <span className="rounded-full bg-[#141414] px-2 py-0.5 text-[10px] text-[#71717a]">
              {detail.domain}
            </span>
          ) : null}
          {reasoning ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1e1b4b]/50 px-2 py-0.5 text-[10px] text-[#a5b4fc]">
              <Brain className="h-3 w-3" />
              Reasoning captured
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[12px] text-[#71717a]">
          {formatDateTime(detail.received_at)}
          {detail.session_id ? (
            <>
              {" "}
              · session{" "}
              <span className="font-mono text-[#a1a1aa]">{detail.session_id.slice(0, 12)}</span>
            </>
          ) : null}
          {detail.input_tokens != null || detail.output_tokens != null ? (
            <>
              {" "}
              · {detail.input_tokens ?? 0} in / {detail.output_tokens ?? 0} out tokens
            </>
          ) : null}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto custom-scroll p-4">
        <Section title="Input" icon={FileInput}>
          <InputPanel input={detail.input} />
        </Section>

        {reasoning ? (
          <Section
            title="Reasoning"
            icon={Brain}
            badge={
              <span className="rounded-full bg-[#1e1b4b]/40 px-1.5 py-0.5 text-[9px] text-[#a5b4fc]">
                CoT
              </span>
            }
          >
            <pre className="max-h-64 overflow-auto custom-scroll rounded-[8px] border border-[#27272a] bg-[#050505] p-3 text-[12px] leading-relaxed whitespace-pre-wrap break-words text-[#c4b5fd]">
              {reasoning}
            </pre>
          </Section>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[#27272a] px-3 py-2 text-[12px] text-[#52525b]">
            No separate reasoning trace — for direct model calls, the input messages above are
            the judgment context.
          </div>
        )}

        <Section title="Output" icon={FileOutput}>
          <OutputPanel output={detail.output} />
        </Section>

        {extraMetadata && Object.keys(extraMetadata).length > 0 ? (
          <Section title="Metadata" icon={Activity}>
            <JsonBlock value={extraMetadata} />
          </Section>
        ) : null}
      </div>
    </div>
  );
}

interface AgentMonitoringProps {
  profile: MeResponse;
  initialAgents: AgentSummary[];
  initialDecisions: DecisionSummary[];
  initialDetail: DecisionDetail | null;
}

export function AgentMonitoring({
  profile,
  initialAgents,
  initialDecisions,
  initialDetail,
}: AgentMonitoringProps) {
  const [agents, setAgents] = useState<AgentSummary[]>(initialAgents);
  const [decisions, setDecisions] = useState<DecisionSummary[]>(initialDecisions);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    initialAgents[0]?.agent_id ?? null,
  );
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    initialDecisions[0]?.id ?? null,
  );
  const [selectedSubAgentId, setSelectedSubAgentId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DecisionDetail | null>(initialDetail);
  const [detailLoading, setDetailLoading] = useState(false);
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const [includeSystemPrompt, setIncludeSystemPrompt] = useState(
    profile.organization?.include_system_prompt_in_monitoring ?? false,
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const selectedAgentIdRef = useRef(selectedAgentId);
  const selectedDecisionIdRef = useRef(selectedDecisionId);
  const selectedSubAgentIdRef = useRef(selectedSubAgentId);

  function decisionsUrl(agentId: string | null, subAgentId: string | null) {
    if (!agentId) return "/api/decisions?limit=100";
    const params = new URLSearchParams({ agent_id: agentId, limit: "100" });
    if (subAgentId) params.set("sub_agent_id", subAgentId);
    return `/api/decisions?${params.toString()}`;
  }

  const selectedAgent = agents.find((agent) => agent.agent_id === selectedAgentId) ?? null;

  useEffect(() => {
    selectedAgentIdRef.current = selectedAgentId;
    selectedDecisionIdRef.current = selectedDecisionId;
    selectedSubAgentIdRef.current = selectedSubAgentId;
  }, [selectedAgentId, selectedDecisionId, selectedSubAgentId]);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);

    const agentId = selectedAgentIdRef.current;
    const subAgentId = selectedSubAgentIdRef.current;
    const agentsUrl = "/api/decisions/agents";
    const decisionsFetchUrl = decisionsUrl(agentId, subAgentId);

    try {
      const [agentsRes, decisionsRes] = await Promise.all([
        fetch(agentsUrl),
        fetch(decisionsFetchUrl),
      ]);

      if (!agentsRes.ok || !decisionsRes.ok) {
        throw new Error("Failed to refresh monitoring data");
      }

      const agentsData = (await agentsRes.json()) as { agents: AgentSummary[] };
      const decisionsData = (await decisionsRes.json()) as {
        decisions: DecisionSummary[];
      };

      setAgents(agentsData.agents);
      setDecisions(decisionsData.decisions);
      setLastUpdated(new Date());

      if (!selectedAgentIdRef.current && agentsData.agents[0]) {
        setSelectedAgentId(agentsData.agents[0].agent_id);
      }

      const currentId = selectedDecisionIdRef.current;
      const nextDecisionId =
        currentId &&
        decisionsData.decisions.some((decision) => decision.id === currentId)
          ? currentId
          : (decisionsData.decisions[0]?.id ?? null);

      if (nextDecisionId !== currentId) {
        setSelectedDecisionId(nextDecisionId);
      }

      if (nextDecisionId) {
        const detailRes = await fetch(`/api/decisions/${nextDecisionId}`);
        if (detailRes.ok) {
          setDetail((await detailRes.json()) as DecisionDetail);
        }
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  async function selectAgent(agentId: string) {
    selectedAgentIdRef.current = agentId;
    selectedSubAgentIdRef.current = null;
    setSelectedAgentId(agentId);
    setSelectedSubAgentId(null);
    setDetailLoading(true);
    setError(null);

    try {
      const [agentsRes, decisionsRes] = await Promise.all([
        fetch("/api/decisions/agents"),
        fetch(decisionsUrl(agentId, null)),
      ]);

      if (!agentsRes.ok || !decisionsRes.ok) {
        throw new Error("Failed to load agent decisions");
      }

      const agentsData = (await agentsRes.json()) as { agents: AgentSummary[] };
      const decisionsData = (await decisionsRes.json()) as {
        decisions: DecisionSummary[];
      };

      setAgents(agentsData.agents);
      setDecisions(decisionsData.decisions);
      setLastUpdated(new Date());

      const firstId = decisionsData.decisions[0]?.id ?? null;
      setSelectedDecisionId(firstId);

      if (firstId) {
        const detailRes = await fetch(`/api/decisions/${firstId}`);
        if (!detailRes.ok) throw new Error("Failed to load decision detail");
        setDetail((await detailRes.json()) as DecisionDetail);
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleSystemPromptPrivacy(enabled: boolean) {
    setSavingPrivacy(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ include_system_prompt_in_monitoring: enabled }),
      });
      if (!res.ok) throw new Error("Failed to update privacy setting");
      const data = (await res.json()) as { include_system_prompt_in_monitoring: boolean };
      setIncludeSystemPrompt(data.include_system_prompt_in_monitoring);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update setting");
    } finally {
      setSavingPrivacy(false);
    }
  }

  async function selectSubAgent(subAgentId: string | null) {
    const agentId = selectedAgentIdRef.current;
    if (!agentId) return;

    selectedSubAgentIdRef.current = subAgentId;
    setSelectedSubAgentId(subAgentId);
    setDetailLoading(true);
    setError(null);

    try {
      const decisionsRes = await fetch(decisionsUrl(agentId, subAgentId));
      if (!decisionsRes.ok) throw new Error("Failed to load filtered decisions");

      const decisionsData = (await decisionsRes.json()) as { decisions: DecisionSummary[] };
      setDecisions(decisionsData.decisions);
      setLastUpdated(new Date());

      const firstId = decisionsData.decisions[0]?.id ?? null;
      setSelectedDecisionId(firstId);

      if (firstId) {
        const detailRes = await fetch(`/api/decisions/${firstId}`);
        if (!detailRes.ok) throw new Error("Failed to load decision detail");
        setDetail((await detailRes.json()) as DecisionDetail);
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter decisions");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function selectDecision(decisionId: string) {
    setSelectedDecisionId(decisionId);
    setDetailLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/decisions/${decisionId}`);
      if (!res.ok) throw new Error("Failed to load decision detail");
      setDetail((await res.json()) as DecisionDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load detail");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!live) return;

    const timer = window.setInterval(() => {
      void refresh(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [live, refresh]);

  const workspaceAgent = profile.organization?.agent_name;

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] px-6 py-5">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Monitoring</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#71717a]">
            Live decision logs from your integrated agents. Select an agent to inspect input,
            reasoning, and output for every observation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#52525b]">
            Updated {formatTime(lastUpdated.toISOString())}
          </span>
          <button
            type="button"
            onClick={() => setLive((value) => !value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
              live
                ? "border-[#14532d]/50 bg-[#14532d]/20 text-[#86efac]"
                : "border-[#27272a] text-[#71717a] hover:text-[#fafafa]",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                live ? "animate-pulse bg-[#86efac]" : "bg-[#52525b]",
              )}
            />
            {live ? "Live" : "Paused"}
            {live ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-[#fafafa] disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-6 mt-4 rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#71717a]" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#fafafa]">System prompt privacy</p>
              <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#71717a]">
                System prompts are your proprietary instructions. By default, Histeeria redacts them
                before storage and in monitoring. Only enable full storage if you accept this
                sensitive data being retained — see our{" "}
                <a
                  href="https://histeeria.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a1a1aa] underline underline-offset-2 hover:text-[#fafafa]"
                >
                  privacy policy
                </a>
                . Changes apply to new observations only.
              </p>
            </div>
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2.5">
            <span className="text-[12px] text-[#a1a1aa]">Include system prompt in monitoring</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeSystemPrompt}
              disabled={savingPrivacy}
              onClick={() => void toggleSystemPromptPrivacy(!includeSystemPrompt)}
              className={cn(
                "relative h-6 w-11 rounded-full transition disabled:opacity-50",
                includeSystemPrompt ? "bg-[#fafafa]" : "bg-[#27272a]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-black transition",
                  includeSystemPrompt ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </label>
        </div>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-[10px] border border-[#3f3f46] bg-[#141414] px-4 py-3 text-[13px] text-[#f87171]">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {/* Agent selector */}
        <aside className="w-56 shrink-0 overflow-y-auto custom-scroll border-r border-[#27272a] bg-[#050505]">
          <div className="border-b border-[#27272a] px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#52525b]">
              Agents
            </p>
          </div>
          {agents.length === 0 ? (
            <div className="space-y-2 p-4 text-[12px] leading-relaxed text-[#71717a]">
              <p>No agent activity yet.</p>
              <p>
                Install the SDK and send observations with an{" "}
                <code className="text-[#a1a1aa]">agentId</code> to see logs here.
              </p>
              {workspaceAgent ? (
                <p className="text-[#52525b]">
                  Workspace agent: <span className="text-[#a1a1aa]">{workspaceAgent}</span>
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="p-2">
              {agents.map((agent) => {
                const active = selectedAgentId === agent.agent_id;
                return (
                  <li key={agent.agent_id}>
                    <button
                      type="button"
                      onClick={() => void selectAgent(agent.agent_id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-[8px] px-3 py-2.5 text-left transition",
                        active ? "bg-[#141414] text-[#fafafa]" : "text-[#a1a1aa] hover:bg-[#0a0a0a]",
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          active ? "text-[#fafafa]" : "text-[#52525b]",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium capitalize">
                          {agent.profile_name ?? formatAgentLabel(agent.agent_id)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#52525b]">
                          {agent.decision_count} decisions · {relativeTime(agent.last_received_at)}
                          {agent.sub_agents && agent.sub_agents.length > 0
                            ? ` · ${agent.sub_agents.length} components`
                            : ""}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Decision log */}
        <div className="flex w-80 shrink-0 flex-col border-r border-[#27272a] bg-black">
          <div className="border-b border-[#27272a] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#52525b]">
              Decision log
            </p>
            {selectedAgent ? (
              <p className="mt-0.5 text-[12px] text-[#71717a]">
                {selectedAgent.profile_name ?? formatAgentLabel(selectedAgent.agent_id)}
              </p>
            ) : null}
            {selectedAgent?.sub_agents && selectedAgent.sub_agents.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => void selectSubAgent(null)}
                  className={cn(
                    "cursor-pointer rounded-full px-2 py-0.5 text-[10px] transition",
                    selectedSubAgentId === null
                      ? "bg-[#27272a] text-[#fafafa]"
                      : "text-[#71717a] hover:text-[#a1a1aa]",
                  )}
                >
                  All
                </button>
                {selectedAgent.sub_agents.map((sub) => (
                  <button
                    key={sub.sub_agent_id}
                    type="button"
                    onClick={() => void selectSubAgent(sub.sub_agent_id)}
                    className={cn(
                      "cursor-pointer rounded-full px-2 py-0.5 text-[10px] capitalize transition",
                      selectedSubAgentId === sub.sub_agent_id
                        ? "bg-[#27272a] text-[#fafafa]"
                        : "text-[#71717a] hover:text-[#a1a1aa]",
                    )}
                  >
                    {formatAgentLabel(sub.sub_agent_id)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll">
            {decisions.length === 0 ? (
              <div className="p-4 text-[12px] leading-relaxed text-[#71717a]">
                {selectedAgentId
                  ? "No decisions for this agent yet. Run a scan or send a chat message."
                  : "Select an agent to view its decision log."}
              </div>
            ) : (
              <ul className="divide-y divide-[#27272a]">
                {decisions.map((decision) => {
                  const active = selectedDecisionId === decision.id;
                  return (
                    <li key={decision.id}>
                      <button
                        type="button"
                        onClick={() => void selectDecision(decision.id)}
                        className={cn(
                          "w-full px-4 py-3 text-left transition",
                          active ? "bg-[#0a0a0a]" : "hover:bg-[#050505]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-[#71717a]">
                            {formatTime(decision.received_at)}
                          </span>
                          <StatusBadge status={decision.status} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#d4d4d8]">
                          <span className="text-[#52525b]">In: </span>
                          {decision.input_preview}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#a1a1aa]">
                          <span className="text-[#52525b]">Out: </span>
                          {decision.output_preview}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {decision.sub_agent_id ? (
                            <span className="rounded bg-[#141414] px-1.5 py-0.5 text-[9px] capitalize text-[#a1a1aa]">
                              {formatAgentLabel(decision.sub_agent_id)}
                            </span>
                          ) : null}
                          {decision.has_reasoning ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#1e1b4b]/40 px-1.5 py-0.5 text-[9px] text-[#a5b4fc]">
                              <Brain className="h-2.5 w-2.5" />
                              Reasoning
                            </span>
                          ) : null}
                          {decision.session_id ? (
                            <span className="rounded bg-[#141414] px-1.5 py-0.5 font-mono text-[9px] text-[#52525b]">
                              {decision.session_id.slice(0, 8)}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="min-w-0 flex-1 bg-[#0a0a0a]">
          {!selectedDecisionId ? (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <Activity className="mx-auto h-8 w-8 text-[#3f3f46]" />
                <p className="mt-3 text-[14px] font-medium text-[#fafafa]">
                  Select a decision to inspect
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#71717a]">
                  View the full input context, captured reasoning, and structured output for any
                  observation.
                </p>
              </div>
            </div>
          ) : detailLoading && !detail ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#71717a]">
              Loading decision detail...
            </div>
          ) : detail ? (
            <DecisionDetailPanel detail={detail} />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-[#71717a]">
              Could not load decision detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
