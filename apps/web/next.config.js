import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.autovendo.ch",
      },
    ],
  },
  experimental: {
    inlineCss: true,
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
