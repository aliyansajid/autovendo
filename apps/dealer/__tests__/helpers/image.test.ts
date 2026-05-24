import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// We need to control the env var before importing the module
const PLACEHOLDER = "/placeholder-car.jpg";

describe("image helpers", () => {
  let getImageUrl: (key: string | undefined | null) => string;
  let getImageUrls: (keys: string[]) => string[];
  let getFirstImage: (images: string[]) => string;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("@/lib/helpers/image");
    getImageUrl = mod.getImageUrl;
    getImageUrls = mod.getImageUrls;
    getFirstImage = mod.getFirstImage;
  });

  describe("getImageUrl", () => {
    it("returns placeholder for null", () => {
      expect(getImageUrl(null)).toBe(PLACEHOLDER);
    });

    it("returns placeholder for undefined", () => {
      expect(getImageUrl(undefined)).toBe(PLACEHOLDER);
    });

    it("returns placeholder for empty string", () => {
      expect(getImageUrl("")).toBe(PLACEHOLDER);
    });

    it("returns absolute URL as-is", () => {
      const url = "https://cdn.example.com/image.jpg";
      expect(getImageUrl(url)).toBe(url);
    });

    it("builds URL from key using R2 domain env var", () => {
      process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN = "https://cdn.example.com";
      const result = getImageUrl("user123/listing/123_car.jpg");
      expect(result).toContain("user123/listing/123_car.jpg");
    });

    it("strips leading slash from key", () => {
      process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN = "https://cdn.example.com";
      const result = getImageUrl("/user123/listing/123_car.jpg");
      expect(result).not.toContain("//user123");
    });
  });

  describe("getImageUrls", () => {
    it("maps array of keys to URLs", () => {
      const keys = ["img1.jpg", "img2.jpg"];
      const result = getImageUrls(keys);
      expect(result).toHaveLength(2);
    });

    it("returns placeholder for null keys in array", () => {
      const result = getImageUrls(["", ""]);
      expect(result).toEqual([PLACEHOLDER, PLACEHOLDER]);
    });

    it("returns empty array for empty input", () => {
      expect(getImageUrls([])).toEqual([]);
    });
  });

  describe("getFirstImage", () => {
    it("returns URL of first image", () => {
      const result = getFirstImage(["img1.jpg", "img2.jpg"]);
      expect(result).toContain("img1");
    });

    it("returns placeholder for empty array", () => {
      expect(getFirstImage([])).toBe(PLACEHOLDER);
    });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
  });
});
