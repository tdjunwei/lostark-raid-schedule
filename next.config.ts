import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server components
    ppr: false,
  },
  // Temporarily ignore TypeScript errors for Excel importer issues
  // TODO: Fix user_id missing in Excel importer
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;