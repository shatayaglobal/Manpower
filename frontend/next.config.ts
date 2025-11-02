import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.shatayaglobal.com",
        port: "",
        pathname: "/media/**",
      },
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
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
