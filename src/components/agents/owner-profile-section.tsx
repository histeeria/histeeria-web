"use client";

import { Mail } from "lucide-react";

import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import { SocialLinkButton } from "@/components/agents/social-link-icon";
import type { OwnerProfile } from "@/lib/api";
import { normalizeSocialLink, type SocialPlatform } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const SOCIAL_ORDER: SocialPlatform[] = [
  "linkedin",
  "github",
  "x",
  "instagram",
  "youtube",
  "patreon",
  "website",
];

export function OwnerProfileSection({ owner }: { owner: OwnerProfile }) {
  const { isLight } = useProfileTheme();

  const links = SOCIAL_ORDER.map((platform) => {
    const href = normalizeSocialLink(platform, owner.social[platform]);
    if (!href) return null;
    return { platform, href, label: platform.charAt(0).toUpperCase() + platform.slice(1) };
  }).filter(Boolean) as Array<{ platform: SocialPlatform; href: string; label: string }>;

  const hasContent = owner.name || owner.description || owner.email || owner.avatar_url || links.length > 0;
  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {owner.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={owner.avatar_url}
          alt={owner.name ?? "Builder"}
          className={cn(
            "h-24 w-24 shrink-0 border object-cover rounded-full",
            profileThemeClass(isLight, "border-[#27272a]", "border-[#e4e4e7]"),
          )}
        />
      ) : (
        <div
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center border text-[28px] font-medium rounded-full",
            profileThemeClass(isLight, "border-[#27272a] bg-[#141414] text-[#71717a]", "border-[#e4e4e7] bg-[#f4f4f5] text-[#a1a1aa]"),
          )}
        >
          {(owner.name?.[0] ?? "B").toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] uppercase tracking-[0.2em]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
          Built by
        </p>
        <h3 className={cn("mt-1 text-[24px] font-medium", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
          {owner.name ?? "Anonymous builder"}
        </h3>
        {owner.description ? (
          <p className={cn("mt-3 max-w-2xl text-[15px] leading-relaxed", profileThemeClass(isLight, "text-[#a1a1aa]", "text-[#52525b]"))}>
            {owner.description}
          </p>
        ) : null}
        {owner.email ? (
          <a
            href={`mailto:${owner.email}`}
            className={cn(
              "mt-4 inline-flex cursor-pointer items-center gap-2 text-[13px] transition",
              profileThemeClass(isLight, "text-[#d4d4d8] hover:text-[#fafafa]", "text-[#52525b] hover:text-[#18181b]"),
            )}
          >
            <Mail className="h-4 w-4" />
            {owner.email}
          </a>
        ) : null}
        {links.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {links.map((link) => (
              <SocialLinkButton
                key={link.platform}
                href={link.href}
                label={link.label}
                platform={link.platform}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
