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
                className="flex-1 rounded-full"
                style={{
                  height: `${12 + (i % 5) * 4}px`,
                  backgroundColor: i === 11 ? "#8f9cff" : t.fillMuted,
                  opacity: i === 11 ? 1 : 0.55,
                }}
              />
            ))
          : items.map((item, i) => {
              const h = Math.max(8, Math.round((item.value / item.max) * 72));
              return (
                <div
                  key={item.label}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${h}px`,
                    backgroundColor: i === 0 ? "#8f9cff" : t.fillMuted,
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
        <path d={path} fill="none" stroke="#8f9cff" strokeWidth={1.8} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3 : 0} fill="#8f9cff" />
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
    <div className={cn("grid h-full min-h-[280px] grid-rows-2 overflow-hidden rounded-[32px] border bg-[var(--pp-surface)] backdrop-blur-xl", t.border)}>
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
    <div className={cn("grid overflow-hidden rounded-[28px] border bg-[var(--pp-surface)] backdrop-blur-xl sm:grid-cols-4", t.border)}>
      {[
        { label: "Grade", value: judgement.grade },
        { label: "Overall", value: judgement.overall?.toFixed(1) ?? "—" },
        { label: "Evaluated", value: String(judgement.evaluated_count) },
        { label: "Streak", value: String(judgement.current_streak) },
      ].map((item) => (
        <div key={item.label} className={cn("border-b px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0", t.border)}>
          <MetricLabel isLight={isLight}>{item.label}</MetricLabel>
          <p className={cn("mt-2 font-mono text-[24px] leading-none tracking-tight", t.fg)}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AbstractAgentVisual({ name, avatarUrl, isLight }: { name: string; avatarUrl?: string | null; isLight: boolean }) {
  const t = publicTheme(isLight);

  if (avatarUrl) {
    return (
      <div className={cn("relative aspect-square w-full overflow-hidden rounded-[36px] border bg-black shadow-[0_24px_120px_rgba(143,156,255,0.16)]", t.border)}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_35%,transparent_36%,rgba(0,0,0,0.24)_68%,rgba(0,0,0,0.72)_100%)]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square w-full overflow-hidden rounded-[36px] border bg-[#020202] shadow-[0_24px_120px_rgba(236,168,214,0.13)]", t.border)}>
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="agentGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#eca8d6" stopOpacity="0.75" />
            <stop offset="42%" stopColor="#8f9cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#020202" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        <rect width="400" height="400" fill={isLight ? "#f8f8fa" : "#020202"} />
        <circle cx="205" cy="190" r="150" fill="url(#agentGlow)" opacity={isLight ? 0.25 : 0.5} />
        {[64, 128, 192, 256, 320].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="400" stroke={t.grid} strokeWidth="1" />
        ))}
        {[64, 128, 192, 256, 320].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="400" y2={y} stroke={t.grid} strokeWidth="1" />
        ))}
        {Array.from({ length: 42 }).map((_, i) => {
          const angle = (i / 42) * Math.PI * 2;
          const radius = 58 + (i % 7) * 10;
          const x = 202 + Math.cos(angle) * radius;
          const y = 210 + Math.sin(angle) * radius * 0.72;
          return (
            <g key={i} opacity={0.25 + (i % 5) * 0.12}>
              <line x1="202" y1="210" x2={x} y2={y} stroke={i % 3 === 0 ? "#eca8d6" : "#8f9cff"} strokeWidth="0.8" />
              <circle cx={x} cy={y} r={i % 4 === 0 ? 3 : 1.8} fill={i % 3 === 0 ? "#eca8d6" : "#8f9cff"} filter="url(#softBlur)" />
            </g>
          );
        })}
        <circle cx="202" cy="210" r="42" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" />
        <circle cx="202" cy="210" r="5" fill="#ffffff" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur-xl">
        <span className={t.muted}>Generative ID</span>
      </div>
    </div>
  );
}
