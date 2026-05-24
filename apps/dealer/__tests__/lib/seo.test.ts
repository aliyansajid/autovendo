import { describe, it, expect } from "vitest";
import { buildAlternates, buildMetadata, PAGE_META } from "@/lib/seo";

describe("buildAlternates", () => {
  it("builds canonical URL from locale and path", () => {
    const result = buildAlternates("de", "/cars");
    expect(result.canonical).toBe("https://autovendo.ch/de/cars");
  });

  it("builds alternate links for all 4 locales", () => {
    const result = buildAlternates("en", "/cars");
    expect(result.languages).toHaveProperty("de");
    expect(result.languages).toHaveProperty("en");
    expect(result.languages).toHaveProperty("fr");
    expect(result.languages).toHaveProperty("it");
  });

  it("each alternate URL uses its own locale", () => {
    const result = buildAlternates("de", "/dealers");
    expect(result.languages["de"]).toBe("https://autovendo.ch/de/dealers");
    expect(result.languages["en"]).toBe("https://autovendo.ch/en/dealers");
    expect(result.languages["fr"]).toBe("https://autovendo.ch/fr/dealers");
    expect(result.languages["it"]).toBe("https://autovendo.ch/it/dealers");
  });

  it("works with root path", () => {
    const result = buildAlternates("de", "");
    expect(result.canonical).toBe("https://autovendo.ch/de");
  });

  it("works with nested path", () => {
    const result = buildAlternates("fr", "/cars/clx123abc");
    expect(result.canonical).toBe("https://autovendo.ch/fr/cars/clx123abc");
  });
});

describe("buildMetadata", () => {
  const meta = PAGE_META.home;

  it("returns title and description for the requested locale", () => {
    const result = buildMetadata("de", "/", meta);
    expect(result.title).toBe(meta.de.title);
    expect(result.description).toBe(meta.de.description);
  });

  it("returns English metadata for locale=en", () => {
    const result = buildMetadata("en", "/", meta);
    expect(result.title).toBe(meta.en.title);
    expect(result.description).toBe(meta.en.description);
  });

  it("returns French metadata for locale=fr", () => {
    const result = buildMetadata("fr", "/", meta);
    expect(result.title).toBe(meta.fr.title);
  });

  it("returns Italian metadata for locale=it", () => {
    const result = buildMetadata("it", "/", meta);
    expect(result.title).toBe(meta.it.title);
  });

  it("falls back to de for unknown locale", () => {
    const result = buildMetadata("xx", "/", meta);
    expect(result.title).toBe(meta.de.title);
  });

  it("includes openGraph with correct URL", () => {
    const result = buildMetadata("de", "/cars", meta);
    expect((result.openGraph as any)?.url).toBe("https://autovendo.ch/de/cars");
    expect((result.openGraph as any)?.siteName).toBe("AutoVendo");
    expect((result.openGraph as any)?.type).toBe("website");
  });

  it("uses default OG image when none provided", () => {
    const result = buildMetadata("de", "/", meta);
    const images = (result.openGraph as any)?.images;
    expect(images[0].url).toContain("512x512");
  });

  it("uses provided OG image", () => {
    const result = buildMetadata("de", "/", meta, "https://cdn.example.com/og.jpg");
    const images = (result.openGraph as any)?.images;
    expect(images[0].url).toBe("https://cdn.example.com/og.jpg");
  });

  it("includes twitter card metadata", () => {
    const result = buildMetadata("de", "/", meta);
    expect(result.twitter?.card).toBe("summary_large_image");
    expect(result.twitter?.title).toBe(meta.de.title);
  });

  it("includes alternates with canonical", () => {
    const result = buildMetadata("en", "/dealers", meta);
    expect((result.alternates as any)?.canonical).toBe("https://autovendo.ch/en/dealers");
  });

  it("sets correct OG locale for de → de_CH", () => {
    const result = buildMetadata("de", "/", meta);
    expect((result.openGraph as any)?.locale).toBe("de_CH");
  });

  it("sets correct OG locale for en → en_US", () => {
    const result = buildMetadata("en", "/", meta);
    expect((result.openGraph as any)?.locale).toBe("en_US");
  });

  it("sets correct OG locale for fr → fr_CH", () => {
    const result = buildMetadata("fr", "/", meta);
    expect((result.openGraph as any)?.locale).toBe("fr_CH");
  });

  it("sets correct OG locale for it → it_CH", () => {
    const result = buildMetadata("it", "/", meta);
    expect((result.openGraph as any)?.locale).toBe("it_CH");
  });
});

describe("PAGE_META completeness", () => {
  const pages = ["home", "cars", "dealers", "pricing", "howItWorks", "faq", "about", "sell"] as const;
  const locales = ["de", "en", "fr", "it"] as const;

  for (const page of pages) {
    for (const locale of locales) {
      it(`PAGE_META.${page}.${locale} has non-empty title and description`, () => {
        const entry = PAGE_META[page][locale];
        expect(entry.title.length).toBeGreaterThan(0);
        expect(entry.description.length).toBeGreaterThan(0);
      });
    }
  }
});
