import { describe, it, expect } from "vitest";
import { createVehicleFormSchema } from "@/schema/vehicle-form-schema";

const t = (key: string) => key;
const schema = createVehicleFormSchema(t);

// Minimum valid vehicle — only mandatory fields
const validVehicle = {
  vehicleType: "car",
  make: "mercedes",
  bodyType: "coupe",
  color: "black",
  registrationMonth: 6,
  registrationYear: 2020,
  kilometer: 50000,
  price: 25000,
};

describe("createVehicleFormSchema", () => {
  describe("vehicleType", () => {
    it("accepts valid vehicle types", () => {
      for (const type of ["car", "utility", "truck", "camper"]) {
        expect(schema.safeParse({ ...validVehicle, vehicleType: type }).success).toBe(true);
      }
    });

    it("rejects invalid vehicle type", () => {
      expect(
        schema.safeParse({ ...validVehicle, vehicleType: "bicycle" }).success,
      ).toBe(false);
    });
  });

  describe("status", () => {
    it("defaults to PUBLISHED", () => {
      const result = schema.safeParse(validVehicle);
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("PUBLISHED");
    });

    it("accepts all valid status values", () => {
      for (const status of ["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "ARCHIVED", "BANNED"]) {
        expect(schema.safeParse({ ...validVehicle, status }).success).toBe(true);
      }
    });

    it("rejects invalid status", () => {
      expect(schema.safeParse({ ...validVehicle, status: "ACTIVE" }).success).toBe(false);
    });
  });

  describe("make", () => {
    it("accepts valid make", () => {
      expect(schema.safeParse({ ...validVehicle, make: "mercedes" }).success).toBe(true);
    });

    it("rejects invalid make", () => {
      expect(
        schema.safeParse({ ...validVehicle, make: "not-a-real-brand" }).success,
      ).toBe(false);
    });
  });

  describe("bodyType", () => {
    it("accepts valid body type", () => {
      expect(schema.safeParse({ ...validVehicle, bodyType: "coupe" }).success).toBe(true);
    });

    it("rejects invalid body type", () => {
      expect(
        schema.safeParse({ ...validVehicle, bodyType: "hover-craft" }).success,
      ).toBe(false);
    });
  });

  describe("color", () => {
    it("accepts valid color", () => {
      for (const color of ["black", "white", "anthracite", "beige"]) {
        expect(schema.safeParse({ ...validVehicle, color }).success).toBe(true);
      }
    });

    it("rejects invalid color", () => {
      expect(
        schema.safeParse({ ...validVehicle, color: "rainbow" }).success,
      ).toBe(false);
    });
  });

  describe("registrationMonth", () => {
    it("accepts 1–12", () => {
      expect(schema.safeParse({ ...validVehicle, registrationMonth: 1 }).success).toBe(true);
      expect(schema.safeParse({ ...validVehicle, registrationMonth: 12 }).success).toBe(true);
    });

    it("rejects 0", () => {
      expect(schema.safeParse({ ...validVehicle, registrationMonth: 0 }).success).toBe(false);
    });

    it("rejects 13", () => {
      expect(schema.safeParse({ ...validVehicle, registrationMonth: 13 }).success).toBe(false);
    });

    it("coerces numeric string to number", () => {
      const result = schema.safeParse({ ...validVehicle, registrationMonth: "6" });
      expect(result.success).toBe(true);
      expect(result.data?.registrationMonth).toBe(6);
    });
  });

  describe("registrationYear", () => {
    it("accepts year in valid range", () => {
      expect(schema.safeParse({ ...validVehicle, registrationYear: 2000 }).success).toBe(true);
      expect(schema.safeParse({ ...validVehicle, registrationYear: 1990 }).success).toBe(true);
    });

    it("rejects year below 1900", () => {
      expect(schema.safeParse({ ...validVehicle, registrationYear: 1899 }).success).toBe(false);
    });

    it("rejects year above current year", () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(schema.safeParse({ ...validVehicle, registrationYear: futureYear }).success).toBe(false);
    });

    it("coerces string year", () => {
      const result = schema.safeParse({ ...validVehicle, registrationYear: "2020" });
      expect(result.success).toBe(true);
      expect(result.data?.registrationYear).toBe(2020);
    });
  });

  describe("kilometer", () => {
    it("accepts 0 km (new vehicle)", () => {
      expect(schema.safeParse({ ...validVehicle, kilometer: 0 }).success).toBe(true);
    });

    it("rejects negative km", () => {
      expect(schema.safeParse({ ...validVehicle, kilometer: -1 }).success).toBe(false);
    });

    it("coerces string to number", () => {
      const result = schema.safeParse({ ...validVehicle, kilometer: "50000" });
      expect(result.success).toBe(true);
      expect(result.data?.kilometer).toBe(50000);
    });

    it("treats empty string as undefined (optional after preprocessing)", () => {
      const result = schema.safeParse({ ...validVehicle, kilometer: "" });
      // Empty string → preprocessed to undefined → number min(0) fails since undefined
      // The field is required so this should fail
      expect(result.success).toBe(false);
    });
  });

  describe("price", () => {
    it("accepts 0 price", () => {
      expect(schema.safeParse({ ...validVehicle, price: 0 }).success).toBe(true);
    });

    it("rejects negative price", () => {
      expect(schema.safeParse({ ...validVehicle, price: -1 }).success).toBe(false);
    });

    it("coerces string price", () => {
      const result = schema.safeParse({ ...validVehicle, price: "25000" });
      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(25000);
    });
  });

  describe("optional numeric fields", () => {
    it("accepts hp, kw, doors, seats as positive numbers", () => {
      const result = schema.safeParse({
        ...validVehicle,
        hp: 190,
        kw: 140,
        doors: 4,
        seats: 5,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative hp", () => {
      expect(schema.safeParse({ ...validVehicle, hp: -10 }).success).toBe(false);
    });

    it("accepts co2Emission, cubicCapacity, cylinders", () => {
      const result = schema.safeParse({
        ...validVehicle,
        co2Emission: 120,
        cubicCapacity: 1997,
        cylinders: 4,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("optional enum fields", () => {
    it("accepts valid vehicleCondition", () => {
      expect(
        schema.safeParse({ ...validVehicle, vehicleCondition: "used" }).success,
      ).toBe(true);
    });

    it("rejects invalid vehicleCondition", () => {
      expect(
        schema.safeParse({ ...validVehicle, vehicleCondition: "broken" }).success,
      ).toBe(false);
    });

    it("accepts valid gearTransmission", () => {
      expect(
        schema.safeParse({ ...validVehicle, gearTransmission: "automatic" }).success,
      ).toBe(true);
    });

    it("accepts valid energyLabel", () => {
      expect(
        schema.safeParse({ ...validVehicle, energyLabel: "a" }).success,
      ).toBe(true);
    });
  });

  describe("metallic / inspectionPassed", () => {
    it("defaults metallic to false", () => {
      const result = schema.safeParse(validVehicle);
      expect(result.data?.metallic).toBe(false);
    });

    it("accepts metallic true", () => {
      expect(schema.safeParse({ ...validVehicle, metallic: true }).success).toBe(true);
    });

    it("defaults inspectionPassed to false", () => {
      const result = schema.safeParse(validVehicle);
      expect(result.data?.inspectionPassed).toBe(false);
    });
  });

  describe("optional string fields", () => {
    it("accepts model and version", () => {
      const result = schema.safeParse({ ...validVehicle, model: "C-Class", version: "C220d" });
      expect(result.success).toBe(true);
    });

    it("accepts vehicleDescription", () => {
      const result = schema.safeParse({ ...validVehicle, vehicleDescription: "Well maintained." });
      expect(result.success).toBe(true);
    });

    it("accepts typeApproval and serialNumber", () => {
      const result = schema.safeParse({ ...validVehicle, typeApproval: "KBA12345", serialNumber: "SN001" });
      expect(result.success).toBe(true);
    });
  });

  describe("lastInspectionDate / warrantyStartDate", () => {
    it("accepts a Date object for lastInspectionDate", () => {
      const result = schema.safeParse({ ...validVehicle, lastInspectionDate: new Date("2024-01-01") });
      expect(result.success).toBe(true);
    });

    it("accepts a Date object for warrantyStartDate", () => {
      const result = schema.safeParse({ ...validVehicle, warrantyStartDate: new Date("2023-06-01") });
      expect(result.success).toBe(true);
    });
  });

  describe("images", () => {
    it("accepts array of string URLs (already uploaded)", () => {
      const result = schema.safeParse({
        ...validVehicle,
        images: ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg"],
      });
      expect(result.success).toBe(true);
    });
  });
});
