import type { OwnerSocialLinks } from "@/lib/api";

export type SocialPlatform = keyof OwnerSocialLinks;

export const SOCIAL_PLATFORMS: Record<
  SocialPlatform,
  { label: string; prefix: string; placeholder: string; hint: string }
> = {
  linkedin: {
    label: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "your-handle",
    hint: "Full URL or just your handle",
  },
  github: {
    label: "GitHub",
    prefix: "github.com/",
    placeholder: "username",
    hint: "Full URL or username",
  },
  x: {
    label: "X",
    prefix: "x.com/",
    placeholder: "handle",
    hint: "Full URL or @handle",
  },
  instagram: {
    label: "Instagram",
    prefix: "instagram.com/",
    placeholder: "username",
    hint: "Full URL or username",
  },
  youtube: {
    label: "YouTube",
    prefix: "youtube.com/",
    placeholder: "@channel",
    hint: "Full URL or channel name",
  },
  patreon: {
    label: "Patreon",
    prefix: "patreon.com/",
    placeholder: "username",
    hint: "Full URL or username",
  },
  website: {
    label: "Website",
    prefix: "",
    placeholder: "yoursite.com",
    hint: "Domain or full URL — https:// is added automatically",
  },
};

export function normalizeGenericUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeSocialLink(
  platform: SocialPlatform,
  input: string | null | undefined,
): string | null {
  if (!input?.trim()) return null;
  const trimmed = input.trim().replace(/^@/, "");

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    return normalizeGenericUrl(trimmed);
  }

  if (platform === "website") {
    return normalizeGenericUrl(trimmed);
  }

  const cfg = SOCIAL_PLATFORMS[platform];
  let handle = trimmed.replace(/^www\./i, "");

  for (const variant of [cfg.prefix, `www.${cfg.prefix}`]) {
    if (handle.toLowerCase().startsWith(variant.toLowerCase())) {
      handle = handle.slice(variant.length);
      break;
    }
  }

  handle = handle.replace(/^\/+/, "");
  if (platform === "linkedin" && handle.toLowerCase().startsWith("in/")) {
    handle = handle.slice(3);
  }

  return `https://${cfg.prefix}${handle}`;
}

export function socialInputValue(platform: SocialPlatform, stored: string | null | undefined): string {
  if (!stored?.trim()) return "";
  const normalized = normalizeSocialLink(platform, stored);
  if (!normalized) return stored;

  if (platform === "website") {
    return normalized.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  }

  const cfg = SOCIAL_PLATFORMS[platform];
  try {
    const url = new URL(normalized);
    let path = url.pathname.replace(/^\/+/, "");
    if (platform === "linkedin" && path.toLowerCase().startsWith("in/")) {
      path = path.slice(3);
    }
    return path || url.hostname.replace(/^www\./i, "");
  } catch {
    return stored.replace(/^https?:\/\//i, "").replace(new RegExp(`^${cfg.prefix}`, "i"), "");
  }
}

export function normalizeOwnerSocial(social: OwnerSocialLinks): OwnerSocialLinks {
  return {
    linkedin: normalizeSocialLink("linkedin", social.linkedin),
    github: normalizeSocialLink("github", social.github),
    x: normalizeSocialLink("x", social.x),
    instagram: normalizeSocialLink("instagram", social.instagram),
    youtube: normalizeSocialLink("youtube", social.youtube),
    patreon: normalizeSocialLink("patreon", social.patreon),
    website: normalizeSocialLink("website", social.website),
  };
}
