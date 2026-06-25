import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, Radar } from "lucide-react";

import { ApiStatusBanner } from "@/components/layout/api-status-banner";
import { getCurrentUserProfile, requireSession } from "@/lib/server";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return <ApiStatusBanner message="We couldn't reach the API. Check your connection and try again." />;
  }

  if (!profile.user.onboarded) {
    redirect("/onboarding");
  }

  const org = profile.organization;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {org?.agent_name ?? "Your agent"}
        </h1>
        <p className="text-sm text-muted">
          Install the SDK to start sending decisions. Judgment monitoring begins with your first
          observation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel rounded-2xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
            <Radar className="h-5 w-5" />
          </div>
          <h2 className="font-medium">Observations</h2>
          <p className="mt-1 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-muted">Decisions received</p>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 className="font-medium">API key</h2>
          <p className="mt-1 font-mono text-sm text-muted">
            {org?.key_prefix ?? "hst_live_"}••••{org?.key_suffix ?? "----"}
          </p>
          <p className="mt-1 text-xs text-muted">Active live key</p>
        </div>

        <div className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Domain</p>
          <p className="mt-2 text-lg font-medium capitalize">
            {org?.domain_name?.replaceAll("_", " ") ?? "General"}
          </p>
          <p className="mt-1 text-xs text-muted">{org?.workspace_name}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-strong bg-surface-2 p-8 text-center">
        <h2 className="text-xl font-semibold">Ready when you are</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Connect your agent with the Histeeria SDK. Every decision you send will be scored across
          eight judgment dimensions.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="https://histeeria.com/docs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-6 text-sm font-medium text-white transition hover:bg-[#7181f4]"
          >
            View integration guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
