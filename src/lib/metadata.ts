import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.histeeria.com";

/** Canonical brand/marketing domain — the primary knowledge-graph entity. */
export const BRAND_URL = "https://histeeria.com";
export const DOCS_URL = "https://docs.histeeria.com";

export const SITE_NAME = "Histeeria";
export const LEGAL_NAME = "Histeeria Inc.";

export const SITE_DESCRIPTION =
  "Histeeria is the reliability layer for production AI agents — monitor agent decisions in real time, evaluate judgment across eight dimensions, get alerts on mistakes, and improve agents you can trust.";

export const DEFAULT_OG_IMAGE = "/logo-dark1.png";

export const SOCIAL_LINKS = [
  "https://github.com/histeeria",
  "https://linkedin.com/company/histeeria-imj",
  "https://instagram.com/histeeria.imj",
];

export const SITE_KEYWORDS = [
  "Histeeria",
  "AI agent monitoring",
  "AI agent evaluation",
  "agent reliability",
  "AI agent observability",
  "machine judgment",
  "LLM monitoring",
  "agent analytics",
  "agent profiles",
];

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — The Reliability Layer for Production AI Agents`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: BRAND_URL }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — The Reliability Layer for Production AI Agents`,
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
    title: `${SITE_NAME} — The Reliability Layer for Production AI Agents`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: "@histeeria",
    site: "@histeeria",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * Organization + WebApplication structured data. The Organization shares the
 * same @id as the marketing site so search engines treat both domains as one
 * brand entity in the Knowledge Graph.
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BRAND_URL}/#organization`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  url: BRAND_URL,
  logo: `${BRAND_URL}/assets/logo-dark.png`,
  sameAs: SOCIAL_LINKS,
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${BRAND_URL}/#organization` },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
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
