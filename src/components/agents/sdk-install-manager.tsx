"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Clipboard,
  Code2,
  Cpu,
  ExternalLink,
  Info,
  Key,
  Layers,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react";

import type { AgentSummary, AgentProfileSummary, MeResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

function relativeTime(value: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface SdkInstallManagerProps {
  profile: MeResponse;
  initialAgents: AgentSummary[];
  initialProfiles: AgentProfileSummary[];
}

export function SdkInstallManager({
  profile,
  initialAgents,
  initialProfiles,
}: SdkInstallManagerProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "status">("status");
  const [sdkLang, setSdkLang] = useState<"python" | "typescript">("python");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const org = profile.organization;
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
    agent_id="synthesis", # Match your agent profile SDK ID
    session_id="sess_abc",
    domain="general"
)`,
    typescript: `import { Histeeria } from "histeeria";

const h = new Histeeria({ apiKey: "${keyPrefix}xxxx" });

const response = await yourLLMCall(messages);

h.observe({
  input: messages,
  output: response,
  agentId: "synthesis", // Match your agent profile SDK ID
  sessionId: "sess_abc",
  domain: "general"
});`,
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id === "key") {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Find connections that match our profiles, or active unmapped agents
  const mappedStatus = initialProfiles.map((p) => {
    const match = initialAgents.find(
      (a) => a.agent_id.toLowerCase() === p.sdk_agent_id?.toLowerCase()
    );
    return {
      profile: p,
      agentId: p.sdk_agent_id,
      isConnected: !!match && match.decision_count > 0,
      decisionCount: match ? match.decision_count : 0,
      lastReceivedAt: match ? match.last_received_at : null,
    };
  });

  const registeredSdkIds = new Set(
    initialProfiles.map((p) => p.sdk_agent_id?.toLowerCase()).filter(Boolean)
  );

  const unmappedAgents = initialAgents.filter(
    (a) => !registeredSdkIds.has(a.agent_id.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#71717a]" />
            <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">
              SDK Installation
            </h1>
          </div>
          <p className="mt-1 text-[13px] text-[#71717a]">
            Connect your AI agents to Histeeria and monitor their reasoning, decisions, and system health in real-time.
          </p>
        </div>
        <a
          href="https://histeeria.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa] transition"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Full Documentation
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a]">
        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={cn(
            "relative pb-3 text-[14px] font-medium transition cursor-pointer px-4",
            activeTab === "status"
              ? "text-[#fafafa] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#fafafa]"
              : "text-[#71717a] hover:text-[#a1a1aa]"
          )}
        >
          SDK Statuses
          {initialAgents.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#14532d]/40 px-1.5 py-0.5 text-[10px] font-medium text-[#86efac]">
              {initialAgents.length} Active
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={cn(
            "relative pb-3 text-[14px] font-medium transition cursor-pointer px-4",
            activeTab === "guide"
              ? "text-[#fafafa] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#fafafa]"
              : "text-[#71717a] hover:text-[#a1a1aa]"
          )}
        >
          Integration Guide
        </button>
      </div>

      {activeTab === "guide" && (
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="flex gap-3 rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4 text-[13px] text-[#a1a1aa] leading-relaxed">
            <Info className="h-5 w-5 shrink-0 text-[#71717a]" />
            <div>
              <p className="font-medium text-[#fafafa]">Key Integration Concepts</p>
              <p className="mt-1">
                The Histeeria SDK runs inline with your agent logic. When your agent performs an LLM completion or processes a critical decision, send the prompt context and returned model choice as an observation to Histeeria using <code className="text-[#fafafa] font-mono">h.observe()</code>.
              </p>
            </div>
          </div>

          {/* Steps Card */}
          <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a]">
            <div className="border-b border-[#27272a] px-5 py-4">
              <h2 className="text-[14px] font-medium text-[#fafafa]">Integration Guidelines</h2>
            </div>
            <div className="p-5 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#27272a] text-[12px] font-medium text-[#fafafa]">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#fafafa]">Retrieve API Key</p>
                  <p className="mt-1 text-[13px] text-[#71717a]">
                    Authentication requires a valid workspace API key. Pass this to the initializer or set the <code className="text-[#a1a1aa] font-mono">HISTEERIA_API_KEY</code> environment variable.
                  </p>
                  <div className="mt-3 flex items-center justify-between rounded-[8px] border border-[#27272a] bg-[#141414] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-[#71717a]" />
                      <code className="font-mono text-[12px] text-[#a1a1aa]">{keyLabel}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(keyLabel, "key")}
                      className="cursor-pointer text-[#71717a] hover:text-[#fafafa] transition flex items-center gap-1 text-[12px]"
                    >
                      {copiedKey ? (
                        <span className="text-[#86efac] flex items-center gap-1">
                          <Check className="h-3 w-3" /> Copied
                        </span>
                      ) : (
                        <>
                          <Clipboard className="h-3.5 w-3.5" /> Copy Key
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#52525b]">
                    Manage active keys or generate secondary keys under the{" "}
                    <Link
                      href={`/${org?.workspace_slug}/agents/api-keys`}
                      className="text-[#a1a1aa] underline hover:text-[#fafafa]"
                    >
                      API Keys
                    </Link>{" "}
                    dashboard.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#27272a] text-[12px] font-medium text-[#71717a]">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#fafafa]">Install SDK Package</p>
                  <p className="mt-1 text-[13px] text-[#71717a]">
                    Install the official Histeeria client library into your environment.
                  </p>
                  
                  <div className="mt-3 overflow-hidden rounded-[8px] border border-[#27272a] bg-[#141414]">
                    <div className="flex border-b border-[#27272a] bg-[#0d0d0d] px-3 py-1.5">
                      {(["python", "typescript"] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSdkLang(lang)}
                          className={cn(
                            "cursor-pointer rounded px-2 py-1 text-[11px] font-medium capitalize transition",
                            sdkLang === lang
                              ? "bg-[#27272a] text-[#fafafa]"
                              : "text-[#71717a] hover:text-[#a1a1aa]"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between rounded bg-black px-4 py-2.5 font-mono text-[11px] text-[#a1a1aa]">
                        <code>{installCommands[sdkLang]}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(installCommands[sdkLang], `inst-${sdkLang}`)}
                          className="cursor-pointer text-[#71717a] hover:text-[#fafafa] transition"
                        >
                          {copiedSnippet === `inst-${sdkLang}` ? (
                            <Check className="h-3.5 w-3.5 text-[#86efac]" />
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <pre className="overflow-x-auto rounded bg-black p-4 font-mono text-[11px] leading-relaxed text-[#a1a1aa]">
                          {codeSnippets[sdkLang]}
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(codeSnippets[sdkLang], `snip-${sdkLang}`)}
                          className="absolute right-3 top-3 cursor-pointer text-[#71717a] hover:text-[#fafafa] transition"
                        >
                          {copiedSnippet === `snip-${sdkLang}` ? (
                            <span className="text-[#86efac] text-[10px] font-mono">Copied!</span>
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#27272a] text-[12px] font-medium text-[#71717a]">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#fafafa]">Verify connection</p>
                  <p className="mt-1 text-[13px] text-[#71717a]">
                    Once your agent sends its first decision, Histeeria will identify the SDK agent ID and start compiling judgment and alignment scores. Verify connections on the statuses tab on this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "status" && (
        <div className="space-y-6">
          {/* Agent Profiles section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-medium text-[#a1a1aa] uppercase tracking-wider">
                Profile SDK Integration Statuses
              </h2>
              <Link
                href={`/${org?.workspace_slug}/agents/profiles?new=1`}
                className="inline-flex cursor-pointer items-center gap-1 text-[13px] text-[#fafafa] hover:underline"
              >
                Create Agent Profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {mappedStatus.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#27272a] bg-[#0a0a0a] px-4 py-12 text-center space-y-3">
                <Cpu className="mx-auto h-8 w-8 text-[#52525b]" />
                <p className="text-[13px] text-[#71717a]">No agent profiles registered yet in this workspace.</p>
                <Link
                  href={`/${org?.workspace_slug}/agents/profiles?new=1`}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] bg-black px-4 py-2 text-[12px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa] transition"
                >
                  Register your first profile
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {mappedStatus.map(({ profile: p, agentId, isConnected, decisionCount, lastReceivedAt }) => (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-5 transition hover:border-[#3f3f46]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[15px] font-medium text-[#fafafa]">
                            {p.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#52525b]">
                            <span>SDK ID:</span>
                            <span className="text-[#a1a1aa] bg-[#141414] px-1.5 py-0.5 rounded border border-[#27272a]">
                              {agentId || "not set"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                            isConnected
                              ? "bg-[#14532d]/20 text-[#86efac] border-[#14532d]/40"
                              : "bg-[#27272a]/40 text-[#71717a] border-[#27272a]"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isConnected ? "animate-pulse bg-[#86efac]" : "bg-[#52525b]"
                            )}
                          />
                          {isConnected ? "Connected" : "Pending"}
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-[12px] text-[#71717a] min-h-[32px]">
                        {p.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px]">
                      <div className="text-[#52525b]">
                        Decisions:{" "}
                        <span className="font-mono text-[#a1a1aa] font-medium">{decisionCount}</span>
                      </div>
                      <div className="text-[#52525b]">
                        Last activity:{" "}
                        <span className="text-[#a1a1aa]">
                          {isConnected ? relativeTime(lastReceivedAt) : "Awaiting data"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unmapped Active Connections section */}
          {unmappedAgents.length > 0 && (
            <div className="pt-2">
              <div className="mb-3 flex items-center gap-2">
                <Wifi className="h-4 w-4 text-[#86efac]" />
                <h2 className="text-[14px] font-medium text-[#a1a1aa] uppercase tracking-wider">
                  Unmapped Active SDK Connections ({unmappedAgents.length})
                </h2>
              </div>
              <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] overflow-hidden">
                <div className="border-b border-[#27272a] bg-[#0d0d0d] px-4 py-2.5 text-[12px] text-[#71717a] leading-relaxed">
                  We are receiving telemetry from these agent IDs, but they do not correspond to any registered profiles in this workspace. Create an agent profile with the matching SDK ID to map them.
                </div>
                <ul className="divide-y divide-[#27272a]">
                  {unmappedAgents.map((agent) => (
                    <li
                      key={agent.agent_id}
                      className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 hover:bg-[#141414]/10 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#27272a] bg-[#141414]">
                          <Cpu className="h-4 w-4 text-[#a1a1aa]" />
                        </div>
                        <div>
                          <p className="font-mono text-[13px] font-medium text-[#fafafa]">
                            {agent.agent_id}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#52525b]">
                            {agent.decision_count} decisions processed · Last active{" "}
                            {relativeTime(agent.last_received_at)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/${org?.workspace_slug}/agents/profiles?new=1&sdk_id=${encodeURIComponent(agent.agent_id)}`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#27272a] bg-black px-3 py-1.5 text-[11px] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa] transition"
                      >
                        Create Profile
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Verification Tip */}
          <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a]/50 p-4 text-[12px] text-[#71717a] flex items-start gap-3">
            <Info className="h-4 w-4 text-[#a1a1aa] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-[#a1a1aa]">How does connection mapping work?</p>
              <p className="mt-1 leading-relaxed">
                When sending an observation through the SDK, you specify an <code className="text-[#a1a1aa] font-mono">agentId</code> parameter (e.g. <code className="text-[#a1a1aa] font-mono">agent_001</code>). If you create an Agent Profile on Histeeria and set its "SDK agent ID" to that exact value, the connection is instantly mapped, unlocking specialized behavior metrics, chart history, and telemetry tracking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
