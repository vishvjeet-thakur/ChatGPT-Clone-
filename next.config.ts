import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // This option removes all console logs in production builds
    removeConsole: process.env.NODE_ENV === "production",
  }
  
};

export default nextConfig;
