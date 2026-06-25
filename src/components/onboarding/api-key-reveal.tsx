"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ApiKeyReveal({
  apiKey,
  onContinue,
}: {
  apiKey: string;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Ready</p>
        <h2 className="text-2xl font-semibold">Your API key</h2>
        <p className="text-sm text-muted">
          Copy this key now. For security, we won&apos;t show it again.
        </p>
      </div>

      <div className="rounded-2xl border border-gold/30 bg-gold-soft p-4">
        <code className="block break-all font-mono text-sm text-gold">{apiKey}</code>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" className="flex-1" onClick={copyKey}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy key"}
        </Button>
        <Button type="button" className="flex-1" onClick={onContinue}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
