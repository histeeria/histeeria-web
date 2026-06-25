import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/server";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.user.onboarded) {
    redirect("/onboarding");
  }

  if (profile.organization?.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/dashboard`);
  }

  redirect("/dashboard");
}
