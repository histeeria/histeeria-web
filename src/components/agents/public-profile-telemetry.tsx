"use client";

import type { CommonFlagItem, GraphPoint, ProfileDashboardJudgement } from "@/lib/api";
import { publicTheme } from "@/lib/public-profile-design";
import { useProfileTheme } from "@/components/agents/public-profile-theme";
import { cn } from "@/lib/utils";

function MetricLabel({ children, isLight }: { children: React.ReactNode; isLight: boolean }) {
  return (
    <p className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", publicTheme(isLight).muted)}>
      {children}
    </p>
  );
}

function MetricValue({ children, isLight }: { children: React.ReactNode; isLight: boolean }) {
  return (
    <p className={cn("font-mono text-[13px] tabular-nums", publicTheme(isLight).fg)}>{children}</p>
  );
}

function SignalBars({
  items,
  isLight,
}: {
  items: Array<{ label: string; value: number; max: number }>;
  isLight: boolean;
}) {
  const t = publicTheme(isLight);
  const top = items[0];

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <MetricLabel isLight={isLight}>Signal-to-noise distribution</MetricLabel>
        {top ? (
          <MetricValue isLight={isLight}>
            {Math.round((top.value / Math.max(top.max, 1)) * 10000) / 100}% {top.label}
          </MetricValue>
        ) : (
          <MetricValue isLight={isLight}>Awaiting telemetry</MetricValue>
        )}
      </div>
      <div className="mt-6 flex items-end gap-[3px]">
        {items.length === 0
          ? Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  height: `${12 + (i % 5) * 4}px`,
                  backgroundColor: i === 11 ? t.fill : t.fillMuted,
                  opacity: i === 11 ? 1 : 0.55,
                }}
              />
            ))
          : items.map((item, i) => {
              const h = Math.max(8, Math.round((item.value / item.max) * 72));
              return (
                <div
                  key={item.label}
                  className="flex-1"
                  style={{
                    height: `${h}px`,
                    backgroundColor: i === 0 ? t.fill : t.fillMuted,
                  }}
                  title={item.label}
                />
              );
            })}
      </div>
    </div>
  );
}

function AlignmentLine({ points, isLight }: { points: GraphPoint[]; isLight: boolean }) {
  const t = publicTheme(isLight);
  const w = 320;
  const h = 80;
  const pad = 8;

  const values =
    points.length > 0
      ? points.map((p) => p.overall ?? 0)
      : [6.2, 6.8, 7.1, 6.5, 7.4, 7.8, 7.2, 7.6, 8.0, 7.9];
  const min = 0;
  const max = 10;
  const step = (w - pad * 2) / Math.max(values.length - 1, 1);

  const coords = values.map((v, i) => ({
    x: pad + i * step,
    y: h - pad - ((v - min) / (max - min)) * (h - pad * 2),
  }));

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  const latest = values[values.length - 1] ?? 0;
  const drift =
    points.length > 1
      ? Math.abs((values[values.length - 1] ?? 0) - (values[values.length - 2] ?? 0))
      : 0;

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <MetricLabel isLight={isLight}>Histeeria judgment alignment</MetricLabel>
        <MetricValue isLight={isLight}>
          {points.length > 0
            ? drift < 0.5
              ? "Zero divergence threshold"
              : `${latest?.toFixed(1) ?? "—"} overall`
            : "Baseline model"}
        </MetricValue>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full" aria-hidden>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={pad}
            x2={w - pad}
            y1={pad + ratio * (h - pad * 2)}
            y2={pad + ratio * (h - pad * 2)}
            stroke={t.grid}
            strokeWidth={1}
          />
        ))}
        <path d={path} fill="none" stroke={t.fill} strokeWidth={1.5} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3 : 0} fill={t.fill} />
        ))}
      </svg>
    </div>
  );
}

export function TelemetryPanel({
  judgement,
  graphPoints,
  flags,
}: {
  judgement: ProfileDashboardJudgement | null;
  graphPoints: GraphPoint[];
  flags: CommonFlagItem[];
}) {
  const { isLight } = useProfileTheme();
  const t = publicTheme(isLight);

  const barItems =
    judgement?.dimensions
      ?.filter((d) => d.mean !== null)
      .sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0))
      .slice(0, 24)
      .map((d) => ({ label: d.label.split(" ")[0], value: d.mean ?? 0, max: 10 })) ??
    flags.slice(0, 24).map((f) => ({ label: f.label, value: f.count, max: Math.max(...flags.map((x) => x.count), 1) }));

  return (
    <div className={cn("grid h-full min-h-[280px] grid-rows-2 border-l", t.border)}>
      <div className={cn("border-b", t.border)}>
        <SignalBars items={barItems} isLight={isLight} />
      </div>
      <div>
        <AlignmentLine points={graphPoints} isLight={isLight} />
      </div>
    </div>
  );
}

export function JudgmentGradeStrip({
  judgement,
  show,
}: {
  judgement: ProfileDashboardJudgement | null;
  show: boolean;
}) {
  const { isLight } = useProfileTheme();
  if (!show || !judgement) return null;
  const t = publicTheme(isLight);

  return (
    <div className={cn("grid grid-cols-4 border", t.border, t.surface)}>
      {[
        { label: "Grade", value: judgement.grade },
        { label: "Overall", value: judgement.overall?.toFixed(1) ?? "—" },
        { label: "Evaluated", value: String(judgement.evaluated_count) },
        { label: "Streak", value: String(judgement.current_streak) },
      ].map((item) => (
        <div key={item.label} className={cn("border-r px-5 py-4 last:border-r-0", t.border)}>
          <MetricLabel isLight={isLight}>{item.label}</MetricLabel>
          <p className={cn("mt-2 font-mono text-[22px] leading-none tracking-tight", t.fg)}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AbstractAgentVisual({ name, avatarUrl, isLight }: { name: string; avatarUrl?: string | null; isLight: boolean }) {
  const t = publicTheme(isLight);

  if (avatarUrl) {
    return (
      <div className={cn("relative aspect-square w-full border", t.border, t.surfaceAlt)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square w-full border", t.border, t.surfaceAlt)}>
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        <rect width="400" height="400" fill={isLight ? "#f4f4f5" : "#141414"} />
        {[100, 200, 300].map((y) => (
          <line key={`h-${y}`} x1="40" y1={y} x2="360" y2={y} stroke={t.grid} strokeWidth="1" />
        ))}
        {[100, 200, 300].map((x) => (
          <line key={`v-${x}`} x1={x} y1="40" x2={x} y2="360" stroke={t.grid} strokeWidth="1" />
        ))}
        <circle cx="200" cy="200" r="72" fill="none" stroke={t.fill} strokeWidth="1.5" />
        <circle cx="200" cy="200" r="4" fill={t.fill} />
        {[
          [120, 140],
          [280, 160],
          [240, 280],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <line x1="200" y1="200" x2={cx} y2={cy} stroke={t.fillMuted} strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={cx} cy={cy} r="5" fill={t.fill} />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 border-t border-r px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest">
        <span className={t.muted}>Generative ID</span>
      </div>
    </div>
  );
}
