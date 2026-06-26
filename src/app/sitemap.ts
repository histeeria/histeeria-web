import type { MetadataRoute } from "next";

import { listPublicAgentProfiles } from "@/lib/api";
import { SITE_URL } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const profiles = await listPublicAgentProfiles();
    const profileRoutes: MetadataRoute.Sitemap = profiles.map((profile) => ({
      url: `${SITE_URL}/p/${profile.workspace_slug}/${profile.slug}`,
      lastModified: new Date(profile.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...profileRoutes];
  } catch {
    return staticRoutes;
  }
}
