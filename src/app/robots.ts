import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/metadata";

/**
 * Public, indexable paths. Authenticated app surfaces stay disallowed.
 */
const ALLOW = ["/p/", "/login"];
const DISALLOW = ["/dashboard", "/onboarding", "/api/", "/settings"];

/**
 * AI assistant / answer-engine crawlers. Explicitly welcomed so public agent
 * profiles and brand content can be cited by ChatGPT, Claude, Perplexity,
 * Gemini, and others (AIO — AI optimization).
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "Meta-ExternalAgent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ALLOW,
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ALLOW,
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
