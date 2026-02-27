/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "assets.autoscout24.ch",
      },
    ],
  },
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
