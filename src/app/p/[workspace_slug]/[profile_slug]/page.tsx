import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";

import { getPublicAgentProfile } from "@/lib/api";

interface PageProps {
  params: Promise<{ workspace_slug: string; profile_slug: string }> | {
    workspace_slug: string;
    profile_slug: string;
  };
}

export default async function PublicAgentProfilePage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;

  let profile: Awaited<ReturnType<typeof getPublicAgentProfile>>;
  try {
    profile = await getPublicAgentProfile(resolved.workspace_slug, resolved.profile_slug);
  } catch {
    notFound();
  }

  const domainLabel = profile.domain?.replace(/_/g, " ") ?? null;

  return (
    <div className="min-h-screen bg-black text-[#fafafa]">
      <header className="border-b border-[#27272a] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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
            Public profile
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[12px] text-[#52525b]">{profile.workspace_name}</p>
        <h1 className="mt-1 text-[32px] font-medium tracking-tight text-[#fafafa]">
          {profile.name}
        </h1>
        <p className="mt-1 font-mono text-[12px] text-[#52525b]">/{profile.slug}</p>

        {profile.description ? (
          <p className="mt-6 text-[15px] leading-relaxed text-[#d4d4d8]">{profile.description}</p>
        ) : (
          <p className="mt-6 text-[14px] text-[#71717a]">No description provided.</p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {domainLabel ? (
            <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
              <p className="text-[11px] text-[#52525b]">Domain</p>
              <p className="mt-1 text-[14px] capitalize text-[#fafafa]">{domainLabel}</p>
            </div>
          ) : null}
          {profile.sdk_agent_id ? (
            <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
              <p className="text-[11px] text-[#52525b]">SDK agent ID</p>
              <p className="mt-1 font-mono text-[14px] text-[#fafafa]">{profile.sdk_agent_id}</p>
            </div>
          ) : null}
        </div>

        <p className="mt-10 text-[11px] text-[#52525b]">
          Last updated {new Date(profile.updated_at).toLocaleDateString()}. This is a read-only
          public profile — judgment scores and internal monitoring data are not shown here.
        </p>
      </main>
    </div>
  );
}
