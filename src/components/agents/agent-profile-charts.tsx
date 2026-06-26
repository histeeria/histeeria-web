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

import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import type {
  CommonFlagItem,
  CostTrendPoint,
  GraphPoint,
  ProfileDashboardJudgement,
  WorstDecisionItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function useChartTheme() {
  const { isLight } = useProfileTheme();
  return {
    isLight,
    line: isLight ? "#18181b" : "#fafafa",
    grid: isLight ? "#e4e4e7" : "#27272a",
    tick: "#71717a",
    tooltipBg: isLight ? "#ffffff" : "#0a0a0a",
    tooltipBorder: isLight ? "#e4e4e7" : "#27272a",
    tooltipLabel: isLight ? "#52525b" : "#a1a1aa",
    radar: "#86efac",
    cost: "#60a5fa",
    tokens: "#a78bfa",
  };
}

export function JudgmentGraph({ points }: { points: GraphPoint[] }) {
  const theme = useChartTheme();

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
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: theme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: theme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: theme.tooltipLabel }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={theme.line}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: theme.line }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DimensionRadar({ judgement }: { judgement: ProfileDashboardJudgement }) {
  const theme = useChartTheme();

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
          <PolarGrid stroke={theme.grid} />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: theme.tick, fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={theme.radar}
            fill={theme.radar}
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
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
  const theme = useChartTheme();

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
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: theme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="cost" tick={{ fill: theme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="tokens"
            orientation="right"
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line yAxisId="cost" type="monotone" dataKey="cost" stroke={theme.cost} strokeWidth={2} dot={false} />
          <Line
            yAxisId="tokens"
            type="monotone"
            dataKey="tokens"
            stroke={theme.tokens}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommonFlagsList({ flags }: { flags: CommonFlagItem[] }) {
  const { isLight } = useProfileTheme();

  if (flags.length === 0) {
    return (
      <p className={cn("text-[13px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
        No recurring flags yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div
          key={flag.label}
          className={cn(
            "flex items-center justify-between rounded-[8px] border px-3 py-2",
            profileThemeClass(isLight, "border-[#27272a] bg-[#141414]", "border-[#e4e4e7] bg-[#fafafa]"),
          )}
        >
          <div>
            <p className={cn("text-[13px]", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
              {flag.label}
            </p>
            <p className={cn("text-[11px] capitalize", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
              {flag.dimension.replace(/_/g, " ")} · {flag.severity}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] tabular-nums",
              profileThemeClass(isLight, "bg-[#27272a] text-[#a1a1aa]", "bg-[#e4e4e7] text-[#52525b]"),
            )}
          >
            {flag.count}×
          </span>
        </div>
      ))}
    </div>
  );
}

export function WorstDecisionsList({ items }: { items: WorstDecisionItem[] }) {
  const { isLight } = useProfileTheme();

  if (items.length === 0) {
    return (
      <p className={cn("text-[13px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
        No evaluated decisions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.evaluation_id}
          className={cn(
            "rounded-[10px] border p-4",
            profileThemeClass(isLight, "border-[#27272a] bg-[#141414]", "border-[#e4e4e7] bg-[#fafafa]"),
          )}
        >
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
            <span className={cn("text-[11px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
              {new Date(item.evaluated_at).toLocaleString()}
            </span>
          </div>
          <p className={cn("mt-3 text-[12px]", profileThemeClass(isLight, "text-[#a1a1aa]", "text-[#52525b]"))}>
            <span className={profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]")}>Input:</span>{" "}
            {item.input_preview}
          </p>
          <p className={cn("mt-1 text-[12px]", profileThemeClass(isLight, "text-[#a1a1aa]", "text-[#52525b]"))}>
            <span className={profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]")}>Output:</span>{" "}
            {item.output_preview}
          </p>
          {item.flags.length > 0 ? (
            <p className={cn("mt-2 text-[11px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
              {item.flags.length} flag{item.flags.length === 1 ? "" : "s"} raised
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  const { isLight } = useProfileTheme();

  return (
    <div
      className={cn(
        "flex h-64 items-center justify-center rounded-[10px] border border-dashed px-6 text-center",
        profileThemeClass(isLight, "border-[#27272a]", "border-[#d4d4d8]"),
      )}
    >
      <p className={cn("text-[13px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>{message}</p>
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
  const { isLight } = useProfileTheme();

  if (!showSummary || !judgement) return null;

  return (
    <div className="flex flex-wrap items-end gap-6">
      <div>
        <p className={cn("text-[11px] uppercase tracking-wide", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
          Judgment grade
        </p>
        <p className={cn("text-[42px] font-medium leading-none", gradeColor(judgement.grade))}>
          {judgement.grade}
        </p>
      </div>
      <div>
        <p className={cn("text-[11px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>Overall</p>
        <p className={cn("text-[24px] font-medium tabular-nums", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
          {judgement.overall?.toFixed(1) ?? "—"}
        </p>
      </div>
      <div>
        <p className={cn("text-[11px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>Evaluated</p>
        <p className={cn("text-[24px] font-medium tabular-nums", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
          {judgement.evaluated_count}
        </p>
      </div>
      <div>
        <p className={cn("text-[11px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>Streak</p>
        <p className={cn("text-[24px] font-medium tabular-nums", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
          {judgement.current_streak}
        </p>
      </div>
    </div>
  );
}
