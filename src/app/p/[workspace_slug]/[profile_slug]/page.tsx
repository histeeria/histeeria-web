import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";

import { AgentProfileView } from "@/components/agents/agent-profile-view";
import { getPublicAgentProfile } from "@/lib/api";
import { profilePageMetadata, SITE_URL } from "@/lib/metadata";

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
    description: profile.description ?? `${profile.name} public agent profile on Histeeria.`,
    url: pageUrl,
    dateModified: profile.updated_at,
    isPartOf: { "@type": "WebSite", name: "Histeeria", url: SITE_URL },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: profile.name,
      applicationCategory: "AI Agent",
      description: profile.description ?? undefined,
      operatingSystem: "Web",
      url: pageUrl,
      author: { "@type": "Organization", name: profile.workspace_name },
    },
  };

  return (
    <div className="min-h-screen bg-black text-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-[#27272a] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="https://histeeria.com" className="flex items-center gap-2.5">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-[13px] font-medium text-[#71717a]">Histeeria</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14532d]/30 px-2.5 py-1 text-[11px] text-[#86efac]">
            <Globe className="h-3 w-3" />
            Public agent profile
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <AgentProfileView
          profile={profile}
          dashboard={profile.dashboard}
          workspaceName={profile.workspace_name}
          mode="public"
          publicSections={profile.public_sections}
        />
      </main>
    </div>
  );
}
