import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Development - 127.0.0.1
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      // Development - localhost
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      // Production - API Domain (ADD THIS)
      {
        protocol: "https",
        hostname: "api.shatayaglobal.com",
        port: "",
        pathname: "/media/**",
      },
      // Production - ShatayaGlobal
      {
        protocol: "https",
        hostname: "www.shatayaglobal.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "shatayaglobal.com",
        pathname: "/media/**",
      },
      // Vercel Blob Storage (if you're using it)
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
