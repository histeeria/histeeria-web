import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getCurrentUserProfile, requireSession } from "@/lib/server";

export default async function OnboardingPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (profile?.user.onboarded && profile?.organization?.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/dashboard`);
  }

  return (
    <AuthProvider>
      <OnboardingFlow />
    </AuthProvider>
  );
}
