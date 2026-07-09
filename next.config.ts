import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise misleads detection.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Backend-served media (property images, documents). Use remotePatterns (Next 16: images.domains deprecated).
    remotePatterns: [
      { protocol: "https", hostname: "api.crestapp.ng" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
};

export default nextConfig;
