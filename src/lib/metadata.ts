import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.histeeria.com";

export const SITE_NAME = "Histeeria";

export const SITE_DESCRIPTION =
  "Infrastructure for machine judgment — monitor AI agents, evaluate decisions, and ship trustworthy automation.";

export const DEFAULT_OG_IMAGE = "/logo-dark.png";

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
}: {
  name: string;
  description: string | null;
  workspaceName: string;
  workspaceSlug: string;
  profileSlug: string;
  updatedAt: string;
}): Metadata {
  const title = `${name} — Agent Profile`;
  const metaDescription =
    description?.trim() ||
    `Public agent profile for ${name} by ${workspaceName}. View capabilities and domain on Histeeria.`;
  const url = `${SITE_URL}/p/${workspaceSlug}/${profileSlug}`;

  return {
    title,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description: metaDescription,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE, width: 512, height: 512, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: { index: true, follow: true },
    other: { "article:modified_time": updatedAt },
  };
}
