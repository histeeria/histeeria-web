import { notFound } from "next/navigation";

import { ApiKeysManager } from "@/components/agents/api-keys-manager";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { listApiKeys } from "@/lib/api";
import { AGENT_SECTIONS, SECTION_LABELS } from "@/lib/navigation";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string; section: string }> | {
    workspace_slug: string;
    section: string;
  };
}

export default async function AgentSectionPage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) {
    notFound();
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    notFound();
  }

  const resolved = params instanceof Promise ? await params : params;
  const section = resolved.section;

  if (!AGENT_SECTIONS.includes(section as (typeof AGENT_SECTIONS)[number])) {
    notFound();
  }

  if (section === "api-keys") {
    const token = await getSessionToken();
    let initialKeys: Awaited<ReturnType<typeof listApiKeys>>["keys"] = [];
    if (token) {
      try {
        const data = await listApiKeys(token);
        initialKeys = data.keys;
      } catch {
        initialKeys = [];
      }
    }

    return (
      <ApiKeysManager
        profile={profile}
        workspaceSlug={resolved.workspace_slug}
        initialKeys={initialKeys}
      />
    );
  }

  const title = SECTION_LABELS[section] ?? section;

  return (
    <SectionPlaceholder
      title={title}
      description={`Agent ${title.toLowerCase()} tools and data will be available here.`}
    />
  );
}
