import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.autosolo.ch",
      },
    ],
  },
  experimental: {
    inlineCss: true,
    authInterrupts: true,
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "autosolo",
  project: "autosolo",

  silent: !process.env.CI,

  widenClientFileUpload: true,

  tunnelRoute: "/monitoring",

  webpack: {
    automaticVercelMonitors: true,

    treeshake: {
      removeDebugLogging: true,
    },
  },
});
