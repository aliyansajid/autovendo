/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.autovendo.ch",
      },
    ],
  },
};

export default nextConfig;
