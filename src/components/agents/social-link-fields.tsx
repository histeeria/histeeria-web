"use client";

import { ExternalLink } from "lucide-react";

import { SocialLinkButton, SocialLinkIcon } from "@/components/agents/social-link-icon";
import type { OwnerSocialLinks } from "@/lib/api";
import {
  normalizeSocialLink,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/lib/social-links";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#fafafa] placeholder:text-[#52525b] outline-none";

interface SocialLinkFieldsProps {
  social: OwnerSocialLinks;
  onChange: (platform: SocialPlatform, value: string) => void;
}

export function SocialLinkFields({ social, onChange }: SocialLinkFieldsProps) {
  const platforms = Object.keys(SOCIAL_PLATFORMS) as SocialPlatform[];

  const activeLinks = platforms
    .map((platform) => {
      const url = normalizeSocialLink(platform, social[platform]);
      if (!url) return null;
      return { platform, url, label: SOCIAL_PLATFORMS[platform].label };
    })
    .filter(Boolean) as Array<{ platform: SocialPlatform; url: string; label: string }>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {platforms.map((platform) => {
          const cfg = SOCIAL_PLATFORMS[platform];
          const value = social[platform] ?? "";
          const resolved = normalizeSocialLink(platform, value);

          return (
            <div
              key={platform}
              className="rounded-[12px] border border-[#27272a] bg-[#0f0f0f] transition focus-within:border-[#3f3f46]"
            >
              <div className="flex items-center gap-3 border-b border-[#27272a]/80 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141414] text-[#a1a1aa]">
                  <SocialLinkIcon platform={platform} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#fafafa]">{cfg.label}</p>
                  <p className="text-[11px] text-[#52525b]">{cfg.hint}</p>
                </div>
                {resolved ? (
                  <a
                    href={resolved}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#27272a] text-[#71717a] hover:text-[#fafafa]"
                    title="Open link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
              <div className="flex overflow-hidden">
                {cfg.prefix ? (
                  <span className="flex shrink-0 items-center border-r border-[#27272a] bg-[#141414] px-3 text-[11px] text-[#52525b]">
                    {cfg.prefix}
                  </span>
                ) : null}
                <input
                  value={value}
                  onChange={(e) => onChange(platform, e.target.value)}
                  placeholder={cfg.placeholder}
                  className={cn(fieldClass, !cfg.prefix && "px-3.5")}
                />
              </div>
            </div>
          );
        })}
      </div>

      {activeLinks.length > 0 ? (
        <div className="rounded-[12px] border border-[#27272a] bg-[#141414]/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#52525b]">
            Public preview
          </p>
          <p className="mt-1 text-[12px] text-[#71717a]">
            These icons appear on your public profile. Click to test.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeLinks.map((link) => (
              <SocialLinkButton
                key={link.platform}
                href={link.url}
                label={link.label}
                platform={link.platform}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
