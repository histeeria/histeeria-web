"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  CommonFlagItem,
  CostTrendPoint,
  GraphPoint,
  ProfileDashboardJudgement,
  WorstDecisionItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  line: "#fafafa",
  grid: "#27272a",
  radar: "#86efac",
  cost: "#60a5fa",
  tokens: "#a78bfa",
};

export function JudgmentGraph({ points }: { points: GraphPoint[] }) {
  if (points.length === 0) {
    return <EmptyChart message="No judgment history yet. Evaluations will appear here over 90 days." />;
  }

  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: p.overall,
    incidents: p.incident_count,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#0a0a0a",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={CHART_COLORS.line}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#fafafa" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DimensionRadar({ judgement }: { judgement: ProfileDashboardJudgement }) {
  const data = judgement.dimensions
    .filter((d) => d.mean !== null)
    .map((d) => ({ dimension: d.label.split(" ")[0], score: d.mean, fullLabel: d.label }));

  if (data.length === 0) {
    return <EmptyChart message="Dimension scores appear after the agent is evaluated." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke={CHART_COLORS.grid} />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: "#71717a", fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={CHART_COLORS.radar}
            fill={CHART_COLORS.radar}
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              background: "#0a0a0a",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostTrendChart({ points }: { points: CostTrendPoint[] }) {
  if (points.length === 0) {
    return <EmptyChart message="Cost and token trends appear after evaluations run." />;
  }

  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    cost: p.cost_usd,
    tokens: p.prompt_tokens + p.completion_tokens,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="cost" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="tokens"
            orientation="right"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0a0a0a",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line yAxisId="cost" type="monotone" dataKey="cost" stroke={CHART_COLORS.cost} strokeWidth={2} dot={false} />
          <Line
            yAxisId="tokens"
            type="monotone"
            dataKey="tokens"
            stroke={CHART_COLORS.tokens}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommonFlagsList({ flags }: { flags: CommonFlagItem[] }) {
  if (flags.length === 0) {
    return <p className="text-[13px] text-[#71717a]">No recurring flags yet.</p>;
  }

  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div
          key={flag.label}
          className="flex items-center justify-between rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2"
        >
          <div>
            <p className="text-[13px] text-[#fafafa]">{flag.label}</p>
            <p className="text-[11px] capitalize text-[#52525b]">
              {flag.dimension.replace(/_/g, " ")} · {flag.severity}
            </p>
          </div>
          <span className="rounded-full bg-[#27272a] px-2 py-0.5 text-[11px] tabular-nums text-[#a1a1aa]">
            {flag.count}×
          </span>
        </div>
      ))}
    </div>
  );
}

export function WorstDecisionsList({ items }: { items: WorstDecisionItem[] }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-[#71717a]">No evaluated decisions yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.evaluation_id} className="rounded-[10px] border border-[#27272a] bg-[#141414] p-4">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex h-8 min-w-10 items-center justify-center rounded-md px-2 text-[13px] font-medium tabular-nums",
                item.overall !== null && item.overall < 4
                  ? "bg-[#7f1d1d]/40 text-[#fca5a5]"
                  : "bg-[#78350f]/40 text-[#fbbf24]",
              )}
            >
              {item.overall?.toFixed(1) ?? "—"}
            </span>
            <span className="text-[11px] text-[#52525b]">
              {new Date(item.evaluated_at).toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-[12px] text-[#a1a1aa]">
            <span className="text-[#52525b]">Input:</span> {item.input_preview}
          </p>
          <p className="mt-1 text-[12px] text-[#a1a1aa]">
            <span className="text-[#52525b]">Output:</span> {item.output_preview}
          </p>
          {item.flags.length > 0 ? (
            <p className="mt-2 text-[11px] text-[#71717a]">
              {item.flags.length} flag{item.flags.length === 1 ? "" : "s"} raised
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-[10px] border border-dashed border-[#27272a] px-6 text-center">
      <p className="text-[13px] text-[#71717a]">{message}</p>
    </div>
  );
}

function gradeColor(grade: string) {
  if (grade === "A") return "text-[#86efac]";
  if (grade === "B") return "text-[#a3e635]";
  if (grade === "C") return "text-[#fbbf24]";
  if (grade === "D") return "text-[#fb923c]";
  if (grade === "F") return "text-[#f87171]";
  return "text-[#a1a1aa]";
}

export function ProfileGradeHeader({
  judgement,
  showSummary,
}: {
  judgement: ProfileDashboardJudgement | null;
  showSummary: boolean;
}) {
  if (!showSummary || !judgement) return null;

  return (
    <div className="flex flex-wrap items-end gap-6">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-[#52525b]">Judgment grade</p>
        <p className={cn("text-[42px] font-medium leading-none", gradeColor(judgement.grade))}>
          {judgement.grade}
        </p>
      </div>
      <div>
        <p className="text-[11px] text-[#52525b]">Overall</p>
        <p className="text-[24px] font-medium tabular-nums text-[#fafafa]">
          {judgement.overall?.toFixed(1) ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-[11px] text-[#52525b]">Evaluated</p>
        <p className="text-[24px] font-medium tabular-nums text-[#fafafa]">{judgement.evaluated_count}</p>
      </div>
      <div>
        <p className="text-[11px] text-[#52525b]">Streak</p>
        <p className="text-[24px] font-medium tabular-nums text-[#fafafa]">{judgement.current_streak}</p>
      </div>
    </div>
  );
}
