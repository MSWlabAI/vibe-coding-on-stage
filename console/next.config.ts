import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Live tallies must never be prerendered; keep everything request-time.
  cacheComponents: false,
  // The web deck is a static page in public/deck; serve it at /deck too.
  async rewrites() {
    return [{ source: '/deck', destination: '/deck/index.html' }]
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
