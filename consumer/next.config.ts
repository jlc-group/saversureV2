import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tdn.julaherb.saversure.com",
      },
      {
        protocol: "https",
        hostname: "*.svsu.me",
      },
      {
        protocol: "https",
        hostname: "*.saversure.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.0.41",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "s3.konvy.com",
      },
      {
        protocol: "https",
        hostname: "media.allonline.7eleven.co.th",
      },
    ],
  },
};

export default nextConfig;
