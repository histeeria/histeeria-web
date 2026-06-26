"use client";

import Link from "next/link";
import { AgentContextDisplay } from "@/components/agents/agent-context-display";
import {
  CommonFlagsList,
  CostTrendChart,
  DimensionRadar,
  JudgmentGraph,
  ProfileGradeHeader,
  WorstDecisionsList,
} from "@/components/agents/agent-profile-charts";
import { OwnerProfileSection } from "@/components/agents/owner-profile-section";
import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import { SocialLinkButton } from "@/components/agents/social-link-icon";
import {
  embedVideoUrl,
  isDirectVideo,
  ProfileSection,
  SECTION_LABELS,
} from "@/components/agents/profile-section";
import { emptyAgentContext } from "@/lib/agent-context";
import type {
  AgentProfileDashboard,
  AgentProfileSummary,
  OwnerSocialLinks,
  ProfileLink,
  PublicSections,
} from "@/lib/api";
import { normalizeSocialLink, type SocialPlatform } from "@/lib/social-links";
import { cn } from "@/lib/utils";

export { SECTION_LABELS };

const AGENT_SOCIAL_ORDER: SocialPlatform[] = [
  "linkedin", "github", "x", "instagram", "youtube", "patreon", "website",
];

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

function shouldShow(mode: "private" | "public", key: string, publicSections?: PublicSections) {
  if (mode === "private") return true;
  return Boolean(publicSections?.[key as keyof PublicSections]);
}

function AgentSocialRow({ social, isLight }: { social: OwnerSocialLinks; isLight: boolean }) {
  const links = AGENT_SOCIAL_ORDER.map((platform) => {
    const href = normalizeSocialLink(platform, social[platform]);
    if (!href) return null;
    return { platform, href };
  }).filter(Boolean) as Array<{ platform: SocialPlatform; href: string }>;

  if (links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <SocialLinkButton key={link.platform} href={link.href} label={link.platform} platform={link.platform} />
      ))}
    </div>
  );
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
  const { isLight } = useProfileTheme();
  const { sections } = dashboard;
  const domainLabel = profile.domain?.replace(/_/g, " ") ?? null;
  const isPublicPage = mode === "public";
  const context = profile.agent_context ?? emptyAgentContext();
  const roleLabel = context.identity.role_description;

  function sectionToggle(key: keyof PublicSections) {
    return {
      showToggle: mode === "private",
      toggleDisabled: !isPublicEnabled,
      isPublic: Boolean(publicSections?.[key]),
      onToggle: () => onToggleSection?.(key),
    };
  }

  const showSummary = shouldShow(mode, "summary", publicSections);
  const showLinks = shouldShow(mode, "links", publicSections) && profile.links.length > 0;
  const showAgentSocial = shouldShow(mode, "agent_social", publicSections);
  const showGraph = shouldShow(mode, "judgment_graph", publicSections);
  const showDimensions = shouldShow(mode, "dimensions", publicSections);
  const showFlags = shouldShow(mode, "flags", publicSections);
  const showWorst = shouldShow(mode, "worst_decisions", publicSections);
  const showCost = shouldShow(mode, "cost_trends", publicSections);
  const showDemo = shouldShow(mode, "demo_video", publicSections) && profile.demo_video_url;
  const showOwner = shouldShow(mode, "owner", publicSections);
  const showContext = mode === "private" || CONTEXT_PUBLIC_KEYS.some((k) => publicSections?.[k as keyof PublicSections]);

  return (
    <div className={cn("space-y-10", isPublicPage && "pb-16")}>
      {(mode === "private" || showSummary) && (
        <div
          className={cn(
            "relative overflow-hidden rounded-[24px] border px-6 py-10 md:px-10 md:py-14",
            profileThemeClass(
              isLight,
              isPublicPage
                ? "border-[#27272a] bg-gradient-to-br from-[#141414] via-[#0a0a0a] to-black"
                : "border-[#27272a] bg-[#0a0a0a]",
              isPublicPage
                ? "border-[#e4e4e7] bg-gradient-to-br from-white via-[#fafafa] to-[#f4f4f5]"
                : "border-[#27272a] bg-[#0a0a0a]",
            ),
          )}
        >
          {mode === "private" ? (
            <div className="mb-4 flex flex-wrap justify-end gap-2">
              <VisibilityChip
                label="Overview"
                active={Boolean(publicSections?.summary)}
                disabled={!isPublicEnabled}
                onClick={() => onToggleSection?.("summary")}
              />
              <VisibilityChip
                label="Links"
                active={Boolean(publicSections?.links)}
                disabled={!isPublicEnabled}
                onClick={() => onToggleSection?.("links")}
              />
              <VisibilityChip
                label="Social"
                active={Boolean(publicSections?.agent_social)}
                disabled={!isPublicEnabled}
                onClick={() => onToggleSection?.("agent_social")}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {profile.agent_avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.agent_avatar_url}
                alt={profile.name}
                className="h-32 w-32 shrink-0 rounded-2xl border object-cover shadow-xl md:h-36 md:w-36"
              />
            ) : (
              <div
                className={cn(
                  "flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border text-[40px] font-semibold md:h-36 md:w-36",
                  profileThemeClass(isLight, "border-[#27272a] bg-[#141414] text-[#71717a]", "border-[#e4e4e7] bg-[#f4f4f5] text-[#a1a1aa]"),
                )}
              >
                {profile.name[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {workspaceName && isPublicPage ? (
                <p className={cn("text-[12px] uppercase tracking-[0.15em]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
                  {workspaceName}
                </p>
              ) : null}
              <h1 className={cn("font-medium tracking-tight", isPublicPage ? "mt-2 text-[36px] md:text-[48px]" : "text-[28px]", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
                {profile.name}
              </h1>
              {roleLabel ? (
                <p className={cn("mt-2 text-[16px]", profileThemeClass(isLight, "text-[#a1a1aa]", "text-[#52525b]"))}>{roleLabel}</p>
              ) : null}
              <p className={cn("mt-1 font-mono text-[12px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>/{profile.slug}</p>
              {profile.description ? (
                <p className={cn("mt-4 max-w-2xl leading-relaxed", isPublicPage ? "text-[17px] md:text-[19px]" : "text-[15px]", profileThemeClass(isLight, "text-[#d4d4d8]", "text-[#3f3f46]"))}>
                  {profile.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                {domainLabel ? (
                  <span className={cn("rounded-full border px-3 py-1 capitalize", profileThemeClass(isLight, "border-[#27272a] text-[#71717a]", "border-[#e4e4e7] text-[#52525b]"))}>
                    {domainLabel}
                  </span>
                ) : null}
                {profile.sdk_agent_id ? (
                  <span className={cn("rounded-full border px-3 py-1 font-mono", profileThemeClass(isLight, "border-[#27272a] text-[#71717a]", "border-[#e4e4e7] text-[#52525b]"))}>
                    {profile.sdk_agent_id}
                  </span>
                ) : null}
              </div>

              {(mode === "private" || showLinks) && profile.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.links.map((link: ProfileLink) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition",
                        profileThemeClass(isLight, "border-[#27272a] text-[#a1a1aa] hover:bg-[#141414]", "border-[#d4d4e7] text-[#52525b] hover:bg-[#f4f4f5]"),
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}

              {(mode === "private" || showAgentSocial) && profile.agent_social ? (
                <AgentSocialRow social={profile.agent_social} isLight={isLight} />
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

      {showContext ? (
        <AgentContextDisplay
          context={context}
          mode={mode}
          publicSections={publicSections}
          isPublicEnabled={isPublicEnabled}
          onToggleSection={(key) => onToggleSection?.(key as keyof PublicSections)}
        />
      ) : null}

      {!dashboard.has_sdk_agent && mode === "private" ? (
        <div className="rounded-[16px] border border-dashed border-[#27272a] px-6 py-12 text-center">
          <p className="text-[14px] text-[#a1a1aa]">Link an SDK agent ID to unlock judgment analytics.</p>
        </div>
      ) : null}

      {dashboard.has_sdk_agent ? (
        <div className="space-y-4">
          <h2 className={cn("text-[18px] font-medium", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
            Judgment analytics
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {(mode === "private" || showGraph) && (
              <ProfileSection id="judgment-graph" title={SECTION_LABELS.judgment_graph} subtitle="Daily overall judgment score over 90 days" {...sectionToggle("judgment_graph")} className="lg:col-span-2">
                <JudgmentGraph points={sections.judgment_graph} />
              </ProfileSection>
            )}
            {(mode === "private" || showDimensions) && sections.judgement ? (
              <ProfileSection id="dimensions" title={SECTION_LABELS.dimensions} subtitle="Radar across 8 judgment dimensions" {...sectionToggle("dimensions")}>
                <DimensionRadar judgement={sections.judgement} />
              </ProfileSection>
            ) : null}
            {(mode === "private" || showCost) && (
              <ProfileSection id="cost-trends" title={SECTION_LABELS.cost_trends} subtitle="Judge spend and token volume" {...sectionToggle("cost_trends")}>
                <CostTrendChart points={sections.cost_trends} />
              </ProfileSection>
            )}
            {(mode === "private" || showFlags) && (
              <ProfileSection id="flags" title={SECTION_LABELS.flags} subtitle="Most recurring evaluation flags" {...sectionToggle("flags")}>
                <CommonFlagsList flags={sections.common_flags} />
              </ProfileSection>
            )}
            {(mode === "private" || showWorst) && (
              <ProfileSection id="worst-decisions" title={SECTION_LABELS.worst_decisions} subtitle="Lowest-scoring decisions" {...sectionToggle("worst_decisions")} className="lg:col-span-2">
                <WorstDecisionsList items={sections.worst_decisions} />
              </ProfileSection>
            )}
          </div>
        </div>
      ) : null}

      {(mode === "private" || showDemo) && profile.demo_video_url ? (
        <ProfileSection id="demo-video" title={SECTION_LABELS.demo_video} subtitle="See the agent in action" {...sectionToggle("demo_video")}>
          <DemoVideo url={profile.demo_video_url} />
        </ProfileSection>
      ) : null}

      {(mode === "private" || showOwner) && (
        <ProfileSection
          id="owner"
          title={SECTION_LABELS.owner}
          subtitle="Meet the human behind this agent"
          {...sectionToggle("owner")}
          className={isPublicPage ? profileThemeClass(isLight, "border-[#3f3f46] bg-gradient-to-b from-[#0a0a0a] to-[#141414]", "border-[#d4d4d8] bg-gradient-to-b from-white to-[#fafafa]") : undefined}
        >
          <OwnerProfileSection owner={profile.owner_profile} />
        </ProfileSection>
      )}

      {isPublicPage ? (
        <footer className={cn("border-t pt-8 text-center", profileThemeClass(isLight, "border-[#27272a]", "border-[#e4e4e7]"))}>
          <p className={cn("text-[12px]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
            Judgment profile powered by{" "}
            <Link href="https://histeeria.com" className={profileThemeClass(isLight, "text-[#a1a1aa] hover:text-[#fafafa]", "text-[#52525b] hover:text-[#18181b]")}>
              Histeeria
            </Link>
            {" · "}
            Updated {new Date(profile.updated_at).toLocaleDateString()}
          </p>
        </footer>
      ) : null}
    </div>
  );
}

const CONTEXT_PUBLIC_KEYS = ["identity", "purpose", "operational", "knowledge", "behavior", "memory", "trust"];

function VisibilityChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] disabled:opacity-40",
        active ? "border-[#14532d]/50 text-[#86efac]" : "border-[#27272a] text-[#71717a]",
      )}
    >
      {label} {active ? "public" : "private"}
    </button>
  );
}

function DemoVideo({ url }: { url: string }) {
  const { isLight } = useProfileTheme();
  const embed = embedVideoUrl(url);
  if (!embed) {
    return (
      <p className={cn("text-[13px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
        Invalid video URL.
      </p>
    );
  }
  if (isDirectVideo(url)) {
    return (
      <video
        controls
        className={cn(
          "w-full rounded-[12px] border bg-black",
          profileThemeClass(isLight, "border-[#27272a]", "border-[#e4e4e7]"),
        )}
      >
        <source src={url} />
      </video>
    );
  }
  return (
    <div
      className={cn(
        "aspect-video overflow-hidden rounded-[12px] border bg-black",
        profileThemeClass(isLight, "border-[#27272a]", "border-[#e4e4e7]"),
      )}
    >
      <iframe src={embed} title="Agent demo" className="h-full w-full" allowFullScreen />
    </div>
  );
}
