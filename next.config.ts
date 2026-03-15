import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose env to the Next.js server (API routes) so .env.local is available
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  },
};

export default nextConfig;
