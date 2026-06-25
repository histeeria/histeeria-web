import { redirect } from "next/navigation";
import { getCurrentUserProfile, requireSession } from "@/lib/server";

export default async function DashboardRedirectPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  if (!profile.user.onboarded || !profile.organization?.workspace_slug) {
    redirect("/onboarding");
  }

  redirect(`/${profile.organization.workspace_slug}/dashboard`);
}
