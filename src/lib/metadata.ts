import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.histeeria.com";

export const SITE_NAME = "Histeeria";

export const SITE_DESCRIPTION =
  "Infrastructure for machine judgment — monitor AI agents, evaluate decisions, and ship trustworthy automation.";

export const DEFAULT_OG_IMAGE = "/logo-dark1.png";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 512,
        height: 512,
        alt: "Histeeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export function profilePageMetadata({
  name,
  description,
  workspaceName,
  workspaceSlug,
  profileSlug,
  updatedAt,
  ogImageUrl,
}: {
  name: string;
  description: string | null;
  workspaceName: string;
  workspaceSlug: string;
  profileSlug: string;
  updatedAt: string;
  ogImageUrl?: string;
}): Metadata {
  const title = `${name} — Agent Profile`;
  const metaDescription =
    description?.trim() ||
    `Public agent profile for ${name} by ${workspaceName}. View judgment scores, analytics, and builder info on Histeeria.`;
  const url = `${SITE_URL}/p/${workspaceSlug}/${profileSlug}`;
  const image = ogImageUrl ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: metaDescription,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [image],
    },
    robots: { index: true, follow: true },
    other: { "article:modified_time": updatedAt },
  };
}
