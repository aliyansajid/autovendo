import { describe, it, expect } from "vitest";
import {
  buildVehicleTitle,
  formatVehicleName,
  extractEquipment,
  formatEquipmentLabel,
  isElectric,
  isNew,
  parseSearchParams,
  mapVehicleToForm,
} from "@repo/ui/lib/helpers/vehicle";

describe("buildVehicleTitle", () => {
  it("joins make, model and version", () => {
    expect(buildVehicleTitle("BMW", "3 Series", "320d")).toBe(
      "BMW 3 Series 320d",
    );
  });

  it("omits null model", () => {
    expect(buildVehicleTitle("Audi", null, null)).toBe("Audi");
  });

  it("omits null version but includes model", () => {
    expect(buildVehicleTitle("Mercedes", "C-Class", null)).toBe(
      "Mercedes C-Class",
    );
  });

  it("handles all non-null parts", () => {
    expect(buildVehicleTitle("VW", "Golf", "GTI")).toBe("VW Golf GTI");
  });
});

describe("formatVehicleName", () => {
  it("capitalizes first letter of each word", () => {
    expect(formatVehicleName(["bmw 3 series"])).toBe("Bmw 3 Series");
  });

  it("handles hyphenated words", () => {
    expect(formatVehicleName(["mercedes-benz"])).toBe("Mercedes-Benz");
  });

  it("filters out null and undefined parts", () => {
    expect(formatVehicleName([null, "bmw", undefined])).toBe("Bmw");
  });

  it("joins multiple parts", () => {
    expect(formatVehicleName(["audi", "a4"])).toBe("Audi A4");
  });

  it("returns empty string for all null/empty parts", () => {
    expect(formatVehicleName([null, undefined, ""])).toBe("");
  });
});

describe("extractEquipment", () => {
  it("returns keys where value is true", () => {
    const equipment = { airConditioning: true, heatedSeats: false, gps: true };
    expect(extractEquipment(equipment)).toEqual(["airConditioning", "gps"]);
  });

  it("returns empty array for null", () => {
    expect(extractEquipment(null)).toEqual([]);
  });

  it("respects limit", () => {
    const equipment = { a: true, b: true, c: true, d: true };
    expect(extractEquipment(equipment, 2)).toHaveLength(2);
  });

  it("returns all items when no limit", () => {
    const equipment = { a: true, b: true, c: true };
    expect(extractEquipment(equipment)).toHaveLength(3);
  });

  it("returns empty array when no truthy values", () => {
    const equipment = { airConditioning: false, heatedSeats: false };
    expect(extractEquipment(equipment)).toEqual([]);
  });

  it("returns empty array for non-object", () => {
    expect(extractEquipment("string" as any)).toEqual([]);
    expect(extractEquipment(42 as any)).toEqual([]);
  });
});

describe("formatEquipmentLabel", () => {
  it("converts camelCase to title case", () => {
    expect(formatEquipmentLabel("airConditioning")).toBe("Air Conditioning");
  });

  it("handles single word", () => {
    expect(formatEquipmentLabel("gps")).toBe("Gps");
  });

  it("handles multiple capital letters", () => {
    expect(formatEquipmentLabel("heatedSeats")).toBe("Heated Seats");
  });

  it("handles complex camelCase", () => {
    expect(formatEquipmentLabel("panoramicSunroof")).toBe("Panoramic Sunroof");
  });
});

describe("isElectric", () => {
  it("returns true for ELECTRIC", () => {
    expect(isElectric("ELECTRIC")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isElectric("electric")).toBe(true);
    expect(isElectric("Electric")).toBe(true);
  });

  it("returns false for petrol", () => {
    expect(isElectric("PETROL")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isElectric(null)).toBe(false);
  });

  it("returns false for PHEV", () => {
    expect(isElectric("PHEV_PETROL")).toBe(false);
  });
});

describe("isNew", () => {
  it("returns true for NEW", () => {
    expect(isNew("NEW")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isNew("new")).toBe(true);
  });

  it("returns false for USED", () => {
    expect(isNew("USED")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNew(null)).toBe(false);
  });
});

describe("parseSearchParams", () => {
  it("coerces numeric string to number", () => {
    const result = parseSearchParams({ page: "2" });
    expect(result.page).toBe(2);
  });

  it("coerces 'true' string to boolean", () => {
    const result = parseSearchParams({ metallic: "true" });
    expect(result.metallic).toBe(true);
  });

  it("coerces 'false' string to boolean", () => {
    const result = parseSearchParams({ metallic: "false" });
    expect(result.metallic).toBe(false);
  });

  it("keeps string as string when not numeric or boolean", () => {
    const result = parseSearchParams({ search: "BMW M3" });
    expect(result.search).toBe("BMW M3");
  });

  it("splits comma-separated values for array keys", () => {
    const result = parseSearchParams({ make: "BMW,Audi" });
    expect(result.make).toEqual(["BMW", "Audi"]);
  });

  it("treats array param keys as arrays even without comma", () => {
    const result = parseSearchParams({ fuel: "diesel" });
    expect(result.fuel).toEqual(["diesel"]);
  });

  it("passes through already-array values", () => {
    const result = parseSearchParams({ make: ["BMW", "Audi"] });
    expect(result.make).toEqual(["BMW", "Audi"]);
  });

  it("skips undefined values", () => {
    const result = parseSearchParams({ page: undefined });
    expect(result.page).toBeUndefined();
  });

  it("trims whitespace from comma-separated values", () => {
    const result = parseSearchParams({ make: "BMW, Audi , VW" });
    expect(result.make).toEqual(["BMW", "Audi", "VW"]);
  });

  it("parses all ARRAY_PARAM_KEYS as arrays", () => {
    const arrayKeys = [
      "make",
      "model",
      "fuel",
      "transmission",
      "condition",
      "vehicleType",
      "bodyType",
      "color",
      "equipment",
      "driveType",
      "energyLabels",
      "emissionStandards",
      "interiorColor",
    ];
    for (const key of arrayKeys) {
      const result = parseSearchParams({ [key]: "somevalue" });
      expect(Array.isArray(result[key])).toBe(true);
    }
  });
});

describe("mapVehicleToForm", () => {
  const baseVehicle = {
    vehicleType: "CAR",
    make: "BMW",
    model: "3 Series",
    version: "320d",
    bodyType: "sedan",
    fuelType: "DIESEL",
    registrationMonth: 3,
    registrationYear: 2020,
    kilometer: 50000,
    price: 25000,
    newPrice: null,
    color: "BLACK",
    gearTransmission: "AUTOMATIC",
    transmissionType: null,
    driveType: "RWD",
    interiorColor: "BLACK_LEATHER",
    metallic: true,
    vehicleCondition: "USED",
    lastInspectionDate: null,
    inspectionPassed: null,
    warranty: null,
    warrantyStartDate: null,
    duration: null,
    maxKm: null,
    doors: 4,
    seats: 5,
    hp: 190,
    kw: 140,
    energyLabel: "B",
    typeApproval: "",
    wheelbase: null,
    vin: "WBAZA51050B267234",
    emptyWeight: null,
    loadCapacity: null,
    serialNumber: "",
    height: null,
    width: null,
    length: null,
    towingCapacityBraked: null,
    cubicCapacity: null,
    co2Emission: null,
    cylinders: null,
    numberOfGears: null,
    emissionStandard: "EURO_6",
    consumptionCity: null,
    consumptionCountry: null,
    consumptionTotal: null,
    range: null,
    batteryCapacity: null,
    batteryRentalMonth: null,
    powerConsumption: null,
    batteryOwnership: null,
    chargingPlugTypeStandard: null,
    chargingPlugTypeFast: null,
    chargingPower: null,
    combustionEnginePowerHp: null,
    electricMotorPowerHp: null,
    vehicleDescription: "Nice car",
    equipment: { airConditioning: true },
    extras: {},
    images: ["img1.jpg", "img2.jpg"],
    status: "ACTIVE",
  };

  it("lowercases vehicleType", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.vehicleType).toBe("car");
  });

  it("converts UPPER_SNAKE enum to kebab-case", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.fuelType).toBe("diesel");
    expect(form.emissionStandard).toBe("euro-6");
    expect(form.vehicleCondition).toBe("used");
  });

  it("converts color enum to kebab-case", () => {
    const form = mapVehicleToForm({ ...baseVehicle, color: "PEARL_WHITE" });
    expect(form.color).toBe("pearl-white");
  });

  it("converts interiorColor enum to kebab-case", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.interiorColor).toBe("black-leather");
  });

  it("keeps numeric fields as-is", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.kilometer).toBe(50000);
    expect(form.price).toBe(25000);
    expect(form.hp).toBe(190);
  });

  it("converts registrationMonth to string", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.registrationMonth).toBe("3");
  });

  it("converts registrationYear to string", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.registrationYear).toBe("2020");
  });

  it("maps null newPrice to undefined", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.newPrice).toBeUndefined();
  });

  it("maps vin to vehicleIdentificationNumber", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.vehicleIdentificationNumber).toBe("WBAZA51050B267234");
  });

  it("converts lastInspectionDate to Date when set", () => {
    const vehicle = { ...baseVehicle, lastInspectionDate: "2025-01-15" };
    const form = mapVehicleToForm(vehicle);
    expect(form.lastInspectionDate).toBeInstanceOf(Date);
  });

  it("maps null lastInspectionDate to undefined", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.lastInspectionDate).toBeUndefined();
  });

  it("lowercases energyLabel", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.energyLabel).toBe("b");
  });

  it("preserves images array", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.images).toEqual(["img1.jpg", "img2.jpg"]);
  });

  it("preserves equipment object", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.equipment).toEqual({ airConditioning: true });
  });

  it("maps null warranty to undefined", () => {
    const form = mapVehicleToForm(baseVehicle);
    expect(form.warranty).toBeUndefined();
  });
});
