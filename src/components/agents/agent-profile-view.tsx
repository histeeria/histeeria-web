"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  CommonFlagsList,
  CostTrendChart,
  DimensionRadar,
  JudgmentGraph,
  ProfileGradeHeader,
  WorstDecisionsList,
} from "@/components/agents/agent-profile-charts";
import type { AgentProfileDashboard, AgentProfileSummary, ProfileLink } from "@/lib/api";

const SECTION_LABELS: Record<string, string> = {
  summary: "Profile summary",
  judgment_graph: "90-day judgment graph",
  dimensions: "8-dimension scores",
  flags: "Most common flags",
  worst_decisions: "Worst decisions",
  cost_trends: "Cost & token trends",
};

interface AgentProfileViewProps {
  profile: Pick<
    AgentProfileSummary,
    "name" | "slug" | "description" | "domain" | "sdk_agent_id" | "links" | "updated_at"
  >;
  dashboard: AgentProfileDashboard;
  workspaceName?: string;
  mode: "private" | "public";
  publicSections?: Record<string, boolean>;
}

function shouldShow(
  mode: "private" | "public",
  key: string,
  publicSections?: Record<string, boolean>,
) {
  if (mode === "private") return true;
  return Boolean(publicSections?.[key]);
}

export function AgentProfileView({
  profile,
  dashboard,
  workspaceName,
  mode,
  publicSections,
}: AgentProfileViewProps) {
  const { sections } = dashboard;
  const showSummary = shouldShow(mode, "summary", publicSections);
  const showGraph = shouldShow(mode, "judgment_graph", publicSections);
  const showDimensions = shouldShow(mode, "dimensions", publicSections);
  const showFlags = shouldShow(mode, "flags", publicSections);
  const showWorst = shouldShow(mode, "worst_decisions", publicSections);
  const showCost = shouldShow(mode, "cost_trends", publicSections);

  const domainLabel = profile.domain?.replace(/_/g, " ") ?? null;

  return (
    <div className="space-y-6">
      {(mode === "private" || showSummary) && (
        <section className="rounded-[12px] border border-[#27272a] bg-[#0a0a0a] p-5">
          <div className="space-y-4">
            {workspaceName ? (
              <p className="text-[12px] text-[#52525b]">{workspaceName}</p>
            ) : null}
            <div>
              <h1 className="text-[28px] font-medium tracking-tight text-[#fafafa]">{profile.name}</h1>
              <p className="mt-1 font-mono text-[12px] text-[#52525b]">/{profile.slug}</p>
            </div>
            {profile.description ? (
              <p className="max-w-2xl text-[15px] leading-relaxed text-[#d4d4d8]">{profile.description}</p>
            ) : (
              <p className="text-[14px] text-[#71717a]">No description provided.</p>
            )}
            <div className="flex flex-wrap gap-4 text-[12px] text-[#71717a]">
              {domainLabel ? <span className="capitalize">Domain: {domainLabel}</span> : null}
              {profile.sdk_agent_id ? (
                <span className="font-mono">SDK: {profile.sdk_agent_id}</span>
              ) : null}
            </div>
            {profile.links.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.links.map((link: ProfileLink) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            ) : null}
            <ProfileGradeHeader
              judgement={sections.judgement}
              showSummary={mode === "private" || showSummary}
            />
          </div>
        </section>
      )}

      {!dashboard.has_sdk_agent ? (
        <div className="rounded-[12px] border border-dashed border-[#27272a] px-6 py-10 text-center">
          <p className="text-[14px] text-[#a1a1aa]">Link an SDK agent ID to unlock judgment analytics.</p>
          <p className="mt-2 text-[12px] text-[#52525b]">
            Edit this profile and set the SDK agent ID that matches your ingested decisions.
          </p>
        </div>
      ) : null}

      {dashboard.has_sdk_agent && (mode === "private" || showGraph) ? (
        <SectionCard title="90-day judgment graph" subtitle="Daily overall judgment score">
          <JudgmentGraph points={sections.judgment_graph} />
        </SectionCard>
      ) : null}

      {dashboard.has_sdk_agent && sections.judgement && (mode === "private" || showDimensions) ? (
        <SectionCard title="Score breakdown" subtitle="Average across 8 judgment dimensions">
          <DimensionRadar judgement={sections.judgement} />
        </SectionCard>
      ) : null}

      {dashboard.has_sdk_agent && (mode === "private" || showFlags) ? (
        <SectionCard title="Most common flags" subtitle="Recurring issues from evaluations">
          <CommonFlagsList flags={sections.common_flags} />
        </SectionCard>
      ) : null}

      {dashboard.has_sdk_agent && (mode === "private" || showWorst) ? (
        <SectionCard title="Worst decisions" subtitle="Three lowest-scoring evaluated decisions">
          <WorstDecisionsList items={sections.worst_decisions} />
        </SectionCard>
      ) : null}

      {dashboard.has_sdk_agent && (mode === "private" || showCost) ? (
        <SectionCard title="Cost & token trends" subtitle="Judge spend and token usage over 90 days">
          <CostTrendChart points={sections.cost_trends} />
        </SectionCard>
      ) : null}

      {mode === "public" ? (
        <p className="text-[11px] text-[#52525b]">
          Public profile · Last updated {new Date(profile.updated_at).toLocaleDateString()}. Powered by{" "}
          <Link href="https://histeeria.com" className="text-[#a1a1aa] hover:text-[#fafafa]">
            Histeeria
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-[#27272a] bg-[#0a0a0a] p-5">
      <div className="mb-4">
        <h2 className="text-[15px] font-medium text-[#fafafa]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[#71717a]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export { SECTION_LABELS };
