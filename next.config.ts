import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["*.app.github.dev", "*.preview.app.github.dev"],
};

export default nextConfig;
