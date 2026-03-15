import { z } from "zod";

const optionalNonNegativeNumberArray = z
  .array(z.number().nonnegative("Wert darf nicht negativ sein"))
  .optional();

const optionalNonNegativeNumberString = z.preprocess(
  (val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    // If it's a string like "1'000+" we might want to strip non-digits,
    // but for now let's just use standard Number parsing or custom numeric extraction.
    // Actually, the UI has inputs that look like "100+", so let's strip non-digits if it's a string
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.-]/g, "");
      if (cleaned === "") return undefined;
      return Number(cleaned);
    }
    return num;
  },
  z
    .number({ error: "Ungültige Zahl" })
    .nonnegative("Wert darf nicht negativ sein")
    .optional(),
);

const optionalStr = z.string().optional();

export const advancedSearchFormSchema = z
  .object({
    make: z.array(z.string()).optional(),
    year: optionalNonNegativeNumberArray,
    "year-from": optionalNonNegativeNumberString,
    "year-to": optionalNonNegativeNumberString,

    kilometer: optionalNonNegativeNumberArray,
    "kilometer-from": optionalNonNegativeNumberString,
    "kilometer-to": optionalNonNegativeNumberString,

    price: optionalNonNegativeNumberArray,
    "price-from": optionalNonNegativeNumberString,
    "price-to": optionalNonNegativeNumberString,
    priceType: optionalStr,

    power: optionalNonNegativeNumberArray,
    "power-from": optionalNonNegativeNumberString,
    "power-to": optionalNonNegativeNumberString,
    powerType: optionalStr,

    capacity: optionalNonNegativeNumberArray,
    "capacity-from": optionalNonNegativeNumberString,
    "capacity-to": optionalNonNegativeNumberString,

    cylinder: optionalNonNegativeNumberArray,
    "cylinder-from": optionalNonNegativeNumberString,
    "cylinder-to": optionalNonNegativeNumberString,

    consumption: optionalNonNegativeNumberArray,
    "consumption-from": optionalNonNegativeNumberString,
    "consumption-to": optionalNonNegativeNumberString,

    emissions: optionalNonNegativeNumberArray,
    "emissions-from": optionalNonNegativeNumberString,
    "emissions-to": optionalNonNegativeNumberString,

    daysListed: optionalStr,
    conditions: z.array(z.string()).optional(),
  })
  .catchall(z.any());
