import { redirect } from "next/navigation";

import { ApiStatusBanner } from "@/components/layout/api-status-banner";
import { IntegrateGuide } from "@/components/dashboard/integrate-guide";
import { LiveDecisions } from "@/components/dashboard/live-decisions";
import { getDecisions, getDecisionStats } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return (
      <ApiStatusBanner message="We couldn't reach the API. Check your connection and try again." />
    );
  }

  if (!profile.user.onboarded) {
    redirect("/onboarding");
  }

  const org = profile.organization;
  const keyLabel = org?.key_prefix
    ? `${org.key_prefix}••••${org.key_suffix ?? "----"}`
    : "hst_live_xxxx";

  const token = await getSessionToken();
  let initial;
  if (token) {
    try {
      const [stats, list] = await Promise.all([
        getDecisionStats(token),
        getDecisions(token, 25),
      ]);
      initial = { stats, decisions: list.decisions, total: list.total };
    } catch {
      initial = undefined;
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">{org?.agent_name ?? "Your agent"}</h1>
        <p className="text-sm text-muted">
          {org?.workspace_name ? `${org.workspace_name} · ` : ""}
          Monitoring {org?.domain_name?.replaceAll("_", " ") ?? "general"} decisions in real time.
        </p>
      </div>

      <LiveDecisions initial={initial} />

      <IntegrateGuide keyLabel={keyLabel} />
    </div>
  );
}
