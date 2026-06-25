import { redirect } from "next/navigation";

import { getCurrentUserProfile, requireSession } from "@/lib/server";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}

export default async function WorkspaceLayout({ children, params }: LayoutProps) {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.user.onboarded || !profile.organization?.workspace_slug) {
    redirect("/onboarding");
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  if (resolvedParams.workspace_slug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/dashboard`);
  }

  return children;
}
