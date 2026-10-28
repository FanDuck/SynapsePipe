import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  images: {
    // The workbench is local-first and may display arbitrary user-provided URLs.
    // Disabling the optimizer keeps remote media working without a domain allowlist.
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  // Never trace local runtime data into the standalone/Docker bundle.
  outputFileTracingExcludes: {
    "/*": ["./data/**/*", "./.qa/**/*", "./.shots/**/*", "./.browser/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
