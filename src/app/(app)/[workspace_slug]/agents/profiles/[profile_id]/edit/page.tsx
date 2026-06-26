import { notFound, redirect } from "next/navigation";

import { AgentProfileEditForm } from "@/components/agents/agent-profile-edit-form";
import { getAgentProfileDetail } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string; profile_id: string }> | {
    workspace_slug: string;
    profile_id: string;
  };
}

export default async function AgentProfileEditPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const me = await getCurrentUserProfile();
  if (!me?.organization?.workspace_slug) redirect("/onboarding");

  const resolved = params instanceof Promise ? await params : params;
  if (resolved.workspace_slug !== me.organization.workspace_slug) {
    redirect(`/${me.organization.workspace_slug}/agents/profiles/${resolved.profile_id}/edit`);
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
    <AgentProfileEditForm
      profile={detail.profile}
      workspaceSlug={resolved.workspace_slug}
    />
  );
}
