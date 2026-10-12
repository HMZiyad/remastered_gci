import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.*.*",
    "192.168.1.100",
    "*.local",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "192.168.1.100:3000",
        "192.168.*:3000",
        "*.local:3000",
      ],
    },
  },
};

export default nextConfig;
