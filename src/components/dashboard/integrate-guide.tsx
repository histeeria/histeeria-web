"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Lang = "python" | "typescript";

const INSTALL: Record<Lang, string> = {
  python: "pip install histeeria",
  typescript: "npm install histeeria",
};

function snippet(lang: Lang, keyLabel: string): string {
  if (lang === "python") {
    return `from histeeria import Histeeria

h = Histeeria(api_key="${keyLabel}")

response = your_llm_call(messages)

h.observe(
    input=messages,
    output=response,
    agent_id="agent_001",
    session_id="sess_abc",
    domain="customer_support",
)`;
  }
  return `import { Histeeria } from "histeeria";

const h = new Histeeria({ apiKey: "${keyLabel}" });

const response = await yourLLMCall(messages);

h.observe({
  input: messages,
  output: response,
  agentId: "agent_001",
  sessionId: "sess_abc",
  domain: "customer_support",
});`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-2 px-2.5 py-1 text-xs text-muted transition hover:border-accent/45 hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function IntegrateGuide({ keyLabel }: { keyLabel: string }) {
  const [lang, setLang] = useState<Lang>("python");

  return (
    <div className="panel rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Integrate in 2 lines</h2>
          <p className="mt-1 text-sm text-muted">
            Wrap any LLM call. Decisions stream in live — zero latency on your agent.
          </p>
        </div>
        <div className="flex rounded-lg border border-border-strong bg-surface-2 p-1 text-sm">
          {(["python", "typescript"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-md px-3 py-1.5 capitalize transition ${
                lang === l ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {l === "typescript" ? "TypeScript" : "Python"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Install</p>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border-strong bg-[#0a0e16] px-4 py-3">
            <code className="font-mono text-sm text-foreground">{INSTALL[lang]}</code>
            <CopyButton text={INSTALL[lang]} />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Send your first decision
          </p>
          <div className="relative rounded-lg border border-border-strong bg-[#0a0e16] p-4">
            <div className="absolute right-3 top-3">
              <CopyButton text={snippet(lang, keyLabel)} />
            </div>
            <pre className="overflow-x-auto pr-16 font-mono text-[13px] leading-relaxed text-foreground/90">
              <code>{snippet(lang, keyLabel)}</code>
            </pre>
          </div>
          <p className="mt-2 text-xs text-muted">
            Use your full API key from onboarding. Lost it? Regenerate from settings.
          </p>
        </div>
      </div>
    </div>
  );
}
