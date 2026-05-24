import { describe, it, expect } from "vitest";
import { createDealerSearchSchema } from "@/schema/dealer-search-schema";
import { createVehicleFiltersSchema } from "@/schema/vehicle-filters-schema";
import { createVehicleSearchSchema } from "@/schema/vehicle-search-schema";

const t = (key: string) => key;

describe("createDealerSearchSchema", () => {
  const schema = createDealerSearchSchema(t);

  it("accepts valid search with query and page", () => {
    const result = schema.safeParse({ q: "BMW", page: 1 });
    expect(result.success).toBe(true);
  });

  it("defaults page to 1 when omitted", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
  });

  it("coerces string page to number", () => {
    const result = schema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(3);
  });

  it("rejects page 0 (not positive)", () => {
    const result = schema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = schema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts empty query", () => {
    const result = schema.safeParse({ q: "" });
    expect(result.success).toBe(true);
  });

  it("accepts undefined query", () => {
    const result = schema.safeParse({ page: 2 });
    expect(result.success).toBe(true);
    expect(result.data?.q).toBeUndefined();
  });
});

describe("createVehicleFiltersSchema", () => {
  const schema = createVehicleFiltersSchema(t);

  it("accepts empty object", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid price range strings", () => {
    const result = schema.safeParse({ priceFrom: "10000", priceTo: "50000" });
    expect(result.success).toBe(true);
  });

  it("accepts make as array of strings", () => {
    const result = schema.safeParse({ make: ["BMW", "Audi"] });
    expect(result.success).toBe(true);
  });

  it("accepts fuel as array of strings", () => {
    const result = schema.safeParse({ fuel: ["diesel", "electric"] });
    expect(result.success).toBe(true);
  });

  it("accepts metallic as boolean", () => {
    const result = schema.safeParse({ metallic: true });
    expect(result.success).toBe(true);
  });

  it("accepts condition as array", () => {
    const result = schema.safeParse({ condition: ["new", "used"] });
    expect(result.success).toBe(true);
  });

  it("accepts vehicleType as array", () => {
    const result = schema.safeParse({ vehicleType: ["car"] });
    expect(result.success).toBe(true);
  });

  it("accepts bodyType as array", () => {
    const result = schema.safeParse({ bodyType: ["sedan", "suv"] });
    expect(result.success).toBe(true);
  });

  it("accepts color as array", () => {
    const result = schema.safeParse({ color: ["black", "white"] });
    expect(result.success).toBe(true);
  });

  it("accepts transmission as array", () => {
    const result = schema.safeParse({ transmission: ["automatic"] });
    expect(result.success).toBe(true);
  });

  it("accepts registration range as strings", () => {
    const result = schema.safeParse({
      registrationFrom: "2015",
      registrationTo: "2023",
    });
    expect(result.success).toBe(true);
  });

  it("accepts kilometer range as strings", () => {
    const result = schema.safeParse({
      kilometerFrom: "0",
      kilometerTo: "100000",
    });
    expect(result.success).toBe(true);
  });

  it("passes through extra fields via catchall", () => {
    const result = schema.safeParse({ customField: "value" });
    expect(result.success).toBe(true);
  });
});

describe("createVehicleSearchSchema", () => {
  const schema = createVehicleSearchSchema(t);

  it("accepts empty object with defaults", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(10);
    expect(result.data?.sort).toBe("relevance");
    expect(result.data?.search).toBe("");
  });

  it("accepts valid page and pageSize", () => {
    const result = schema.safeParse({ page: 2, pageSize: 25 });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(2);
    expect(result.data?.pageSize).toBe(25);
  });

  it("rejects page less than 1", () => {
    expect(schema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects pageSize greater than 100", () => {
    expect(schema.safeParse({ pageSize: 101 }).success).toBe(false);
  });

  it("accepts all valid sort options", () => {
    const sortOptions = [
      "relevance",
      "price-asc",
      "price-desc",
      "kilometer-asc",
      "kilometer-desc",
      "registration-asc",
      "registration-desc",
      "created-asc",
      "created-desc",
    ];
    for (const sort of sortOptions) {
      expect(schema.safeParse({ sort }).success).toBe(true);
    }
  });

  it("rejects invalid sort option", () => {
    expect(schema.safeParse({ sort: "unknown" }).success).toBe(false);
  });

  it("accepts make and model as string arrays", () => {
    const result = schema.safeParse({ make: ["BMW", "Audi"], model: ["3 Series"] });
    expect(result.success).toBe(true);
  });

  it("accepts excludeMake and excludeModel", () => {
    const result = schema.safeParse({ excludeMake: ["Tesla"], excludeModel: ["Model 3"] });
    expect(result.success).toBe(true);
  });

  it("accepts numeric price range", () => {
    const result = schema.safeParse({ priceFrom: 5000, priceTo: 50000 });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    expect(schema.safeParse({ priceFrom: -1 }).success).toBe(false);
  });

  it("accepts registration year range within 1900–2100", () => {
    const result = schema.safeParse({ registrationFrom: 2010, registrationTo: 2023 });
    expect(result.success).toBe(true);
  });

  it("rejects registrationFrom below 1900", () => {
    expect(schema.safeParse({ registrationFrom: 1899 }).success).toBe(false);
  });

  it("accepts kilometer range", () => {
    const result = schema.safeParse({ kilometerFrom: 0, kilometerTo: 150000 });
    expect(result.success).toBe(true);
  });

  it("accepts fuel as array of valid enum values", () => {
    const result = schema.safeParse({ fuel: ["diesel", "electric"] });
    expect(result.success).toBe(true);
  });

  it("rejects fuel with invalid enum value", () => {
    expect(schema.safeParse({ fuel: ["gasoline"] }).success).toBe(false);
  });

  it("accepts evs filter only_ev and no_ev", () => {
    expect(schema.safeParse({ evs: "only_ev" }).success).toBe(true);
    expect(schema.safeParse({ evs: "no_ev" }).success).toBe(true);
  });

  it("rejects invalid evs value", () => {
    expect(schema.safeParse({ evs: "all" }).success).toBe(false);
  });

  it("accepts metallic boolean", () => {
    expect(schema.safeParse({ metallic: true }).success).toBe(true);
    expect(schema.safeParse({ metallic: false }).success).toBe(true);
  });

  it("accepts inspectionPassed and hasWarranty booleans", () => {
    const result = schema.safeParse({ inspectionPassed: true, hasWarranty: false });
    expect(result.success).toBe(true);
  });

  it("accepts daysListed as positive integer", () => {
    expect(schema.safeParse({ daysListed: 7 }).success).toBe(true);
  });

  it("rejects daysListed of 0 (must be positive)", () => {
    expect(schema.safeParse({ daysListed: 0 }).success).toBe(false);
  });

  it("accepts dealerId string", () => {
    expect(schema.safeParse({ dealerId: "clx123abc" }).success).toBe(true);
  });

  it("accepts kW power range", () => {
    const result = schema.safeParse({ kwFrom: 50, kwTo: 200 });
    expect(result.success).toBe(true);
  });

  it("accepts energy labels and emission standards as string arrays", () => {
    const result = schema.safeParse({
      energyLabels: ["A", "B"],
      emissionStandards: ["EURO_6"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts co2 and consumption ranges", () => {
    const result = schema.safeParse({
      co2From: 0,
      co2To: 200,
      consumptionFrom: 4.5,
      consumptionTo: 10.0,
    });
    expect(result.success).toBe(true);
  });
});
