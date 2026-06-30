import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getCurrentUserProfile, requireSession } from "@/lib/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  return (
    <AuthProvider>
      <AppShell
        workspaceName={profile?.organization?.workspace_name}
        workspaceSlug={profile?.organization?.workspace_slug}
        userAvatar={profile?.user.avatar_url}
      >
        {children}
      </AppShell>
    </AuthProvider>
  );
}
