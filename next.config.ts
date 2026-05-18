import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Force-include manifest files that Next.js loads dynamically at runtime.
  // The static file tracer misses these, causing ENOENT crashes in Vercel
  // serverless functions (all dynamic routes return 500).
  outputFileTracingIncludes: {
    "/**": [
      "./.next/server/pages-manifest.json",
      "./.next/routes-manifest.json",
      "./.next/server/app-paths-manifest.json",
      // @swc/helpers: tracer picks up CJS but runtime resolves 'webpack' export
      // condition which points to the ESM versions - include them all.
      "./node_modules/@swc/helpers/esm/**",
      "./node_modules/@swc/helpers/_/**",
    ],
  },
};

export default withNextIntl(nextConfig);
