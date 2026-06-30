"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clipboard, Loader2, Plus } from "lucide-react";

import { DOMAINS } from "@/lib/api";
import type { AgentProfileSummary, ApiKeySummary } from "@/lib/api";
import { cn } from "@/lib/utils";

interface GetStartedChecklistProps {
  workspaceSlug: string;
  initialProfiles: AgentProfileSummary[];
  initialKeys: ApiKeySummary[];
  hasDecisions: boolean;
}

function StepBadge({ done, number }: { done: boolean; number: number }) {
  if (done) {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#27272a]">
        <Check className="h-3 w-3 text-[#fafafa]" />
      </div>
    );
  }

  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#27272a] text-[11px] text-[#71717a]">
      {number}
    </div>
  );
}

export function GetStartedChecklist({
  workspaceSlug,
  initialProfiles,
  initialKeys,
  hasDecisions,
}: GetStartedChecklistProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [keys, setKeys] = useState(initialKeys);
  const [profileName, setProfileName] = useState("");
  const [profileDomain, setProfileDomain] = useState("general");
  const [profileDescription, setProfileDescription] = useState("");
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [sdkLang, setSdkLang] = useState<"python" | "typescript">("python");

  const primaryProfile = profiles[0] ?? null;
  const activeKeys = keys.filter((key) => key.status === "active");
  const hasProfile = profiles.length > 0;
  const hasKey = activeKeys.length > 0;
  const sdkComplete = hasDecisions;

  const sdkAgentId = primaryProfile?.sdk_agent_id ?? primaryProfile?.slug ?? "agent_001";
  const sdkDomain = primaryProfile?.domain ?? "general";
  const keyForSnippet = revealedKey ?? activeKeys[0]?.secret_masked ?? "hst_live_xxxx";

  const installCommands = {
    python: "pip install histeeria",
    typescript: "npm install histeeria",
  };

  const codeSnippets = {
    python: `from histeeria import Histeeria

h = Histeeria(api_key="${keyForSnippet}")

response = your_llm_call(messages)

h.observe(
    input=messages,
    output=response,
    agent_id="${sdkAgentId}",
    session_id="sess_abc",
    domain="${sdkDomain}"
)`,
    typescript: `import { Histeeria } from "histeeria";

const h = new Histeeria({ apiKey: "${keyForSnippet}" });

const response = await yourLLMCall(messages);

h.observe({
  input: messages,
  output: response,
  agentId: "${sdkAgentId}",
  sessionId: "sess_abc",
  domain: "${sdkDomain}"
});`,
  };

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim()) return;

    setCreatingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/agent-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          domain: profileDomain,
          description: profileDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create agent profile");
      }
      setProfiles((current) => [...current, data]);
      setProfileName("");
      setProfileDescription("");
      router.refresh();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to create agent profile");
    } finally {
      setCreatingProfile(false);
    }
  }

  async function handleGenerateKey() {
    if (!primaryProfile) return;

    setCreatingKey(true);
    setKeyError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${primaryProfile.name} — Primary`,
          agent_name: primaryProfile.name,
          agent_profile_id: primaryProfile.id,
          permissions: "read_write",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate API key");
      }
      setRevealedKey(data.api_key);
      setKeys((current) => [data, ...current]);
      router.refresh();
    } catch (error) {
      setKeyError(error instanceof Error ? error.message : "Failed to generate API key");
    } finally {
      setCreatingKey(false);
    }
  }

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
    <div className="space-y-5 p-4">
      <p className="text-[13px] leading-relaxed text-[#71717a]">
        Complete these steps to connect your first agent and start monitoring decisions.
      </p>

      {/* Step 1 — Agent profile */}
      <div className="flex gap-3">
        <StepBadge done={hasProfile} number={1} />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-[#fafafa]">Create your 1st agent profile</p>
          {hasProfile ? (
            <p className="mt-1 text-[12px] text-[#71717a]">
              {primaryProfile?.name} is ready. You can add more profiles later from Agents.
            </p>
          ) : (
            <form onSubmit={handleCreateProfile} className="mt-3 space-y-3">
              <input
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Agent name, e.g. Support Bot"
                className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              />
              <select
                value={profileDomain}
                onChange={(e) => setProfileDomain(e.target.value)}
                className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              >
                {DOMAINS.map((domain) => (
                  <option key={domain.value} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
              <textarea
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                placeholder="What does this agent do? (optional)"
                rows={2}
                className="w-full resize-none rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              />
              {profileError ? (
                <p className="text-[12px] text-red-300">{profileError}</p>
              ) : null}
              <button
                type="submit"
                disabled={creatingProfile}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e4e4e7] disabled:opacity-60"
              >
                {creatingProfile ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Create agent profile
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Step 2 — API key */}
      <div className={cn("flex gap-3", !hasProfile && "opacity-50")}>
        <StepBadge done={hasKey} number={2} />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-[#fafafa]">Generate your API key</p>
          {!hasProfile ? (
            <p className="mt-1 text-[12px] text-[#71717a]">Create an agent profile first.</p>
          ) : hasKey ? (
            <div className="mt-2 flex items-center justify-between rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2">
              <code className="font-mono text-[12px] text-[#a1a1aa]">
                {revealedKey ?? activeKeys[0]?.secret_masked}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(revealedKey ?? activeKeys[0]?.secret_masked ?? "")}
                className="text-[#71717a] hover:text-[#fafafa]"
              >
                {copiedKey ? (
                  <span className="text-[11px]">Copied</span>
                ) : (
                  <Clipboard className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-[12px] text-[#71717a]">
                Generate a secret key for {primaryProfile?.name}. It is shown once.
              </p>
              {keyError ? <p className="text-[12px] text-red-300">{keyError}</p> : null}
              <button
                type="button"
                disabled={creatingKey}
                onClick={handleGenerateKey}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e4e4e7] disabled:opacity-60"
              >
                {creatingKey ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Generate API key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 — SDK */}
      <div className={cn("flex gap-3", !hasKey && "opacity-50")}>
        <StepBadge done={sdkComplete} number={3} />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-[#fafafa]">Integrate the SDK</p>
          {!hasKey ? (
            <p className="mt-1 text-[12px] text-[#71717a]">Generate an API key first.</p>
          ) : sdkComplete ? (
            <p className="mt-1 text-[12px] text-[#43d29e]">First decision received. You&apos;re live.</p>
          ) : (
            <>
              <div className="mt-2 overflow-hidden rounded-[8px] border border-[#27272a]">
                <div className="flex gap-1 border-b border-[#27272a] bg-[#141414] px-3 py-2">
                  {(["python", "typescript"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSdkLang(lang)}
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
              <p className="mt-2 flex items-center gap-2 text-[12px] text-[#71717a]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52525b] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#71717a]" />
                </span>
                Listening for your first decision...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
