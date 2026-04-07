import type { NextConfig } from "next";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ hostname: "picsum.photos" }, { hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
