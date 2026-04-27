import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "Amazonbot", disallow: "/" },
      { userAgent: "meta-externalagent", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: "https://autosolo.ch/sitemap.xml",
  };
}
