import { SettingsManager } from "@/components/settings/settings-manager";
import { getSettings } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}

export default async function SettingsPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile?.organization?.workspace_slug) redirect("/onboarding");

  const resolved = params instanceof Promise ? await params : params;
  if (resolved.workspace_slug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/settings`);
  }

  const token = await getSessionToken();
  if (!token) notFound();

  let settings = null;
  try {
    settings = await getSettings(token);
  } catch {
    notFound();
  }

  return (
    <SettingsManager
      initial={settings}
      workspaceSlug={resolved.workspace_slug}
    />
  );
}
