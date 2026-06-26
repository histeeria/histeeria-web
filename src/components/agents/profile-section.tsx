"use client";

import { Globe, Lock } from "lucide-react";

import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import { cn } from "@/lib/utils";

export const SECTION_LABELS: Record<string, string> = {
  summary: "Overview",
  identity: "Identity & role",
  purpose: "Purpose & goals",
  operational: "Operational context",
  knowledge: "Knowledge base",
  behavior: "Behavioral rules",
  memory: "Memory & state",
  trust: "Trust & authorization",
  links: "Resource links",
  agent_social: "Agent social",
  judgment_graph: "90-day judgment",
  dimensions: "Dimension scores",
  flags: "Common flags",
  worst_decisions: "Worst decisions",
  cost_trends: "Cost & tokens",
  demo_video: "Demo video",
  owner: "Builder profile",
};

interface ProfileSectionProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  isPublic?: boolean;
  showToggle?: boolean;
  toggleDisabled?: boolean;
  onToggle?: () => void;
}

export function ProfileSection({
  id,
  title,
  subtitle,
  children,
  className,
  isPublic,
  showToggle,
  toggleDisabled,
  onToggle,
}: ProfileSectionProps) {
  const { isLight } = useProfileTheme();

  return (
    <section
      id={id}
      className={cn(
        "overflow-hidden rounded-[16px] border",
        profileThemeClass(isLight, "border-[#27272a] bg-[#0a0a0a]", "border-[#e4e4e7] bg-white"),
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4",
          profileThemeClass(isLight, "border-[#27272a]", "border-[#e4e4e7]"),
        )}
      >
        <div>
          <h2 className={cn("text-[15px] font-medium", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
            {title}
          </h2>
          <p className={cn("mt-0.5 text-[12px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
            {subtitle}
          </p>
        </div>
        {showToggle ? (
          <button
            type="button"
            disabled={toggleDisabled}
            onClick={onToggle}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-40",
              isPublic
                ? "border-[#14532d]/50 bg-[#14532d]/15 text-[#86efac]"
                : profileThemeClass(
                    isLight,
                    "border-[#27272a] bg-[#141414] text-[#71717a] hover:text-[#a1a1aa]",
                    "border-[#e4e4e7] bg-[#f4f4f5] text-[#52525b] hover:text-[#18181b]",
                  ),
            )}
          >
            {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {isPublic ? "Public" : "Private"}
          </button>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function embedVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      const id = parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return url;
    return url;
  } catch {
    return null;
  }
}

export function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}
