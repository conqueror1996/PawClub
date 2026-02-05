import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Fix for Next.js 16 + custom webpack (Serwist/PWA)
  // Moving to top-level as suggested by some Next.js 16 error messages
  turbopack: {},
} as any;

export default withSerwist(nextConfig);
