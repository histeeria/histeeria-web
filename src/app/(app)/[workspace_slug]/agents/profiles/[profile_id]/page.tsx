import { notFound, redirect } from "next/navigation";

import { AgentProfileDetail } from "@/components/agents/agent-profile-detail";
import { getAgentProfileDetail } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string; profile_id: string }> | {
    workspace_slug: string;
    profile_id: string;
  };
}

export default async function AgentProfileDetailPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile?.organization?.workspace_slug) redirect("/onboarding");

  const resolved = params instanceof Promise ? await params : params;
  if (resolved.workspace_slug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/agents/profiles/${resolved.profile_id}`);
  }

  const token = await getSessionToken();
  if (!token) notFound();

  let detail = null;
  try {
    detail = await getAgentProfileDetail(token, resolved.profile_id);
  } catch {
    notFound();
  }

  return (
    <AgentProfileDetail
      initial={detail}
      workspaceSlug={resolved.workspace_slug}
    />
  );
}
