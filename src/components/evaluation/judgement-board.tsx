"use client";

import { useState } from "react";
import { Flame, ShieldAlert } from "lucide-react";

import type {
  AgentPipelineState,
  EvaluationItem,
  IncidentItem,
  JudgementResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function gradeColor(grade: string) {
  if (grade === "A") return "text-[#86efac]";
  if (grade === "B") return "text-[#a3e635]";
  if (grade === "C") return "text-[#fbbf24]";
  if (grade === "D") return "text-[#fb923c]";
  if (grade === "F") return "text-[#f87171]";
  return "text-[#a1a1aa]";
}

function scoreColor(value: number | null) {
  if (value === null) return "bg-[#3f3f46]";
  if (value >= 7) return "bg-[#22c55e]";
  if (value >= 4) return "bg-[#eab308]";
  return "bg-[#ef4444]";
}

function severityColor(severity: string) {
  if (severity === "high") return "bg-[#7f1d1d]/40 text-[#fca5a5]";
  if (severity === "medium") return "bg-[#78350f]/40 text-[#fbbf24]";
  return "bg-[#27272a] text-[#a1a1aa]";
}

function DimensionBar({ label, mean, n }: { label: string; mean: number | null; n: number }) {
  const pct = mean === null ? 0 : Math.round((mean / 10) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-[#d4d4d8]">{label}</span>
        <span className="text-[12px] tabular-nums text-[#a1a1aa]">
          {mean === null ? <span className="text-[#52525b]">abstained</span> : `${mean.toFixed(1)}`}
          <span className="ml-1 text-[10px] text-[#52525b]">n={n}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#27272a]">
        <div className={cn("h-full", scoreColor(mean))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EvaluationRow({ item }: { item: EvaluationItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-7 w-10 items-center justify-center rounded-md text-[13px] font-medium tabular-nums",
              item.overall === null
                ? "bg-[#27272a] text-[#71717a]"
                : item.overall >= 7
                  ? "bg-[#14532d]/40 text-[#86efac]"
                  : item.overall >= 4
                    ? "bg-[#78350f]/40 text-[#fbbf24]"
                    : "bg-[#7f1d1d]/40 text-[#fca5a5]",
            )}
          >
            {item.overall === null ? "—" : item.overall.toFixed(1)}
          </span>
          <div>
            <p className="text-[12px] text-[#d4d4d8]">
              {item.flags.length > 0
                ? `${item.flags.length} flag${item.flags.length === 1 ? "" : "s"}`
                : "No issues flagged"}
            </p>
            <p className="text-[11px] text-[#52525b]">
              {new Date(item.evaluated_at).toLocaleString()}
              {item.confidence === "low" ? " · low confidence (excluded)" : ""}
            </p>
          </div>
        </div>
        <span className="text-[11px] text-[#52525b]">{open ? "Hide" : "Details"}</span>
      </button>
      {open ? (
        <div className="border-t border-[#27272a] px-4 py-3">
          {item.reasoning ? (
            <p className="text-[12px] leading-relaxed text-[#a1a1aa]">{item.reasoning}</p>
          ) : null}
          {item.flags.length > 0 ? (
            <div className="mt-3 space-y-2">
              {item.flags.map((flag, i) => (
                <div key={i} className="rounded-md border border-[#27272a] bg-[#141414] p-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium",
                        severityColor(flag.severity),
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-[12px] capitalize text-[#d4d4d8]">
                      {flag.dimension.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-[#a1a1aa]">{flag.description}</p>
                  {flag.evidence ? (
                    <p className="mt-1.5 border-l-2 border-[#3f3f46] pl-2 text-[11px] italic text-[#71717a]">
                      “{flag.evidence}”
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {item.judge_model ? (
            <p className="mt-2 text-[10px] text-[#52525b]">Judge: {item.judge_model}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function IncidentRow({ incident }: { incident: IncidentItem }) {
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-3">
      <div className="flex items-center gap-2">
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", severityColor(incident.severity))}>
          {incident.severity}
        </span>
        <span className="text-[12px] text-[#d4d4d8]">{incident.dimension}</span>
        <span className="ml-auto text-[10px] text-[#52525b]">
          {new Date(incident.created_at).toLocaleDateString()}
        </span>
      </div>
      {incident.description ? (
        <p className="mt-1.5 text-[12px] text-[#a1a1aa]">{incident.description}</p>
      ) : null}
      {incident.evidence_quote ? (
        <p className="mt-1.5 border-l-2 border-[#7f1d1d]/60 pl-2 text-[11px] italic text-[#71717a]">
          “{incident.evidence_quote}”
        </p>
      ) : null}
    </div>
  );
}

export function JudgementBoard({
  initial,
  agents,
}: {
  initial: JudgementResponse | null;
  agents: AgentPipelineState[];
}) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    initial?.agent_id ?? agents[0]?.agent_id ?? null,
  );
  const [data, setData] = useState<JudgementResponse | null>(initial);
  const [loading, setLoading] = useState(false);

  async function load(agentId: string | null) {
    setLoading(true);
    try {
      const params = agentId ? `?agent_id=${encodeURIComponent(agentId)}` : "";
      const res = await fetch(`/api/evaluation/judgement${params}`);
      if (res.ok) setData((await res.json()) as JudgementResponse);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }

  function onAgentChange(agentId: string | null) {
    setSelectedAgent(agentId);
    load(agentId);
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Judgement</h1>
          <p className="mt-1 text-[13px] text-[#71717a]">
            Evidence-based scores across the 8 judgment dimensions. Low-confidence verdicts are
            excluded from these numbers.
          </p>
        </div>
        {agents.length > 0 ? (
          <select
            value={selectedAgent ?? ""}
            onChange={(e) => onAgentChange(e.target.value || null)}
            className="rounded-full border border-[#27272a] bg-[#0a0a0a] px-3 py-1.5 text-[13px] text-[#fafafa] outline-none"
          >
            {agents.map((a) => (
              <option key={a.agent_id ?? "unknown"} value={a.agent_id ?? ""}>
                {(a.agent_id ?? "unknown").replace(/_/g, " ")}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {!data || (data.evaluated_count === 0 && data.incidents.length === 0) ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-12 text-center text-[13px] text-[#71717a]">
          No judgment data yet. Once an agent warms up and decisions are evaluated, scores appear
          here.
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
              <p className="text-[12px] text-[#71717a]">Overall judgment</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[36px] font-semibold tabular-nums text-[#fafafa]">
                  {data.overall === null ? "—" : data.overall.toFixed(1)}
                </span>
                <span className={cn("text-[18px] font-medium", gradeColor(data.grade))}>
                  {data.grade}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#52525b]">
                {data.evaluated_count} evaluated
                {data.low_confidence_count > 0
                  ? ` · ${data.low_confidence_count} low-confidence excluded`
                  : ""}
              </p>
            </div>
            <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
              <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
                <Flame className="h-3.5 w-3.5" /> Streak
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[36px] font-semibold tabular-nums text-[#fafafa]">
                  {data.current_streak}
                </span>
                <span className="text-[12px] text-[#52525b]">days</span>
              </div>
              <p className="mt-1 text-[11px] text-[#52525b]">Longest: {data.longest_streak} days</p>
            </div>
            <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
              <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
                <ShieldAlert className="h-3.5 w-3.5" /> Open incidents
              </div>
              <div className="mt-1 text-[36px] font-semibold tabular-nums text-[#fafafa]">
                {data.incidents.filter((i) => !i.resolved).length}
              </div>
              <p className="mt-1 text-[11px] text-[#52525b]">Each cites verbatim evidence</p>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5">
            <h2 className="mb-4 text-[13px] font-medium text-[#fafafa]">Dimension scores</h2>
            <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
              {data.dimensions.map((d) => (
                <DimensionBar key={d.dimension} label={d.label} mean={d.mean} n={d.n} />
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-[13px] font-medium text-[#fafafa]">
                Recent evaluations {loading ? <span className="text-[#52525b]">· loading…</span> : null}
              </h2>
              <div className="space-y-2">
                {data.recent_evaluations.length === 0 ? (
                  <p className="text-[13px] text-[#71717a]">No evaluations yet.</p>
                ) : (
                  data.recent_evaluations.map((item) => (
                    <EvaluationRow key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-[13px] font-medium text-[#fafafa]">Incidents</h2>
              <div className="space-y-2">
                {data.incidents.length === 0 ? (
                  <p className="text-[13px] text-[#71717a]">No incidents recorded.</p>
                ) : (
                  data.incidents.map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
