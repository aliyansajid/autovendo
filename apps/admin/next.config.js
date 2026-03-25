/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/db", "@repo/auth", "@repo/transactional"],
};

export default nextConfig;
