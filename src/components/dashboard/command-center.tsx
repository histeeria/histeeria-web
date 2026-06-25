"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MeResponse } from "@/lib/api";

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
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
      <p className="text-[11px] font-medium text-[#52525b]">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-[#fafafa]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#71717a]">{trend}</p>
    </div>
  );
}

function Card({
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
      {children}
    </div>
  );
}

export function CommandCenter({ initial, profile }: CommandCenterProps) {
  const [sdkLang, setLang] = useState<"python" | "typescript">("python");
  const [copiedKey, setCopiedKey] = useState(false);

  const org = profile.organization;
  const stats = initial?.stats;
  const decisions = initial?.decisions ?? [];

  const keyPrefix = org?.key_prefix ?? "hst_live_";
  const keySuffix = org?.key_suffix ?? "----";
  const keyLabel = `${keyPrefix}••••${keySuffix}`;

  const installCommands = {
    python: "pip install histeeria",
    typescript: "npm install histeeria",
  };

  const codeSnippets = {
    python: `from histeeria import Histeeria

h = Histeeria(api_key="${keyPrefix}xxxx")

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
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="border-b border-[#27272a] pb-5">
        <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Command Center</h1>
        <p className="mt-1 text-[13px] text-[#71717a]">
          {org?.workspace_name ?? "Workspace"} · {getFormattedDate()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active agents"
          value={stats?.agents ?? 0}
          trend="+2 vs yesterday"
        />
        <StatCard
          label="Decisions today"
          value={stats ? stats.total.toLocaleString() : 0}
          trend="+12% vs yesterday"
        />
        <StatCard
          label="Queued"
          value={stats?.queued ?? 0}
          trend="Awaiting evaluation"
        />
        <StatCard label="Evaluated" value={stats?.evaluated ?? 0} trend="Scored decisions" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          {decisions.length > 0 ? (
            <Card
              title="Recent activity"
              action={
                <span className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Live
                </span>
              }
            >
              <ul className="divide-y divide-[#27272a]">
                {decisions.map((decision) => (
                  <li
                    key={decision.id}
                    className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-[#141414]/50"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#43d29e]" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#fafafa]">
                          {decision.agent_id ?? org?.agent_name ?? "Agent decision"}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-[#71717a]">
                          {decision.output_preview}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#52525b]">
                      {new Date(decision.received_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card title="Get started">
              <div className="space-y-5 p-4">
                <p className="text-[13px] leading-relaxed text-[#71717a]">
                  Complete these steps to connect your agent and start monitoring decisions.
                </p>

                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#27272a]">
                    <Check className="h-3 w-3 text-[#fafafa]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#fafafa]">Generate API key</p>
                    <div className="mt-2 flex items-center justify-between rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2">
                      <code className="font-mono text-[12px] text-[#a1a1aa]">{keyLabel}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(keyLabel)}
                        className="text-[#71717a] hover:text-[#fafafa]"
                      >
                        {copiedKey ? (
                          <span className="text-[11px]">Copied</span>
                        ) : (
                          <Clipboard className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#27272a] text-[11px] text-[#71717a]">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#fafafa]">Integrate the SDK</p>
                    <div className="mt-2 overflow-hidden rounded-[8px] border border-[#27272a]">
                      <div className="flex gap-1 border-b border-[#27272a] bg-[#141414] px-3 py-2">
                        {(["python", "typescript"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setLang(lang)}
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] capitalize transition",
                              sdkLang === lang
                                ? "bg-[#27272a] text-[#fafafa]"
                                : "text-[#71717a] hover:text-[#a1a1aa]",
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2 p-3">
                        <code className="block rounded-[6px] bg-black px-3 py-2 font-mono text-[11px] text-[#a1a1aa]">
                          {installCommands[sdkLang]}
                        </code>
                        <pre className="overflow-x-auto rounded-[6px] bg-black px-3 py-2 font-mono text-[11px] leading-relaxed text-[#71717a]">
                          {codeSnippets[sdkLang]}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#27272a] text-[11px] text-[#71717a]">
                    3
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#fafafa]">Awaiting first decision</p>
                    <p className="mt-1 flex items-center gap-2 text-[12px] text-[#71717a]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52525b] opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#71717a]" />
                      </span>
                      Listening for observations...
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-4">
          <Card
            title="Inbox"
            action={
              <span className="rounded-full bg-[#27272a] px-2 py-0.5 text-[10px] text-[#a1a1aa]">
                2
              </span>
            }
          >
            <ul className="divide-y divide-[#27272a] text-[12px]">
              <li className="px-4 py-3">
                <p className="font-medium text-[#fafafa]">Workspace created</p>
                <p className="mt-0.5 text-[#71717a]">Welcome to Histeeria. Connect your agent to begin.</p>
              </li>
              <li className="px-4 py-3">
                <p className="font-medium text-[#fafafa]">Awaiting integration</p>
                <p className="mt-0.5 text-[#71717a]">
                  {org?.agent_name ?? "Your agent"} hasn&apos;t sent a decision yet.
                </p>
              </li>
            </ul>
          </Card>

          <Card title="System health">
            <div className="space-y-3 p-4 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">{org?.agent_name ?? "Primary agent"}</span>
                <span className="flex items-center gap-1.5 text-[#71717a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#71717a]" />
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
                <span className="text-[#a1a1aa]">Ingestion pipeline</span>
                <span className="flex items-center gap-1.5 text-[#43d29e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
                <span className="text-[#a1a1aa]">Evaluation queue</span>
                <span className="flex items-center gap-1.5 text-[#43d29e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43d29e]" />
                  Healthy
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
