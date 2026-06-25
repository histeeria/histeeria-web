"use client";

import { useState } from "react";
import {
  Activity,
  Check,
  Clipboard,
  Inbox,
  Radar,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { MeResponse } from "@/lib/api";

// Types matching backend payloads
type DecisionSummary = {
  id: string;
  agent_id: string | null;
  session_id: string | null;
  domain: string | null;
  output_preview: string;
  input_tokens: number | null;
  output_tokens: number | null;
  sdk_version: string | null;
  status: string;
  received_at: string;
};

type DecisionStats = {
  total: number;
  queued: number;
  evaluated: number;
  agents: number;
  last_received_at: string | null;
};

interface CommandCenterProps {
  initial?: {
    stats: DecisionStats;
    decisions: DecisionSummary[];
    total: number;
  };
  profile: MeResponse;
}

function getFormattedDate() {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("en-US", options);
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="panel rounded-xl p-5 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted/80 uppercase tracking-wider">{label}</h3>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/25 bg-accent-soft text-accent">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-muted">
        <span className={cn("mr-1 font-bold", trendUp ? "text-success" : "text-[#c9a84c]")}>
          {trendUp ? "↑" : "↓"} {trend}
        </span>
        vs yesterday
      </p>
    </div>
  );
}

export function CommandCenter({ initial, profile }: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<"live" | "judgements">("judgements");
  const [sdkLang, setLang] = useState<"python" | "typescript">("python");
  const [copiedKey, setCopiedKey] = useState(false);

  const org = profile?.organization;
  const stats = initial?.stats;
  const decisions = initial?.decisions ?? [];

  const keyPrefix = org?.key_prefix ?? "hst_live_";
  const keySuffix = org?.key_suffix ?? "----";
  const keyLabel = `${keyPrefix}••••${keySuffix}`;

  // SDK snippets
  const installCommands = {
    python: "pip install histeeria",
    typescript: "npm install histeeria",
  };

  const codeSnippets = {
    python: `from histeeria import Histeeria

h = Histeeria(api_key="${keyPrefix}xxxx")

# Wrap your LLM call
response = your_llm_call(messages)

h.observe(
    input=messages,
    output=response,
    agent_id="${org?.agent_name ? org.agent_name.toLowerCase().replace(/\s+/g, "_") : "agent_001"}",
    session_id="sess_abc",
    domain="${org?.domain_name ?? "general"}"
)`,
    typescript: `import { Histeeria } from "histeeria";

const h = new Histeeria({ apiKey: "${keyPrefix}xxxx" });

// Wrap your LLM call
const response = await yourLLMCall(messages);

h.observe({
  input: messages,
  output: response,
  agentId: "${org?.agent_name ? org.agent_name.toLowerCase().replace(/\s+/g, "_") : "agent_001"}",
  sessionId: "sess_abc",
  domain: "${org?.domain_name ?? "general"}"
});`,
  };

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      /* fallback */
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-up">
      {/* 1. Dashboard Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-5 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Command Center
          </h1>
          <p className="text-[13px] text-muted">
            {org?.workspace_name ?? "Histeeria Labs"} · {getFormattedDate()}
          </p>
        </div>

        {/* Tab pills matching the design */}
        <div className="flex rounded-lg border border-border bg-[#0c1018]/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-medium transition",
              activeTab === "live"
                ? "bg-[#131a26] text-accent border border-accent/15 shadow-[0_4px_12px_rgba(124,140,255,0.12)]"
                : "text-muted hover:text-foreground"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            Live Monitoring
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("judgements")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-medium transition",
              activeTab === "judgements"
                ? "bg-[#131a26] text-accent border border-accent/15 shadow-[0_4px_12px_rgba(124,140,255,0.12)]"
                : "text-muted hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Judgements
          </button>
        </div>
      </div>

      {/* 2. Numeric Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Radar className="h-4 w-4" />}
          label="Active Agents"
          value={stats ? stats.agents : "12"}
          trend="+2"
          trendUp={true}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Decisions Today"
          value={stats ? stats.total.toLocaleString() : "8,432"}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Flagged Events"
          value={stats ? stats.queued : "47"}
          trend="+8"
          trendUp={true}
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Avg Confidence"
          value="84.2%"
          trend="+1.4%"
          trendUp={true}
        />
      </div>

      {/* 3. Main Split Columns (Dynamic / Activity or Get Started Checklist) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Double-width Column: Recent Activity Feed OR Setup Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {decisions.length > 0 ? (
            <div className="panel rounded-xl">
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 select-none">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Recent Activity
                </h2>
                <span className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-muted">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Live Observability
                </span>
              </div>

              <ul className="divide-y divide-border/30">
                {decisions.map((decision) => (
                  <li
                    key={decision.id}
                    className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-[#0c1018]/15 transition-all select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {decision.agent_id ?? org?.agent_name ?? "Agent decision"}
                        </p>
                        <p className="mt-1 text-xs text-muted/75 truncate pr-4">
                          {decision.output_preview}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="text-[11px] font-mono text-muted/80">
                          {new Date(decision.received_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted/50 capitalize">
                          {decision.domain ?? org?.domain_name ?? "General"}
                        </p>
                      </div>
                      <span className="rounded border border-success/40 bg-success/5 px-2 py-0.5 text-xs font-bold font-mono text-success tabular-nums">
                        82%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* Get Started Integration checklist */
            <div className="space-y-6">
              <div className="panel rounded-xl p-6 space-y-4">
                <div className="space-y-1.5 select-none">
                  <div className="inline-flex items-center gap-2 rounded bg-accent-soft border border-accent/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    Get Started List
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Connect your AI agent
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted">
                    Before Histeeria can score decisions, your model must send its first observation.
                    Complete these 3 steps to activate live monitoring.
                  </p>
                </div>

                <div className="space-y-3.5 border-t border-border/40 pt-4">
                  {/* Step 1: API Key Generated */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 border border-success/30 text-success">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground select-none">
                        1. Generate API key (Completed)
                      </h4>
                      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-border-strong bg-[#0c1018]/50 px-3.5 py-2.5 max-w-[320px]">
                        <code className="font-mono text-xs text-accent select-all">{keyLabel}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(keyLabel)}
                          className="text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          {copiedKey ? (
                            <span className="text-[11px] font-semibold text-success">Copied</span>
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Install SDK */}
                  <div className="flex items-start gap-3.5 pt-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-muted">
                      <span className="font-mono text-[11px] font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground select-none">
                        2. Integrate the SDK
                      </h4>
                      <p className="mt-0.5 text-xs text-muted select-none">
                        Install and wrap your model calls with our lightweight SDK.
                      </p>

                      {/* Language Toggles */}
                      <div className="mt-4 border border-border-strong rounded-xl overflow-hidden bg-[#0c1018]/20">
                        <div className="flex items-center justify-between bg-[#0a0e14] px-4 py-2 border-b border-border/40 select-none">
                          <div className="flex gap-2">
                            {(["python", "typescript"] as const).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setLang(l)}
                                className={cn(
                                  "rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                                  sdkLang === l
                                    ? "bg-accent/15 text-accent border border-accent/25"
                                    : "text-muted hover:text-foreground"
                                )}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted/60">
                              Shell
                            </span>
                            <div className="rounded bg-[#06080e] p-2.5 font-mono text-xs border border-border-strong/40 select-all">
                              {installCommands[sdkLang]}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted/60">
                              Implementation
                            </span>
                            <pre className="rounded bg-[#06080e] p-3 font-mono text-xs border border-border-strong/40 overflow-x-auto text-foreground/80 select-all leading-relaxed">
                              {codeSnippets[sdkLang]}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Send Decision */}
                  <div className="flex items-start gap-3.5 pt-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-muted">
                      <span className="font-mono text-[11px] font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground select-none">
                        3. Awaiting Live Decision
                      </h4>
                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                        </span>
                        <span className="font-mono text-xs text-accent select-none">
                          Awaiting first observation...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Single-width Column: Inbox & System Health boxes */}
        <div className="space-y-6 select-none">
          {/* Inbox Alert List */}
          <div className="panel rounded-xl">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Inbox className="h-4 w-4 text-muted/80" />
                Inbox
              </h2>
              <span className="rounded bg-accent-soft border border-accent/25 px-1.5 py-0.2 text-[10px] font-semibold text-accent">
                2 unread
              </span>
            </div>

            <ul className="divide-y divide-border/20 text-xs">
              <li className="p-4 bg-accent-soft/10 flex items-start gap-2.5 border-l-2 border-accent">
                <span className="h-2 w-2 mt-1 rounded-full bg-accent" />
                <div>
                  <p className="font-medium text-foreground">
                    Workspace successfully created
                  </p>
                  <p className="mt-0.5 text-muted/70">
                    Welcome to Histeeria Labs. Connect your agent and look up the dashboard links.
                  </p>
                  <p className="mt-1 text-[10px] font-mono text-muted/50">Just now</p>
                </div>
              </li>
              <li className="p-4 flex items-start gap-2.5">
                <span className="h-2 w-2 mt-1 rounded-full bg-muted/30" />
                <div>
                  <p className="font-medium text-foreground/80">
                    Awaiting API Integration
                  </p>
                  <p className="mt-0.5 text-muted/65">
                    Your agent configured as <code className="text-accent">{org?.agent_name ?? "Support Copilot"}</code> hasn&apos;t started sending decisions.
                  </p>
                  <p className="mt-1 text-[10px] font-mono text-muted/50">2m ago</p>
                </div>
              </li>
            </ul>
          </div>

          {/* System Health Component */}
          <div className="panel rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              System Health
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground/85">
                  {org?.agent_name ?? "Support Copilot"}
                </span>
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Awaiting Integration
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <span className="font-medium text-foreground/85">Nexus-7</span>
                <span className="flex items-center gap-2 text-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <span className="font-medium text-foreground/85">Orion-3</span>
                <span className="flex items-center gap-2 text-[#c9a84c]">
                  <span className="h-2 w-2 rounded-full bg-[#c9a84c]" />
                  Warning
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <span className="font-medium text-foreground/85">Atlas-1</span>
                <span className="flex items-center gap-2 text-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
