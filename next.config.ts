import type { NextConfig } from "next";
// import { hostname } from "os";
const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config) => {
    config.resolve.alias.cavas = false;
    return config
  },
  images: {
    // domains: ["img.clerk.com"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.example.com',
        port: '',
        pathname: '/account123/**'
      }, {
        protocol: "https",
        hostname: "img.clerk.com"
      }, {
        protocol: "https",
        hostname: "i.imgur.com"
      }
    ]
  },
  experimental:{
    turbo: {
      rules:{
        "*.mdx":["mdx-loader"]
      }
    }
  }
};

export default nextConfig;
