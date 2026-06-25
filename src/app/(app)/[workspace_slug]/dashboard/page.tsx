import { redirect } from "next/navigation";

import { ApiStatusBanner } from "@/components/layout/api-status-banner";
import { CommandCenter } from "@/components/dashboard/command-center";
import { getDecisions, getDecisionStats } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}

export default async function WorkspaceDashboardPage({ params }: PageProps) {
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

  if (!profile.user.onboarded || !profile.organization?.workspace_slug) {
    redirect("/onboarding");
  }

  // Await params if it's a promise (standard robust Next.js App Router practice)
  const resolvedParams = params instanceof Promise ? await params : params;
  const urlSlug = resolvedParams?.workspace_slug;

  // Security & URL Sync: If the user visits the wrong workspace slug, redirect them to their actual workspace
  if (urlSlug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/dashboard`);
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
