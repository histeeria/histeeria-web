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

import type { AgentSummary, AgentProfileSummary, ApiKeySummary, MeResponse } from "@/lib/api";
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
  initialKeys: ApiKeySummary[];
}

export function SdkInstallManager({
  profile,
  initialAgents,
  initialProfiles,
  initialKeys,
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
    agent_id="orchestrator",  # optional: labels sub-components inside your agent
    session_id="sess_abc",
    domain="general"
)`,
    typescript: `import { Histeeria } from "histeeria";

const h = new Histeeria({ apiKey: "${keyPrefix}xxxx" });

const response = await yourLLMCall(messages);

h.observe({
  input: messages,
  output: response,
  agentId: "orchestrator", // optional: labels sub-components inside your agent
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

  const profileStatuses = initialProfiles.map((agentProfile) => {
    const linkedKey = initialKeys.find(
      (key) => key.agent_profile_id === agentProfile.id && key.status === "active",
    );
    const canonicalId = agentProfile.sdk_agent_id ?? agentProfile.slug;
    const activity = initialAgents.find(
      (agent) =>
        agent.profile_id === agentProfile.id ||
        agent.agent_id.toLowerCase() === canonicalId.toLowerCase(),
    );
    return {
      profile: agentProfile,
      linkedKey,
      canonicalId,
      isConnected: !!linkedKey && !!activity && activity.decision_count > 0,
      decisionCount: activity?.decision_count ?? 0,
      lastReceivedAt: activity?.last_received_at ?? null,
      subAgents: activity?.sub_agents ?? [],
    };
  });

  const connectedCount = profileStatuses.filter((item) => item.isConnected).length;
  const unlinkedKeys = initialKeys.filter(
    (key) => key.status === "active" && !key.agent_profile_id,
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
          {connectedCount > 0 && (
            <span className="ml-1.5 rounded-full bg-[#14532d]/40 px-1.5 py-0.5 text-[10px] font-medium text-[#86efac]">
              {connectedCount} Connected
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
                Create an agent profile in Histeeria, generate an API key linked to that profile, then initialize the SDK with that key. All sub-components inside your agent (orchestrators, models, tools) roll up under the same profile automatically — use <code className="text-[#fafafa] font-mono">agent_id</code> in observe calls only to label internal components.
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

            {profileStatuses.length === 0 ? (
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
                {profileStatuses.map(
                  ({ profile: p, linkedKey, canonicalId, isConnected, decisionCount, lastReceivedAt, subAgents }) => (
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
                          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#52525b]">
                            <span>Agent ID:</span>
                            <span className="text-[#a1a1aa] bg-[#141414] px-1.5 py-0.5 rounded border border-[#27272a]">
                              {canonicalId}
                            </span>
                            {linkedKey ? (
                              <span className="text-[#86efac]">Key linked</span>
                            ) : (
                              <span className="text-[#fbbf24]">No API key linked</span>
                            )}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                            isConnected
                              ? "bg-[#14532d]/20 text-[#86efac] border-[#14532d]/40"
                              : linkedKey
                                ? "bg-[#422006]/50 text-[#fbbf24] border-[#78350f]/40"
                                : "bg-[#27272a]/40 text-[#71717a] border-[#27272a]"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isConnected ? "animate-pulse bg-[#86efac]" : "bg-[#52525b]"
                            )}
                          />
                          {isConnected ? "Connected" : linkedKey ? "Awaiting data" : "Not linked"}
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-[12px] text-[#71717a] min-h-[32px]">
                        {p.description || "No description provided."}
                      </p>

                      {subAgents.length > 0 ? (
                        <p className="mt-2 text-[11px] text-[#52525b]">
                          {subAgents.length} internal components reporting
                        </p>
                      ) : null}
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

          {unlinkedKeys.length > 0 && (
            <div className="pt-2">
              <div className="mb-3 flex items-center gap-2">
                <Key className="h-4 w-4 text-[#fbbf24]" />
                <h2 className="text-[14px] font-medium text-[#a1a1aa] uppercase tracking-wider">
                  API Keys Without Agent Profile ({unlinkedKeys.length})
                </h2>
              </div>
              <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] overflow-hidden">
                <div className="border-b border-[#27272a] bg-[#0d0d0d] px-4 py-2.5 text-[12px] text-[#71717a] leading-relaxed">
                  Link each API key to an agent profile so all SDK observations roll up under that agent — including orchestrators and sub-models.
                </div>
                <ul className="divide-y divide-[#27272a]">
                  {unlinkedKeys.map((key) => (
                    <li
                      key={key.id}
                      className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-[#fafafa]">{key.name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[#52525b]">{key.secret_masked}</p>
                      </div>
                      <Link
                        href={`/${org?.workspace_slug}/agents/api-keys`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#27272a] bg-black px-3 py-1.5 text-[11px] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa] transition"
                      >
                        Link to profile
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a]/50 p-4 text-[12px] text-[#71717a] flex items-start gap-3">
            <Info className="h-4 w-4 text-[#a1a1aa] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-[#a1a1aa]">How agent identity works</p>
              <p className="mt-1 leading-relaxed">
                Your Histeeria agent profile is the parent identity. The API key authenticates traffic for that agent. The optional <code className="text-[#a1a1aa] font-mono">agent_id</code> in SDK observe calls labels internal components (orchestrator, synthesis, security scanner, etc.) — they all roll up under the same profile for monitoring, evaluation, and analytics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
