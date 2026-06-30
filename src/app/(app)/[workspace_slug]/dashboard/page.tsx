import { redirect } from "next/navigation";

import { ApiStatusBanner } from "@/components/layout/api-status-banner";
import { CommandCenter } from "@/components/dashboard/command-center";
import { getDecisions, getDecisionStats, listAgentProfiles, listApiKeys } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}) {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = params instanceof Promise ? await params : params;
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
      const [stats, list, profilesResponse, keysResponse] = await Promise.all([
        getDecisionStats(token),
        getDecisions(token, { limit: 25 }),
        listAgentProfiles(token),
        listApiKeys(token),
      ]);
      initialData = {
        stats,
        decisions: list.decisions,
        total: list.total,
        profiles: profilesResponse.profiles,
        keys: keysResponse.keys,
      };
    } catch {
      initialData = undefined;
    }
  }

  return (
    <CommandCenter
      initial={initialData}
      profile={profile}
      workspaceSlug={resolvedParams.workspace_slug}
    />
  );
}
