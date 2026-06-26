"use client";

import { Mail } from "lucide-react";

import { SocialLinkButton } from "@/components/agents/social-link-icon";
import type { OwnerProfile } from "@/lib/api";
import { normalizeSocialLink, type SocialPlatform } from "@/lib/social-links";

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
          className="h-24 w-24 shrink-0 rounded-2xl border border-[#27272a] object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#27272a] bg-[#141414] text-[28px] font-medium text-[#71717a]">
          {(owner.name?.[0] ?? "B").toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#52525b]">Built by</p>
        <h3 className="mt-1 text-[24px] font-medium text-[#fafafa]">{owner.name ?? "Anonymous builder"}</h3>
        {owner.description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#a1a1aa]">{owner.description}</p>
        ) : null}
        {owner.email ? (
          <a
            href={`mailto:${owner.email}`}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#d4d4d8] hover:text-[#fafafa]"
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
