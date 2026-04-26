import { z } from "zod";

type TFn = (key: string) => string;

const createOptionalNonNegativeNumberArray = (t: TFn) =>
  z.array(z.number().nonnegative(t("negativeError"))).optional();

const createOptionalNonNegativeNumberString = (t: TFn) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = Number(val);
      // If it's a string like "1'000+" we might want to strip non-digits,
      // but for now let's just use standard Number parsing or custom numeric extraction.
      if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]/g, "");
        if (cleaned === "") return undefined;
        return Number(cleaned);
      }
      return num;
    },
    z
      .number({ error: t("invalidNumber") })
      .nonnegative(t("negativeError"))
      .optional(),
  );

const optionalStr = z.string().optional();

export const createAdvancedSearchFormSchema = (t: TFn) =>
  z
    .object({
      make: z.array(z.string()).optional(),
      excludeMake: z.array(z.string()).optional(),
      model: z.array(z.string()).optional(),
      year: createOptionalNonNegativeNumberArray(t),
      "year-from": createOptionalNonNegativeNumberString(t),
      "year-to": createOptionalNonNegativeNumberString(t),

      kilometer: createOptionalNonNegativeNumberArray(t),
      "kilometer-from": createOptionalNonNegativeNumberString(t),
      "kilometer-to": createOptionalNonNegativeNumberString(t),

      price: createOptionalNonNegativeNumberArray(t),
      "price-from": createOptionalNonNegativeNumberString(t),
      "price-to": createOptionalNonNegativeNumberString(t),
      priceType: optionalStr,

      power: createOptionalNonNegativeNumberArray(t),
      "power-from": createOptionalNonNegativeNumberString(t),
      "power-to": createOptionalNonNegativeNumberString(t),
      powerType: optionalStr,

      capacity: createOptionalNonNegativeNumberArray(t),
      "capacity-from": createOptionalNonNegativeNumberString(t),
      "capacity-to": createOptionalNonNegativeNumberString(t),

      cylinder: createOptionalNonNegativeNumberArray(t),
      "cylinder-from": createOptionalNonNegativeNumberString(t),
      "cylinder-to": createOptionalNonNegativeNumberString(t),

      consumption: createOptionalNonNegativeNumberArray(t),
      "consumption-from": createOptionalNonNegativeNumberString(t),
      "consumption-to": createOptionalNonNegativeNumberString(t),

      emissions: createOptionalNonNegativeNumberArray(t),
      "emissions-from": createOptionalNonNegativeNumberString(t),
      "emissions-to": createOptionalNonNegativeNumberString(t),

      daysListed: optionalStr,
    })
    .catchall(z.any());

export type AdvancedSearchFormValues = z.infer<
  ReturnType<typeof createAdvancedSearchFormSchema>
>;
