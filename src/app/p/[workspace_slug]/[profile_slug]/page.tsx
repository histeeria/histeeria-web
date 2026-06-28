import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentProfileLanding } from "@/components/agents/agent-profile-landing";
import { PublicProfileHeader } from "@/components/agents/public-profile-header";
import { PublicProfileThemeProvider } from "@/components/agents/public-profile-theme";
import { getPublicAgentProfile } from "@/lib/api";
import { DEFAULT_OG_IMAGE, profilePageMetadata, SITE_URL } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ workspace_slug: string; profile_slug: string }> | {
    workspace_slug: string;
    profile_slug: string;
  };
}

async function resolveParams(params: PageProps["params"]) {
  return params instanceof Promise ? await params : params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await resolveParams(params);

  try {
    const profile = await getPublicAgentProfile(resolved.workspace_slug, resolved.profile_slug);
    return profilePageMetadata({
      name: profile.name,
      description: profile.description,
      workspaceName: profile.workspace_name,
      workspaceSlug: profile.workspace_slug,
      profileSlug: profile.slug,
      updatedAt: profile.updated_at,
      ogImageUrl: profile.agent_avatar_url ?? undefined,
    });
  } catch {
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }
}

export default async function PublicAgentProfilePage({ params }: PageProps) {
  const resolved = await resolveParams(params);

  let profile: Awaited<ReturnType<typeof getPublicAgentProfile>>;
  try {
    profile = await getPublicAgentProfile(resolved.workspace_slug, resolved.profile_slug);
  } catch {
    notFound();
  }

  const pageUrl = `${SITE_URL}/p/${profile.workspace_slug}/${profile.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: profile.name,
    description: profile.description ?? `${profile.name} — AI agent on Histeeria`,
    url: pageUrl,
    dateModified: profile.updated_at,
    image: profile.agent_avatar_url ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    isPartOf: { "@type": "WebSite", name: "Histeeria", url: SITE_URL },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: profile.name,
      applicationCategory: "AI Agent",
      description: profile.description ?? undefined,
      image: profile.agent_avatar_url ?? undefined,
      operatingSystem: "Web",
      url: pageUrl,
      author: {
        "@type": "Person",
        name: profile.owner_profile.name ?? profile.workspace_name,
      },
    },
  };

  return (
    <PublicProfileThemeProvider slug={profile.slug}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicProfileHeader
        agentName={profile.name}
        profileSlug={profile.slug}
        workspaceSlug={profile.workspace_slug}
      />

      <main className="mx-auto max-w-[1360px] px-4 pb-10 pt-8 md:px-6">
        <AgentProfileLanding
          profile={{
            ...profile,
            id: "",
            is_public: true,
            created_at: profile.updated_at,
          }}
          dashboard={profile.dashboard}
          workspaceName={profile.workspace_name}
          workspaceSlug={profile.workspace_slug}
          mode="public"
          publicSections={profile.public_sections}
        />
      </main>
    </PublicProfileThemeProvider>
  );
}
