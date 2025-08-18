import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server components
    ppr: false,
  },
  // Enable type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;