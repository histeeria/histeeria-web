"use client";

import Link from "next/link";

import { OwnerProfileSection } from "@/components/agents/owner-profile-section";
import { embedVideoUrl, isDirectVideo } from "@/components/agents/profile-section";
import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import {
  AbstractAgentVisual,
  JudgmentGradeStrip,
  TelemetryPanel,
} from "@/components/agents/public-profile-telemetry";
import { SocialLinkButton } from "@/components/agents/social-link-icon";
import { emptyAgentContext } from "@/lib/agent-context";
import type {
  AgentProfileDashboard,
  AgentProfileSummary,
  OwnerSocialLinks,
  ProfileLink,
  PublicSections,
} from "@/lib/api";
import {
  firstSentence,
  parseHeuristics,
  publicTheme,
  splitTags,
  textToLines,
  truncate,
} from "@/lib/public-profile-design";
import { normalizeSocialLink, type SocialPlatform } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const AGENT_SOCIAL_ORDER: SocialPlatform[] = [
  "linkedin", "github", "x", "instagram", "youtube", "patreon", "website",
];

interface PublicAgentProfileProps {
  profile: AgentProfileSummary;
  dashboard: AgentProfileDashboard;
  workspaceSlug?: string;
  publicSections: PublicSections;
}

function show(key: keyof PublicSections, publicSections: PublicSections) {
  return Boolean(publicSections[key]);
}

function MatrixRow({
  index,
  title,
  subtitle,
  children,
  isLight,
}: {
  index: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isLight: boolean;
}) {
  const t = publicTheme(isLight);
  return (
    <section className={cn("grid overflow-hidden rounded-[32px] border bg-[var(--pp-surface)] shadow-[0_30px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl md:grid-cols-[310px_minmax(0,1fr)]", t.border)}>
      <div className={cn("border-b bg-[var(--pp-surface-alt)] px-6 py-10 md:border-b-0 md:border-r lg:px-8", t.border)}>
        <p className={cn("font-mono text-[12px] tracking-[0.2em]", t.faint)}>{index}</p>
        <h2 className={cn("mt-4 text-[28px] font-medium leading-[1.05] tracking-[-0.04em] md:text-[32px]", t.fg)}>{title}</h2>
        <p className={cn("mt-4 text-[15px] leading-relaxed md:text-[16px]", t.muted)}>{subtitle}</p>
      </div>
      <div className="px-6 py-10 lg:px-10">{children}</div>
    </section>
  );
}

function FieldBlock({
  label,
  children,
  isLight,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  isLight: boolean;
  mono?: boolean;
}) {
  const t = publicTheme(isLight);
  return (
    <div className="mb-8 last:mb-0">
      <p className={cn("font-mono text-[11px] md:text-[12px] uppercase tracking-[0.16em]", t.faint)}>{label}</p>
      <div className={cn("mt-3 text-[16px] leading-[1.75] md:text-[17px]", mono ? "font-mono text-[14px] leading-relaxed md:text-[15px]" : "", t.fg)}>
        {children}
      </div>
    </div>
  );
}

function DashList({ items, isLight }: { items: string[]; isLight: boolean }) {
  const t = publicTheme(isLight);
  if (items.length === 0) return null;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={cn("flex gap-3 text-[16px] leading-relaxed md:text-[17px]", t.fg)}>
          <span className={cn("mt-[0.68rem] h-px w-4 shrink-0", isLight ? "bg-[#18181b]" : "bg-[#8f9cff]")} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TagGrid({ tags, isLight }: { tags: string[]; isLight: boolean }) {
  const t = publicTheme(isLight);
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "cursor-default rounded-full border px-4 py-2 font-mono text-[12px] tracking-wide transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-fg)] hover:text-[var(--pp-bg)] md:text-[13px]",
            t.border,
            t.surface,
            t.muted,
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function HeuristicRows({ lines, isLight }: { lines: string[]; isLight: boolean }) {
  const t = publicTheme(isLight);
  if (lines.length === 0) return null;
  return (
    <div className="space-y-3.5">
      {lines.map((line) => (
        <p key={line} className={cn("font-mono text-[13px] md:text-[14px] leading-relaxed tracking-wide", t.fg)}>
          {line.includes("→") ? line : `→ ${line}`}
        </p>
      ))}
    </div>
  );
}

function AgentSocialRow({ social, isLight }: { social: OwnerSocialLinks; isLight: boolean }) {
  const links = AGENT_SOCIAL_ORDER.map((platform) => {
    const href = normalizeSocialLink(platform, social[platform]);
    if (!href) return null;
    return { platform, href };
  }).filter(Boolean) as Array<{ platform: SocialPlatform; href: string }>;

  if (links.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <SocialLinkButton key={link.platform} href={link.href} label={link.platform} platform={link.platform} />
      ))}
    </div>
  );
}

function PublicDemoVideo({ url, isLight }: { url: string; isLight: boolean }) {
  const t = publicTheme(isLight);
  const embed = embedVideoUrl(url);

  if (!embed) {
    return (
      <div className={cn("flex aspect-video items-center justify-center rounded-[28px] border", t.border, t.surfaceAlt)}>
        <p className={cn("font-mono text-[12px]", t.muted)}>Invalid video URL</p>
      </div>
    );
  }

  if (isDirectVideo(url)) {
    return (
      <video controls loop muted playsInline className={cn("aspect-video w-full rounded-[28px] border bg-black object-cover", t.border)}>
        <source src={url} />
      </video>
    );
  }

  return (
    <div className={cn("aspect-video overflow-hidden rounded-[28px] border bg-black", t.border)}>
      <iframe src={embed} title="Agent demo" className="h-full w-full" allowFullScreen />
    </div>
  );
}

export function PublicAgentProfile({
  profile,
  dashboard,
  workspaceSlug,
  publicSections,
}: PublicAgentProfileProps) {
  const { isLight } = useProfileTheme();
  const t = publicTheme(isLight);
  const ctx = profile.agent_context ?? emptyAgentContext();
  const { sections } = dashboard;

  const role = ctx.identity.role_description;
  const tagline =
    firstSentence(ctx.purpose.primary_objective) ??
    firstSentence(profile.description) ??
    "Autonomous execution profile with verified behavioral bounds and telemetry alignment.";
  const description =
    profile.description ??
    ([ctx.identity.persona, ctx.purpose.primary_objective].filter(Boolean).join(" ") ||
      "A structured verification and capability matrix illustrating operational limits, safety boundaries, and live judgment scores.");

  const domainLabel = profile.domain?.replace(/_/g, " ") ?? "General";
  const environment = truncate(ctx.operational.environment, 28);
  const trustLayer = truncate(ctx.trust.authorization_notes ?? ctx.operational.permissions_boundary, 28);

  const showSummary = show("summary", publicSections);
  const showDemo = show("demo_video", publicSections) && profile.demo_video_url;
  const showGraph = show("judgment_graph", publicSections) || show("dimensions", publicSections);
  const showOwner = show("owner", publicSections);
  const showLinks = show("links", publicSections) && profile.links.length > 0;
  const showSocial = show("agent_social", publicSections);

  const showWho =
    show("identity", publicSections) &&
    (ctx.identity.role_description ||
      ctx.identity.persona ||
      ctx.identity.capabilities_summary ||
      ctx.identity.limitations);
  const showKnows =
    (show("operational", publicSections) || show("knowledge", publicSections)) &&
    (ctx.operational.environment ||
      ctx.operational.available_tools ||
      ctx.knowledge.domain_knowledge ||
      ctx.knowledge.constraints ||
      ctx.knowledge.known_unknowns);
  const showBehaves =
    (show("behavior", publicSections) ||
      show("memory", publicSections) ||
      show("trust", publicSections) ||
      show("purpose", publicSections)) &&
    (ctx.behavior.decision_heuristics ||
      ctx.behavior.escalation_conditions ||
      ctx.memory.short_term_context ||
      ctx.trust.audit_trail);

  const capabilities = textToLines(ctx.identity.capabilities_summary);
  const limitations = textToLines(ctx.identity.limitations);
  const toolTags = splitTags(ctx.operational.available_tools);
  const knowledgeTags = splitTags(ctx.knowledge.domain_knowledge);
  const heuristics = parseHeuristics(ctx.behavior.decision_heuristics);
  const escalations = parseHeuristics(ctx.behavior.escalation_conditions);

  return (
    <article className={cn("relative isolate overflow-hidden rounded-[36px] border font-sans shadow-[0_40px_160px_rgba(0,0,0,0.45)]", t.border, t.fg)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          profileThemeClass(
            isLight,
            "bg-[radial-gradient(circle_at_78%_8%,rgba(236,168,214,0.22),transparent_30%),radial-gradient(circle_at_24%_14%,rgba(143,156,255,0.14),transparent_28%),linear-gradient(180deg,#020202_0%,#050505_45%,#020202_100%)]",
            "bg-[radial-gradient(circle_at_78%_8%,rgba(143,156,255,0.18),transparent_30%),radial-gradient(circle_at_24%_14%,rgba(236,168,214,0.16),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fafafa_48%,#f4f4f5_100%)]",
          ),
        )}
      />
      <div className={cn("pointer-events-none absolute inset-0 -z-10 [background-size:160px_160px]", profileThemeClass(isLight, "opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)]", "opacity-[0.55] [background-image:linear-gradient(rgba(0,0,0,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.06)_1px,transparent_1px)]"))} />
      {/* HERO */}
      {showSummary ? (
        <section className={cn("relative overflow-hidden border-b", t.border)}>
          <div className="pointer-events-none absolute right-0 top-0 h-[520px] w-[58%] bg-[radial-gradient(ellipse_at_center,rgba(236,168,214,0.18),transparent_60%)] blur-2xl" />
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative z-10 border-b px-6 py-14 lg:border-b-0 lg:border-r lg:px-12 lg:py-20">
              <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={cn("font-mono text-[12px] tracking-wide", t.muted)}>
                      /{profile.slug}
                    </span>
                    {role ? (
                      <>
                        <span className={cn("font-mono text-[12px]", t.faint)}>·</span>
                        <span className={cn("font-mono text-[11px] md:text-[12px] uppercase tracking-[0.12em]", t.muted)}>
                          {role}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <h1 className={cn("mt-6 max-w-4xl text-[clamp(3.5rem,8vw,7.75rem)] font-medium leading-[0.92] tracking-[-0.065em]", t.fg)}>
                    {profile.name}
                  </h1>

                  <p className={cn("mt-7 max-w-2xl text-[20px] font-normal leading-normal tracking-[-0.02em] md:text-[24px]", t.fg)}>
                    {tagline}
                  </p>

                  <p className={cn("mt-5 max-w-3xl text-[16px] leading-[1.8] md:text-[18px]", t.muted)}>{description}</p>

                  <div className={cn("mt-10 grid overflow-hidden rounded-[28px] border bg-[var(--pp-surface)] backdrop-blur-xl sm:grid-cols-3", t.border)}>
                    {[
                      { label: "Type", value: domainLabel },
                      { label: "Environment", value: environment },
                      { label: "Trust layer", value: trustLayer },
                    ].map((item) => (
                      <div key={item.label} className={cn("border-b px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0", t.border)}>
                        <p className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", t.faint)}>
                          {item.label}
                        </p>
                        <p className={cn("mt-2 text-[14px] md:text-[15px] font-mono uppercase tracking-wide leading-snug", t.fg)}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {showLinks ? (
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {profile.links.map((link: ProfileLink) => (
                        <a
                          key={`${link.label}-${link.url}`}
                          href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2 font-mono text-[12px] tracking-wide shadow-sm transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-fg)] hover:text-[var(--pp-bg)]",
                            t.border,
                            t.muted,
                          )}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {showSocial && profile.agent_social ? (
                    <AgentSocialRow social={profile.agent_social} isLight={isLight} />
                  ) : null}
              </div>
            </div>

            <div className="relative z-10 px-6 py-12 lg:px-8 lg:py-20">
              <AbstractAgentVisual
                name={profile.name}
                avatarUrl={profile.agent_avatar_url}
                isLight={isLight}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* JUDGMENT STRIP */}
      {dashboard.has_sdk_agent && showSummary ? (
        <div className={cn("border-b px-4 py-4 md:px-6", t.border)}>
          <JudgmentGradeStrip judgement={sections.judgement} show={Boolean(sections.judgement)} />
        </div>
      ) : null}

      {/* DEMO & TELEMETRY */}
      {(showDemo || (dashboard.has_sdk_agent && showGraph)) ? (
        <section className={cn("grid gap-4 border-b p-4 md:p-6 lg:grid-cols-2", t.border)}>
          <div className={cn("overflow-hidden rounded-[32px] border bg-[var(--pp-surface)] backdrop-blur-xl", t.border)}>
            {showDemo && profile.demo_video_url ? (
              <div className="p-5 lg:p-6">
                <p className={cn("mb-4 font-mono text-[10px] uppercase tracking-[0.16em]", t.faint)}>
                  Execution walkthrough
                </p>
                <PublicDemoVideo url={profile.demo_video_url} isLight={isLight} />
              </div>
            ) : (
              <div className={cn("flex aspect-video items-center justify-center p-8", t.surfaceAlt)}>
                <p className={cn("max-w-xs text-center font-mono text-[12px] leading-relaxed", t.muted)}>
                  Demo video not published. Enable the demo section to showcase agent execution.
                </p>
              </div>
            )}
          </div>
          {dashboard.has_sdk_agent && showGraph ? (
            <TelemetryPanel
              judgement={sections.judgement}
              graphPoints={sections.judgment_graph}
              flags={sections.common_flags}
            />
          ) : (
            <TelemetryPanel judgement={null} graphPoints={[]} flags={[]} />
          )}
        </section>
      ) : null}

      {/* CORE DATA MATRIX */}
      {(showWho || showKnows || showBehaves) ? (
        <section className={cn("space-y-4 border-b p-4 md:space-y-6 md:p-6", t.border)}>
          {showWho ? (
            <MatrixRow
              index="01"
              title="Who it is"
              subtitle="Identity, operational core, and behavioral bounds."
              isLight={isLight}
            >
              {ctx.identity.persona ? (
                <FieldBlock label="Identity & role persona" isLight={isLight}>
                  <p className={t.muted}>{ctx.identity.persona}</p>
                </FieldBlock>
              ) : null}
              {capabilities.length > 0 ? (
                <FieldBlock label="Functional capabilities" isLight={isLight}>
                  <DashList items={capabilities} isLight={isLight} />
                </FieldBlock>
              ) : null}
              {limitations.length > 0 ? (
                <FieldBlock label="Explicit restraints" isLight={isLight}>
                  <DashList items={limitations} isLight={isLight} />
                </FieldBlock>
              ) : null}
              {!ctx.identity.persona && capabilities.length === 0 && limitations.length === 0 && role ? (
                <FieldBlock label="Role" isLight={isLight}>
                  <p className={t.muted}>{role}</p>
                </FieldBlock>
              ) : null}
            </MatrixRow>
          ) : null}

          {showKnows ? (
            <MatrixRow
              index="02"
              title="What it knows"
              subtitle="Operational boundaries, tool clearance, and knowledge depths."
              isLight={isLight}
            >
              {(toolTags.length > 0 || knowledgeTags.length > 0) ? (
                <FieldBlock label="Operational context & tools" isLight={isLight}>
                  <TagGrid tags={[...toolTags, ...knowledgeTags]} isLight={isLight} />
                </FieldBlock>
              ) : null}
              {ctx.knowledge.constraints ? (
                <FieldBlock label="Knowledge constraints" isLight={isLight}>
                  <p className={t.muted}>{ctx.knowledge.constraints}</p>
                </FieldBlock>
              ) : null}
              {ctx.knowledge.known_unknowns ? (
                <FieldBlock label="Known unknowns" isLight={isLight}>
                  <p className={t.muted}>{ctx.knowledge.known_unknowns}</p>
                </FieldBlock>
              ) : null}
              {ctx.operational.permissions_boundary ? (
                <FieldBlock label="Permissions boundary" isLight={isLight}>
                  <p className={t.muted}>{ctx.operational.permissions_boundary}</p>
                </FieldBlock>
              ) : null}
            </MatrixRow>
          ) : null}

          {showBehaves ? (
            <MatrixRow
              index="03"
              title="How it behaves"
              subtitle="Optimization criteria, heuristics, and state control mechanisms."
              isLight={isLight}
            >
              {(heuristics.length > 0 || escalations.length > 0) ? (
                <FieldBlock label="Decision heuristics & escalation path" isLight={isLight} mono>
                  <HeuristicRows lines={[...heuristics, ...escalations]} isLight={isLight} />
                </FieldBlock>
              ) : null}
              {ctx.purpose.primary_objective ? (
                <FieldBlock label="Primary objective" isLight={isLight}>
                  <p className={t.muted}>{ctx.purpose.primary_objective}</p>
                </FieldBlock>
              ) : null}
              {ctx.behavior.guardrails ? (
                <FieldBlock label="Guardrails" isLight={isLight}>
                  <DashList items={textToLines(ctx.behavior.guardrails)} isLight={isLight} />
                </FieldBlock>
              ) : null}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {ctx.memory.short_term_context || ctx.memory.long_term_memory ? (
                  <FieldBlock label="Short / long memory frames" isLight={isLight} mono>
                    <p className={t.muted}>
                      {[ctx.memory.short_term_context, ctx.memory.long_term_memory].filter(Boolean).join(" · ")}
                    </p>
                  </FieldBlock>
                ) : null}
                {ctx.trust.audit_trail ? (
                  <FieldBlock label="Audit & real-time logging" isLight={isLight} mono>
                    <p className={t.muted}>{ctx.trust.audit_trail}</p>
                  </FieldBlock>
                ) : null}
              </div>
            </MatrixRow>
          ) : null}
        </section>
      ) : null}

      {/* BUILDER */}
      {showOwner ? (
        <section className={cn("border-b p-4 md:p-6", t.border)}>
          <div className={cn("rounded-[32px] border bg-[var(--pp-surface)] px-6 py-10 backdrop-blur-xl md:px-10", t.border)}>
          <p className={cn("mb-8 font-mono text-[10px] uppercase tracking-[0.16em]", t.faint)}>
            Human builder
          </p>
          <OwnerProfileSection owner={profile.owner_profile} />
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className={cn("px-6 py-12 text-center md:px-10", t.muted)}>
        <p className="font-mono text-[11px] tracking-wide">
          © {new Date().getFullYear()} {profile.name}
          {workspaceSlug ? ` · /p/${workspaceSlug}/${profile.slug}` : ""}
        </p>
        <p className="mt-2 font-mono text-[11px]">
          Powered by{" "}
          <Link
            href="https://histeeria.com"
            className={profileThemeClass(isLight, "text-[#fafafa] hover:underline", "text-[#18181b] hover:underline")}
          >
            Histeeria
          </Link>
          {" · "}
          Updated {new Date(profile.updated_at).toLocaleDateString()}
        </p>
      </footer>
    </article>
  );
}
