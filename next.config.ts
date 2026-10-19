import type { NextConfig } from "next";

const siteHost = process.env.NEXT_PUBLIC_SITE_URL
  ? (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SITE_URL).host;
      } catch {
        return undefined;
      }
    })()
  : undefined;

const allowedOrigins = [
  "localhost:3000",
  "127.0.0.1:3000",
  "192.168.1.100:3000",
  "192.168.*:3000",
  "*.local:3000",
  "goodcarimports.com",
  "www.goodcarimports.com",
  "*.goodcarimports.com",
  ...(siteHost ? [siteHost] : []),
];

const nextConfig: NextConfig = {
  /* config options here */
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
      allowedOrigins,
    },
  },
};

export default nextConfig;
