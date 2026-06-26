"use client";

import Link from "next/link";
import {
  CommonFlagsList,
  CostTrendChart,
  DimensionRadar,
  JudgmentGraph,
  ProfileGradeHeader,
  WorstDecisionsList,
} from "@/components/agents/agent-profile-charts";
import { OwnerProfileSection } from "@/components/agents/owner-profile-section";
import {
  embedVideoUrl,
  isDirectVideo,
  ProfileSection,
  SECTION_LABELS,
} from "@/components/agents/profile-section";
import type {
  AgentProfileDashboard,
  AgentProfileSummary,
  ProfileLink,
  PublicSections,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export { SECTION_LABELS };

interface AgentProfileLandingProps {
  profile: AgentProfileSummary;
  dashboard: AgentProfileDashboard;
  workspaceName?: string;
  workspaceSlug?: string;
  mode: "private" | "public";
  publicSections?: PublicSections;
  isPublicEnabled?: boolean;
  onToggleSection?: (key: keyof PublicSections) => void;
}

function shouldShow(
  mode: "private" | "public",
  key: string,
  publicSections?: PublicSections,
) {
  if (mode === "private") return true;
  return Boolean(publicSections?.[key as keyof PublicSections]);
}

export function AgentProfileLanding({
  profile,
  dashboard,
  workspaceName,
  workspaceSlug,
  mode,
  publicSections,
  isPublicEnabled = false,
  onToggleSection,
}: AgentProfileLandingProps) {
  const { sections } = dashboard;
  const domainLabel = profile.domain?.replace(/_/g, " ") ?? null;
  const isPublicPage = mode === "public";

  function sectionToggle(key: keyof PublicSections) {
    return {
      showToggle: mode === "private",
      toggleDisabled: !isPublicEnabled,
      isPublic: Boolean(publicSections?.[key]),
      onToggle: () => onToggleSection?.(key),
    };
  }

  const showSummary = shouldShow(mode, "summary", publicSections);
  const showGraph = shouldShow(mode, "judgment_graph", publicSections);
  const showDimensions = shouldShow(mode, "dimensions", publicSections);
  const showFlags = shouldShow(mode, "flags", publicSections);
  const showWorst = shouldShow(mode, "worst_decisions", publicSections);
  const showCost = shouldShow(mode, "cost_trends", publicSections);
  const showDemo = shouldShow(mode, "demo_video", publicSections) && profile.demo_video_url;
  const showOwner = shouldShow(mode, "owner", publicSections);

  return (
    <div className={cn("space-y-8", isPublicPage && "pb-16")}>
      {/* Hero */}
      {(mode === "private" || showSummary) && (
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] border border-[#27272a]",
            isPublicPage
              ? "bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-black px-6 py-10 md:px-10 md:py-14"
              : "bg-[#0a0a0a] px-5 py-6",
          )}
        >
          {mode === "private" ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                disabled={!isPublicEnabled}
                onClick={() => onToggleSection?.("summary")}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px]",
                  publicSections?.summary
                    ? "border-[#14532d]/50 text-[#86efac]"
                    : "border-[#27272a] text-[#71717a]",
                )}
              >
                {publicSections?.summary ? "Overview public" : "Overview private"}
              </button>
            </div>
          ) : null}
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {profile.agent_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.agent_avatar_url}
                alt={profile.name}
                className="h-28 w-28 shrink-0 rounded-2xl border border-[#27272a] object-cover shadow-lg md:h-32 md:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-[#27272a] bg-[#141414] text-[36px] font-semibold text-[#71717a] md:h-32 md:w-32">
                {profile.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {workspaceName && isPublicPage ? (
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#52525b]">{workspaceName}</p>
              ) : null}
              <h1
                className={cn(
                  "font-medium tracking-tight text-[#fafafa]",
                  isPublicPage ? "mt-2 text-[36px] md:text-[44px]" : "text-[28px]",
                )}
              >
                {profile.name}
              </h1>
              <p className="mt-2 font-mono text-[12px] text-[#52525b]">/{profile.slug}</p>
              {profile.description ? (
                <p
                  className={cn(
                    "mt-4 max-w-2xl leading-relaxed text-[#d4d4d8]",
                    isPublicPage ? "text-[16px] md:text-[18px]" : "text-[15px]",
                  )}
                >
                  {profile.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-[#71717a]">
                {domainLabel ? (
                  <span className="rounded-full border border-[#27272a] px-3 py-1 capitalize">
                    {domainLabel}
                  </span>
                ) : null}
                {profile.sdk_agent_id ? (
                  <span className="rounded-full border border-[#27272a] px-3 py-1 font-mono">
                    {profile.sdk_agent_id}
                  </span>
                ) : null}
              </div>
              {profile.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.links.map((link: ProfileLink) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="mt-6">
                <ProfileGradeHeader
                  judgement={sections.judgement}
                  showSummary={mode === "private" || Boolean(publicSections?.summary)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!dashboard.has_sdk_agent && mode === "private" ? (
        <div className="rounded-[16px] border border-dashed border-[#27272a] px-6 py-12 text-center">
          <p className="text-[14px] text-[#a1a1aa]">Link an SDK agent ID to unlock judgment analytics.</p>
        </div>
      ) : null}

      {dashboard.has_sdk_agent ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {(mode === "private" || showGraph) && (
            <ProfileSection
              id="judgment-graph"
              title={SECTION_LABELS.judgment_graph}
              subtitle="Daily overall judgment score over 90 days"
              {...sectionToggle("judgment_graph")}
              className="lg:col-span-2"
            >
              <JudgmentGraph points={sections.judgment_graph} />
            </ProfileSection>
          )}

          {(mode === "private" || showDimensions) && sections.judgement ? (
            <ProfileSection
              id="dimensions"
              title={SECTION_LABELS.dimensions}
              subtitle="Radar across 8 judgment dimensions"
              {...sectionToggle("dimensions")}
            >
              <DimensionRadar judgement={sections.judgement} />
            </ProfileSection>
          ) : null}

          {(mode === "private" || showCost) && (
            <ProfileSection
              id="cost-trends"
              title={SECTION_LABELS.cost_trends}
              subtitle="Judge spend and token volume"
              {...sectionToggle("cost_trends")}
            >
              <CostTrendChart points={sections.cost_trends} />
            </ProfileSection>
          )}

          {(mode === "private" || showFlags) && (
            <ProfileSection
              id="flags"
              title={SECTION_LABELS.flags}
              subtitle="Most recurring evaluation flags"
              {...sectionToggle("flags")}
            >
              <CommonFlagsList flags={sections.common_flags} />
            </ProfileSection>
          )}

          {(mode === "private" || showWorst) && (
            <ProfileSection
              id="worst-decisions"
              title={SECTION_LABELS.worst_decisions}
              subtitle="Lowest-scoring decisions"
              {...sectionToggle("worst_decisions")}
              className="lg:col-span-2"
            >
              <WorstDecisionsList items={sections.worst_decisions} />
            </ProfileSection>
          )}
        </div>
      ) : null}

      {(mode === "private" || showDemo) && profile.demo_video_url ? (
        <ProfileSection
          id="demo-video"
          title={SECTION_LABELS.demo_video}
          subtitle="See the agent in action"
          {...sectionToggle("demo_video")}
        >
          <DemoVideo url={profile.demo_video_url} />
        </ProfileSection>
      ) : null}

      {(mode === "private" || showOwner) && (
        <ProfileSection
          id="owner"
          title={SECTION_LABELS.owner}
          subtitle="Meet the human behind this agent"
          {...sectionToggle("owner")}
          className={isPublicPage ? "border-[#3f3f46] bg-gradient-to-b from-[#0a0a0a] to-[#141414]" : undefined}
        >
          <OwnerProfileSection owner={profile.owner_profile} />
        </ProfileSection>
      )}

      {isPublicPage ? (
        <footer className="border-t border-[#27272a] pt-8 text-center">
          <p className="text-[12px] text-[#52525b]">
            Judgment profile powered by{" "}
            <Link href="https://histeeria.com" className="text-[#a1a1aa] hover:text-[#fafafa]">
              Histeeria
            </Link>
            {" · "}
            Updated {new Date(profile.updated_at).toLocaleDateString()}
          </p>
          {workspaceSlug ? (
            <Link
              href={`https://app.histeeria.com/p/${workspaceSlug}/${profile.slug}`}
              className="mt-2 inline-block text-[11px] text-[#52525b] hover:text-[#71717a]"
            >
              app.histeeria.com/p/{workspaceSlug}/{profile.slug}
            </Link>
          ) : null}
        </footer>
      ) : null}
    </div>
  );
}

function DemoVideo({ url }: { url: string }) {
  const embed = embedVideoUrl(url);
  if (!embed) return <p className="text-[13px] text-[#71717a]">Invalid video URL.</p>;
  if (isDirectVideo(url)) {
    return (
      <video controls className="w-full rounded-[12px] border border-[#27272a] bg-black">
        <source src={url} />
      </video>
    );
  }
  return (
    <div className="aspect-video overflow-hidden rounded-[12px] border border-[#27272a] bg-black">
      <iframe src={embed} title="Agent demo" className="h-full w-full" allowFullScreen />
    </div>
  );
}
