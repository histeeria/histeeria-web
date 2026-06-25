import { redirect } from "next/navigation";

import { ApiStatusBanner } from "@/components/layout/api-status-banner";
import { CommandCenter } from "@/components/dashboard/command-center";
import { getDecisions, getDecisionStats } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

export default async function WorkspaceDashboardPage() {
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

  const token = await getSessionToken();
  let initialData;
  if (token) {
    try {
      const [stats, list] = await Promise.all([
        getDecisionStats(token),
        getDecisions(token, 25),
      ]);
      initialData = { stats, decisions: list.decisions, total: list.total };
    } catch {
      initialData = undefined;
    }
  }

  return <CommandCenter initial={initialData} profile={profile} />;
}
