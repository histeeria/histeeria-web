import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentProfileLanding } from "@/components/agents/agent-profile-landing";
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
    <div className="min-h-screen bg-black text-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Public landing header */}
      <header className="border-b border-[#27272a]/80 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="https://histeeria.com" className="flex items-center gap-2.5">
            <Image src="/logo-dark1.png" alt="Histeeria" width={36} height={36} className="h-9 w-auto object-contain" />
            <span className="hidden text-[13px] font-medium text-[#71717a] sm:inline">Histeeria</span>
          </Link>
          <Link
            href="https://histeeria.com"
            className="rounded-full border border-[#27272a] px-4 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]"
          >
            Build your agent profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
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
    </div>
  );
}
