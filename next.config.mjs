import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Next.js workspace and output tracing inside this frontend app.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  poweredByHeader: false,
  reactStrictMode: true,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  allowedDevOrigins: ["wriggle-reprocess-scruffy.ngrok-free.dev"],
  async rewrites() {
    const backendApi = (process.env.BACKEND_INTERNAL_API_URL ?? "http://127.0.0.1:4000/api").replace(/\/+$/, "");
    return [{ source: "/api/:path*", destination: `${backendApi}/:path*` }];
  },
};
export default nextConfig;
