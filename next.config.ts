import type { NextConfig } from "next";

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      ...(mediaHost ? [{ protocol: "https" as const, hostname: mediaHost }] : []),
    ],
  },
};

export default nextConfig;
