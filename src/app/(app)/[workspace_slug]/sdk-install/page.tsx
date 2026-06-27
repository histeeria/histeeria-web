import { notFound, redirect } from "next/navigation";

import { SdkInstallManager } from "@/components/agents/sdk-install-manager";
import { getDecisionAgents, listAgentProfiles, listApiKeys } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}

export default async function SdkInstallPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile?.organization?.workspace_slug) redirect("/onboarding");

  const resolved = params instanceof Promise ? await params : params;
  if (resolved.workspace_slug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/sdk-install`);
  }

  const token = await getSessionToken();
  if (!token) notFound();

  let initialAgents: Awaited<ReturnType<typeof getDecisionAgents>>["agents"] = [];
  let initialProfiles: Awaited<ReturnType<typeof listAgentProfiles>>["profiles"] = [];
  let initialKeys: Awaited<ReturnType<typeof listApiKeys>>["keys"] = [];

  try {
    const [agentsData, profilesData, keysData] = await Promise.all([
      getDecisionAgents(token),
      listAgentProfiles(token),
      listApiKeys(token),
    ]);
    initialAgents = agentsData.agents;
    initialProfiles = profilesData.profiles;
    initialKeys = keysData.keys;
  } catch (error) {
    console.error("Failed to load SDK install data:", error);
  }

  return (
    <SdkInstallManager
      profile={profile}
      initialAgents={initialAgents}
      initialProfiles={initialProfiles}
      initialKeys={initialKeys}
    />
  );
}
