import { z } from "zod";

type TFn = (key: string) => string;

const CURRENT_YEAR = new Date().getFullYear();

const createOptionalNonNegativeNumberArray = (t: TFn) =>
  z.array(z.number().nonnegative(t("negativeError"))).optional();

const nonNegativeField = (t: TFn) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]/g, "");
        if (cleaned === "") return undefined;
        return Number(cleaned);
      }
      return Number(val);
    },
    z.number({ error: t("invalidNumber") }).nonnegative(t("negativeError")).optional(),
  );

// Used only for year — real UX value to show feedback
const rangeField = (t: TFn, min: number, max: number) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]/g, "");
        if (cleaned === "") return undefined;
        return Number(cleaned);
      }
      return Number(val);
    },
    z.number({ error: t("invalidNumber") }).min(min).max(max).optional(),
  );

const optionalStr = z.string().optional();

export const createAdvancedSearchFormSchema = (t: TFn) =>
  z
    .object({
      make: z.array(z.string()).optional(),
      excludeMake: z.array(z.string()).optional(),
      model: z.array(z.string()).optional(),

      // Year: 1900 – current year (UX feedback for typed input)
      year: createOptionalNonNegativeNumberArray(t),
      "year-from": rangeField(t, 1900, CURRENT_YEAR),
      "year-to": rangeField(t, 1900, CURRENT_YEAR),

      // Kilometer: ≥ 0
      kilometer: createOptionalNonNegativeNumberArray(t),
      "kilometer-from": nonNegativeField(t),
      "kilometer-to": nonNegativeField(t),

      // Price: ≥ 0
      price: createOptionalNonNegativeNumberArray(t),
      "price-from": nonNegativeField(t),
      "price-to": nonNegativeField(t),
      priceType: optionalStr,

      // Power: ≥ 0
      power: createOptionalNonNegativeNumberArray(t),
      "power-from": nonNegativeField(t),
      "power-to": nonNegativeField(t),
      powerType: optionalStr,

      // Cubic capacity: ≥ 0
      capacity: createOptionalNonNegativeNumberArray(t),
      "capacity-from": nonNegativeField(t),
      "capacity-to": nonNegativeField(t),

      // Cylinders: ≥ 0
      cylinder: createOptionalNonNegativeNumberArray(t),
      "cylinder-from": nonNegativeField(t),
      "cylinder-to": nonNegativeField(t),

      // Consumption: ≥ 0
      consumption: createOptionalNonNegativeNumberArray(t),
      "consumption-from": nonNegativeField(t),
      "consumption-to": nonNegativeField(t),

      // CO2 emissions: ≥ 0
      emissions: createOptionalNonNegativeNumberArray(t),
      "emissions-from": nonNegativeField(t),
      "emissions-to": nonNegativeField(t),

      daysListed: optionalStr,
    })
    .catchall(z.any());

export type AdvancedSearchFormValues = z.infer<
  ReturnType<typeof createAdvancedSearchFormSchema>
>;
