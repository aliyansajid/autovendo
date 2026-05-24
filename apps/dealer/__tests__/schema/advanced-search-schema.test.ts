import { describe, it, expect } from "vitest";
import { createAdvancedSearchFormSchema } from "@/schema/advanced-search-schema";

const t = (key: string) => key;
const schema = createAdvancedSearchFormSchema(t);

describe("createAdvancedSearchFormSchema", () => {
  it("accepts empty object", () => {
    expect(schema.safeParse({}).success).toBe(true);
  });

  describe("make / model / excludeMake", () => {
    it("accepts make as string array", () => {
      expect(schema.safeParse({ make: ["BMW", "Audi"] }).success).toBe(true);
    });

    it("accepts excludeMake as string array", () => {
      expect(schema.safeParse({ excludeMake: ["Tesla"] }).success).toBe(true);
    });

    it("accepts model as string array", () => {
      expect(schema.safeParse({ model: ["3 Series", "A4"] }).success).toBe(true);
    });

    it("accepts all three together", () => {
      const result = schema.safeParse({
        make: ["BMW"],
        excludeMake: ["Tesla"],
        model: ["3 Series"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("numeric range preprocessing", () => {
    it("coerces numeric string to number for year-from", () => {
      const result = schema.safeParse({ "year-from": "2015" });
      expect(result.success).toBe(true);
      expect(result.data?.["year-from"]).toBe(2015);
    });

    it("coerces numeric string to number for price-to", () => {
      const result = schema.safeParse({ "price-to": "50000" });
      expect(result.success).toBe(true);
      expect(result.data?.["price-to"]).toBe(50000);
    });

    it("strips non-numeric characters from formatted numbers (e.g. 1'000)", () => {
      const result = schema.safeParse({ "kilometer-from": "1'000" });
      expect(result.success).toBe(true);
      expect(result.data?.["kilometer-from"]).toBe(1000);
    });

    it("treats empty string as undefined for numeric fields", () => {
      const result = schema.safeParse({ "power-from": "" });
      expect(result.success).toBe(true);
      expect(result.data?.["power-from"]).toBeUndefined();
    });

    it("treats null as undefined for numeric fields", () => {
      const result = schema.safeParse({ "emissions-from": null });
      expect(result.success).toBe(true);
      expect(result.data?.["emissions-from"]).toBeUndefined();
    });
  });

  describe("array ranges", () => {
    it("accepts year as array of non-negative numbers", () => {
      const result = schema.safeParse({ year: [2015, 2023] });
      expect(result.success).toBe(true);
    });

    it("accepts kilometer as array", () => {
      const result = schema.safeParse({ kilometer: [0, 100000] });
      expect(result.success).toBe(true);
    });

    it("accepts price as array", () => {
      const result = schema.safeParse({ price: [5000, 50000] });
      expect(result.success).toBe(true);
    });

    it("accepts power as array", () => {
      const result = schema.safeParse({ power: [100, 300] });
      expect(result.success).toBe(true);
    });

    it("accepts capacity as array", () => {
      const result = schema.safeParse({ capacity: [1600, 2000] });
      expect(result.success).toBe(true);
    });

    it("accepts cylinder as array", () => {
      const result = schema.safeParse({ cylinder: [4, 6] });
      expect(result.success).toBe(true);
    });

    it("accepts consumption as array", () => {
      const result = schema.safeParse({ consumption: [5.0, 10.0] });
      expect(result.success).toBe(true);
    });

    it("accepts emissions as array", () => {
      const result = schema.safeParse({ emissions: [0, 150] });
      expect(result.success).toBe(true);
    });

    it("rejects negative numbers in arrays", () => {
      expect(schema.safeParse({ year: [-1] }).success).toBe(false);
    });
  });

  describe("daysListed", () => {
    it("accepts daysListed as string", () => {
      expect(schema.safeParse({ daysListed: "7" }).success).toBe(true);
    });

    it("accepts undefined daysListed", () => {
      expect(schema.safeParse({}).success).toBe(true);
    });
  });

  describe("priceType / powerType", () => {
    it("accepts priceType as string", () => {
      expect(schema.safeParse({ priceType: "total" }).success).toBe(true);
    });

    it("accepts powerType as string", () => {
      expect(schema.safeParse({ powerType: "kw" }).success).toBe(true);
    });
  });

  describe("catchall", () => {
    it("allows arbitrary additional fields", () => {
      const result = schema.safeParse({ unknownField: "anything", anotherField: 42 });
      expect(result.success).toBe(true);
    });
  });

  describe("full search object", () => {
    it("accepts a complete advanced search payload", () => {
      const result = schema.safeParse({
        make: ["BMW", "Mercedes"],
        excludeMake: ["Tesla"],
        model: ["3 Series"],
        "year-from": "2015",
        "year-to": "2023",
        "price-from": "10000",
        "price-to": "80000",
        priceType: "total",
        "kilometer-from": "0",
        "kilometer-to": "100000",
        "power-from": "100",
        "power-to": "300",
        powerType: "ps",
        "capacity-from": "1600",
        "capacity-to": "3000",
        "emissions-from": "0",
        "emissions-to": "200",
        daysListed: "30",
      });
      expect(result.success).toBe(true);
      expect(result.data?.["year-from"]).toBe(2015);
      expect(result.data?.["price-from"]).toBe(10000);
    });
  });
});
