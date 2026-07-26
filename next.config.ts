import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export — the whole app is client-rendered (every page is
   * `"use client"`, all data fetched at runtime from api.crestapp.ng via
   * TanStack Query), so it ships as static files to Hostinger shared hosting,
   * exactly like the admin SPA. `next build` writes to `out/`. See
   * docs/deployment.md.
   *
   * Consequences this config accepts:
   * - `images.unoptimized` — no server to run the Next image optimizer.
   * - `trailingSlash` — emits `/route/index.html`, which LiteSpeed/Apache
   *   serve cleanly as directory indexes.
   * - No middleware (`proxy.ts` removed) and no dynamic route params — the
   *   detail pages read their id from a query string (`?id=`) instead.
   */
  output: "export",
  trailingSlash: true,
  // Pin the workspace root — a stray lockfile in the home dir otherwise misleads detection.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    unoptimized: true,
    // Backend-served media (property images, documents). Use remotePatterns (Next 16: images.domains deprecated).
    remotePatterns: [
      { protocol: "https", hostname: "api.crestapp.ng" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
};

export default nextConfig;
