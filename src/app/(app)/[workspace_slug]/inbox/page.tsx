import { notFound, redirect } from "next/navigation";

import { InboxManager } from "@/components/inbox/inbox-manager";
import { getInbox } from "@/lib/api";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string }> | { workspace_slug: string };
}

export default async function InboxPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile?.organization?.workspace_slug) redirect("/onboarding");

  const resolved = params instanceof Promise ? await params : params;
  if (resolved.workspace_slug !== profile.organization.workspace_slug) {
    redirect(`/${profile.organization.workspace_slug}/inbox`);
  }

  const token = await getSessionToken();
  if (!token) notFound();

  let initialMessages: Awaited<ReturnType<typeof getInbox>>["messages"] = [];
  let initialUnreadCount = 0;
  try {
    const data = await getInbox(token);
    initialMessages = data.messages;
    initialUnreadCount = data.unread_count;
  } catch {
    initialMessages = [];
  }

  return (
    <InboxManager
      workspaceSlug={resolved.workspace_slug}
      initialMessages={initialMessages}
      initialUnreadCount={initialUnreadCount}
    />
  );
}
