import { describe, it, expect } from "vitest";
import { createDealerProfileSchema } from "@/schema/profile-schema";

const t = (key: string) => key;
const schema = createDealerProfileSchema(t);

const validProfile = {
  name: "Hans Müller",
  email: "hans@example.com",
  image: null,
  companyName: "Auto Müller AG",
  description: null,
  website: null,
  logo: null,
  coverImage: null,
  streetAddress: "Bahnhofstrasse 10",
  zipCode: "8001",
  city: "Zürich",
  country: "Switzerland" as const,
  uidNumber: "CHE-123.456.789",
  contactPerson: "Hans Müller",
  phoneNumber: "+41 44 123 45 67",
  businessEmail: "info@automueller.ch",
  openingHours: [
    { day: "MONDAY", isOpen: true, openTime: "08:00", closeTime: "18:00" },
  ],
};

describe("createDealerProfileSchema", () => {
  it("accepts valid dealer profile", () => {
    const result = schema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = schema.safeParse({ ...validProfile, name: "Jo" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({ ...validProfile, email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("rejects companyName shorter than 3 characters", () => {
    const result = schema.safeParse({ ...validProfile, companyName: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects streetAddress shorter than 5 characters", () => {
    const result = schema.safeParse({
      ...validProfile,
      streetAddress: "Main",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zipCode shorter than 4 characters", () => {
    const result = schema.safeParse({ ...validProfile, zipCode: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects city shorter than 2 characters", () => {
    const result = schema.safeParse({ ...validProfile, city: "Z" });
    expect(result.success).toBe(false);
  });

  it("requires country to be exactly Switzerland", () => {
    const result = schema.safeParse({
      ...validProfile,
      country: "Germany" as any,
    });
    expect(result.success).toBe(false);
  });

  describe("uidNumber validation (CHE-XXX.XXX.XXX)", () => {
    it("accepts valid CHE UID", () => {
      const result = schema.safeParse({
        ...validProfile,
        uidNumber: "CHE-123.456.789",
      });
      expect(result.success).toBe(true);
    });

    it("rejects UID without CHE prefix", () => {
      const result = schema.safeParse({
        ...validProfile,
        uidNumber: "DE-123.456.789",
      });
      expect(result.success).toBe(false);
    });

    it("rejects UID with wrong format", () => {
      const result = schema.safeParse({
        ...validProfile,
        uidNumber: "CHE-12345678",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty UID", () => {
      const result = schema.safeParse({ ...validProfile, uidNumber: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("phoneNumber validation", () => {
    it("accepts +41 44 123 45 67 format", () => {
      const result = schema.safeParse({
        ...validProfile,
        phoneNumber: "+41 44 123 45 67",
      });
      expect(result.success).toBe(true);
    });

    it("accepts 044 123 45 67 format", () => {
      const result = schema.safeParse({
        ...validProfile,
        phoneNumber: "044 123 45 67",
      });
      expect(result.success).toBe(true);
    });

    it("rejects German phone number", () => {
      const result = schema.safeParse({
        ...validProfile,
        phoneNumber: "+49 30 12345678",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty phone", () => {
      const result = schema.safeParse({ ...validProfile, phoneNumber: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("openingHours", () => {
    it("accepts multiple opening hours entries", () => {
      const result = schema.safeParse({
        ...validProfile,
        openingHours: [
          {
            day: "MONDAY",
            isOpen: true,
            openTime: "08:00",
            closeTime: "18:00",
          },
          {
            day: "TUESDAY",
            isOpen: true,
            openTime: "08:00",
            closeTime: "18:00",
          },
          { day: "SUNDAY", isOpen: false, openTime: null, closeTime: null },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty openingHours array", () => {
      const result = schema.safeParse({ ...validProfile, openingHours: [] });
      expect(result.success).toBe(true);
    });

    it("rejects openingHours entry missing isOpen", () => {
      const result = schema.safeParse({
        ...validProfile,
        openingHours: [{ day: "MONDAY" }],
      });
      expect(result.success).toBe(false);
    });
  });

  it("accepts optional website URL", () => {
    const result = schema.safeParse({
      ...validProfile,
      website: "https://www.automueller.ch",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid website URL", () => {
    const result = schema.safeParse({
      ...validProfile,
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for website", () => {
    const result = schema.safeParse({ ...validProfile, website: "" });
    expect(result.success).toBe(true);
  });
});
