"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, CircleDashed, Cpu, Loader2, Play, ScrollText, Shield } from "lucide-react";

import type { AgentPipelineState, EvaluationStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    icon: Shield,
    name: "Tier 1 · Heuristics",
    detail:
      "Deterministic rule-based checks run on every observation. No AI, fully reproducible — the truth floor.",
  },
  {
    icon: Cpu,
    name: "Tier 2 · LLM Judge",
    detail:
      "Flagged and sampled decisions are scored on full context across 8 judgment dimensions. Every flag cites verbatim evidence; thin dimensions are abstained, not guessed.",
  },
  {
    icon: ScrollText,
    name: "Tier 3 · Adjudication",
    detail:
      "Self-consistency re-check plus a frontier model that rules on disputed flags like a senior reviewer. Low-confidence verdicts never move headline scores.",
  },
];

function formatAgent(agentId: string | null) {
  return (agentId ?? "unknown").replace(/_/g, " ");
}

function AgentCard({ agent, reportEvery }: { agent: AgentPipelineState; reportEvery: number }) {
  const warmupPct = agent.warmed_up
    ? 100
    : Math.min(
        100,
        Math.round(
          ((agent.total_observations) / Math.max(1, agent.total_observations + agent.warmup_remaining)) *
            100,
        ),
      );
  const reportProgress = reportEvery - agent.next_report_in;
  const reportPct = Math.min(100, Math.round((reportProgress / Math.max(1, reportEvery)) * 100));

  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-medium capitalize text-[#fafafa]">
          {formatAgent(agent.agent_id)}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            agent.warmed_up
              ? "bg-[#14532d]/40 text-[#86efac]"
              : "bg-[#422006]/50 text-[#fbbf24]",
          )}
        >
          {agent.warmed_up ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <CircleDashed className="h-3 w-3" />
          )}
          {agent.warmed_up ? "Active" : "Warming up"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <p className="text-[#52525b]">Observations</p>
          <p className="text-[15px] font-medium tabular-nums text-[#fafafa]">
            {agent.total_observations}
          </p>
        </div>
        <div>
          <p className="text-[#52525b]">Evaluated</p>
          <p className="text-[15px] font-medium tabular-nums text-[#fafafa]">
            {agent.evaluated_count}
          </p>
        </div>
      </div>

      {!agent.warmed_up ? (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-[#71717a]">
            <span>Warm-up</span>
            <span>{agent.warmup_remaining} more to start judging</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#27272a]">
            <div className="h-full bg-[#fbbf24]" style={{ width: `${warmupPct}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-[#71717a]">
            <span>Next report</span>
            <span>{agent.next_report_in} decisions away</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#27272a]">
            <div className="h-full bg-[#a1a1aa]" style={{ width: `${reportPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function EvaluationEngine({ initialStatus }: { initialStatus: EvaluationStatus | null }) {
  const [status, setStatus] = useState<EvaluationStatus | null>(initialStatus);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/evaluation/status");
      if (res.ok) setStatus((await res.json()) as EvaluationStatus);
    } catch {
      /* keep previous status */
    }
  }

  async function runNow() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluation/run", { method: "POST" });
      if (!res.ok) throw new Error("Failed to run evaluation");
      const data = (await res.json()) as {
        processed: number;
        evaluated: number;
        screened: number;
        warming_up: number;
      };
      setLastRun(
        `Processed ${data.processed} — ${data.evaluated} evaluated, ${data.screened} screened, ${data.warming_up} warming up.`,
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run evaluation");
    } finally {
      setRunning(false);
    }
  }

  const config = status?.config;
  const agents = status?.agents ?? [];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-5">
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#27272a] bg-[#0a0a0a]">
            <Image
              src="/logo-dark.png"
              alt="Histeeria Evaluation Engine"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">
              Evaluation Engine
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#71717a]">
              A three-tier pipeline that scores agent judgment with evidence — no false positives,
              no hallucinated grades. Heuristics screen everything; the LLM judge scores full
              decisions; a senior adjudicator rules on disputes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={running}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {running ? "Running…" : "Run evaluation"}
        </button>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#3f3f46] bg-[#141414] px-4 py-3 text-[13px] text-[#f87171]">
          {error}
        </div>
      ) : null}
      {lastRun ? (
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-4 py-3 text-[13px] text-[#a1a1aa]">
          {lastRun}
        </div>
      ) : null}

      {config && !config.llm_enabled ? (
        <div className="rounded-[10px] border border-[#422006]/60 bg-[#422006]/20 px-4 py-3 text-[13px] text-[#fbbf24]">
          LLM tiers are disabled — set <code className="font-mono">OPENAI_API_KEY</code> on the API
          to enable scoring. Tier 1 heuristics still run on every observation.
        </div>
      ) : null}

      {/* Tiers */}
      <div className="grid gap-3 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier.name} className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-2">
              <tier.icon className="h-4 w-4 text-[#a1a1aa]" />
              <p className="text-[13px] font-medium text-[#fafafa]">{tier.name}</p>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#71717a]">{tier.detail}</p>
          </div>
        ))}
      </div>

      {/* Config */}
      {config ? (
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-4 py-3">
          <div className="grid grid-cols-2 gap-y-2 text-[12px] sm:grid-cols-4">
            <Stat label="Warm-up" value={`${config.warmup_min_decisions} obs`} />
            <Stat label="Report every" value={`${config.report_every} evals`} />
            <Stat label="Clean sample" value={`1 in ${config.clean_sample_rate}`} />
            <Stat label="Incident <" value={`${config.incident_threshold}`} />
            <Stat label="Streak ≥" value={`${config.streak_threshold}`} />
            <Stat label="Judge" value={config.judge_model} />
            <Stat label="Adjudicator" value={config.adjudicator_model} />
            <Stat label="Pending" value={`${status?.pending_evaluations ?? 0}`} />
          </div>
        </div>
      ) : null}

      {/* Agents */}
      <div>
        <h2 className="mb-3 text-[13px] font-medium text-[#fafafa]">Agents in the pipeline</h2>
        {agents.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-10 text-center text-[13px] text-[#71717a]">
            No agent activity yet. Send observations via the SDK to start the pipeline.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.agent_id ?? "unknown"}
                agent={agent}
                reportEvery={config?.report_every ?? 200}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#52525b]">{label}</p>
      <p className="font-medium text-[#d4d4d8]">{value}</p>
    </div>
  );
}
