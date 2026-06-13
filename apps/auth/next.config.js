import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
