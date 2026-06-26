import { notFound } from "next/navigation";

import { AgentMonitoring } from "@/components/agents/agent-monitoring";
import { AgentProfilesManager } from "@/components/agents/agent-profiles-manager";
import { ApiKeysManager } from "@/components/agents/api-keys-manager";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { getDecision, getDecisionAgents, getDecisions, listAgentProfiles, listApiKeys } from "@/lib/api";
import { AGENT_SECTIONS, SECTION_LABELS } from "@/lib/navigation";
import { getCurrentUserProfile, getSessionToken, requireSession } from "@/lib/server";

interface PageProps {
  params: Promise<{ workspace_slug: string; section: string }> | {
    workspace_slug: string;
    section: string;
  };
  searchParams?: Promise<{ new?: string; edit?: string }> | { new?: string; edit?: string };
}

export default async function AgentSectionPage({ params, searchParams }: PageProps) {
  const session = await requireSession();
  if (!session) {
    notFound();
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    notFound();
  }

  const resolved = params instanceof Promise ? await params : params;
  const resolvedSearch = searchParams
    ? searchParams instanceof Promise
      ? await searchParams
      : searchParams
    : {};
  const section = resolved.section;

  if (!AGENT_SECTIONS.includes(section as (typeof AGENT_SECTIONS)[number])) {
    notFound();
  }

  if (section === "monitoring") {
    const token = await getSessionToken();
    let initialAgents: Awaited<ReturnType<typeof getDecisionAgents>>["agents"] = [];
    let initialDecisions: Awaited<ReturnType<typeof getDecisions>>["decisions"] = [];

    let initialDetail: Awaited<ReturnType<typeof getDecision>> | null = null;

    if (token) {
      try {
        const agentsData = await getDecisionAgents(token);
        initialAgents = agentsData.agents;
        const agentId = initialAgents[0]?.agent_id;
        const decisionsData = await getDecisions(token, {
          limit: 100,
          agentId,
        });
        initialDecisions = decisionsData.decisions;
        if (initialDecisions[0]) {
          initialDetail = await getDecision(token, initialDecisions[0].id);
        }
      } catch {
        initialAgents = [];
        initialDecisions = [];
        initialDetail = null;
      }
    }

    return (
      <AgentMonitoring
        profile={profile}
        initialAgents={initialAgents}
        initialDecisions={initialDecisions}
        initialDetail={initialDetail}
      />
    );
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

  if (section === "profiles") {
    const token = await getSessionToken();
    let initialProfiles: Awaited<ReturnType<typeof listAgentProfiles>>["profiles"] = [];
    if (token) {
      try {
        const data = await listAgentProfiles(token);
        initialProfiles = data.profiles;
      } catch {
        initialProfiles = [];
      }
    }

    return (
      <AgentProfilesManager
        profile={profile}
        workspaceSlug={resolved.workspace_slug}
        initialProfiles={initialProfiles}
        initialOpenCreate={resolvedSearch.new === "1"}
        initialEditId={resolvedSearch.edit ?? null}
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
