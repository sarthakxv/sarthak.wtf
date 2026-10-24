import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Let `page.mdx` files be treated as routable pages.
  pageExtensions: ["ts", "tsx", "mdx"],
  async redirects() {
    return [
      { source: "/essay", destination: "/writing", permanent: true },
      { source: "/essay/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
