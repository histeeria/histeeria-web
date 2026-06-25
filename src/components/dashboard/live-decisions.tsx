"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Inbox, Radar, Zap } from "lucide-react";

import type { DecisionStats, DecisionSummary } from "@/lib/api";

const POLL_INTERVAL_MS = 5000;

type Payload = {
  stats: DecisionStats;
  decisions: DecisionSummary[];
  total: number;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
        {icon}
      </div>
      <h2 className="text-sm font-medium text-muted">{label}</h2>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function LiveDecisions({ initial }: { initial?: Payload }) {
  const [data, setData] = useState<Payload | null>(initial ?? null);
  const [connected, setConnected] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/decisions", { cache: "no-store" });
      if (!res.ok) {
        setConnected(false);
        return;
      }
      setData((await res.json()) as Payload);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (document.visibilityState === "visible") {
        await poll();
      }
      if (!cancelled) {
        timer.current = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    // Kick off immediately, then on an interval.
    tick();

    const onVisibility = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll]);

  const stats = data?.stats;
  const decisions = data?.decisions ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Radar className="h-5 w-5" />}
          label="Observations"
          value={stats?.total ?? 0}
          hint="Decisions received"
        />
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Queued"
          value={stats?.queued ?? 0}
          hint="Awaiting evaluation"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Evaluated"
          value={stats?.evaluated ?? 0}
          hint="Scored decisions"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Agents"
          value={stats?.agents ?? 0}
          hint={stats?.last_received_at ? `Last seen ${timeAgo(stats.last_received_at)}` : "None yet"}
        />
      </div>

      <div className="panel rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">Live decisions</h2>
          <span className="flex items-center gap-2 text-xs text-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "animate-pulse bg-success" : "bg-danger"
              }`}
            />
            {connected ? "Live" : "Reconnecting…"}
          </span>
        </div>

        {decisions.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium">Waiting for your first decision…</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
              Install the SDK and call <code className="text-accent">observe()</code>. New decisions
              appear here automatically.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {decisions.map((d) => (
              <li key={d.id} className="flex items-start gap-4 px-5 py-3.5">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    d.status === "evaluated" ? "bg-success" : "bg-accent"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-foreground">{d.agent_id ?? "agent"}</span>
                    {d.domain ? (
                      <span className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 capitalize">
                        {d.domain.replaceAll("_", " ")}
                      </span>
                    ) : null}
                    <span>{timeAgo(d.received_at)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-foreground/90">{d.output_preview}</p>
                </div>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-muted">
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
