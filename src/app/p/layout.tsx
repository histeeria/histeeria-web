import type { Metadata } from "next";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Public Agent Profiles",
  description: `Discover public AI agent profiles published on ${SITE_NAME}.`,
  openGraph: {
    title: `Public Agent Profiles · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/p`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PublicProfilesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
