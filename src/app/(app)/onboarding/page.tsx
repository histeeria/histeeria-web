import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentUserProfile, requireSession } from "@/lib/server";

export default async function OnboardingPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (profile?.user.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
