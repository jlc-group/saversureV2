import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
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
    ],
  },
};

export default nextConfig;
