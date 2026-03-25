import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.autoscout24.ch",
      },
      {
        protocol: "https",
        hostname: "cdn.autovendo.ch",
      },
    ],
  },
  experimental: {
    inlineCss: true,
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default withNextIntl(nextConfig);
