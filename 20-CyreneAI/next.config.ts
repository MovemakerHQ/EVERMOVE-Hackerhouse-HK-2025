import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['robohash.org', 'ipfs.erebrus.io'], 
    unoptimized: true,
  }, 
};

export default nextConfig;
