import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 425, 768, 1024, 1440],
    imageSizes: [120, 240, 360],
  },
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
