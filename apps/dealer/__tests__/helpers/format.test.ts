import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatNumber,
  formatKilometers,
  formatRegistrationDate,
  formatPower,
  formatPS,
  formatKW,
  formatEnumLabel,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatCount,
  formatCardNumber,
  formatCardExpiry,
} from "@/lib/helpers/format";

describe("formatPrice", () => {
  it("formats price in CHF with Swiss separators", () => {
    const result = formatPrice(1234);
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("CHF");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });

  it("formats large price", () => {
    const result = formatPrice(50000);
    expect(result).toContain("CHF");
    expect(result).toContain("50");
  });
});

describe("formatNumber", () => {
  it("formats positive number with Swiss separators", () => {
    const result = formatNumber(1234567);
    expect(result).toMatch(/1['']234['']567/);
  });

  it("returns '0' for null", () => {
    expect(formatNumber(null)).toBe("0");
  });

  it("returns '0' for undefined", () => {
    expect(formatNumber(undefined)).toBe("0");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats small number without separators", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("formatKilometers", () => {
  it("appends km suffix", () => {
    expect(formatKilometers(50000)).toContain("km");
  });

  it("formats with Swiss thousand separators", () => {
    const result = formatKilometers(150000);
    expect(result).toContain("km");
    expect(result).toMatch(/150['']000/);
  });

  it("formats zero kilometers", () => {
    expect(formatKilometers(0)).toBe("0 km");
  });
});

describe("formatRegistrationDate", () => {
  it("formats month and year with zero-padding", () => {
    expect(formatRegistrationDate(3, 2020)).toBe("03/2020");
  });

  it("formats two-digit month", () => {
    expect(formatRegistrationDate(12, 2023)).toBe("12/2023");
  });

  it("returns N/A when month is null", () => {
    expect(formatRegistrationDate(null, 2020)).toBe("N/A");
  });

  it("returns N/A when year is null", () => {
    expect(formatRegistrationDate(3, null)).toBe("N/A");
  });

  it("returns N/A when both are null", () => {
    expect(formatRegistrationDate(null, null)).toBe("N/A");
  });

  it("returns N/A when month is undefined", () => {
    expect(formatRegistrationDate(undefined, 2020)).toBe("N/A");
  });
});

describe("formatPower", () => {
  it("formats both kW and HP", () => {
    const result = formatPower(100, 136);
    expect(result).toContain("100");
    expect(result).toContain("136");
    expect(result).toContain("kW");
    expect(result).toContain("PS");
  });

  it("formats kW only when hp is null", () => {
    const result = formatPower(100, null);
    expect(result).toContain("100");
    expect(result).toContain("kW");
    expect(result).not.toContain("PS");
  });

  it("formats PS only when kW is null", () => {
    const result = formatPower(null, 136);
    expect(result).toContain("136");
    expect(result).toContain("PS");
    expect(result).not.toContain("kW");
  });

  it("returns N/A when both are null", () => {
    expect(formatPower(null, null)).toBe("N/A");
  });
});

describe("formatPS", () => {
  it("formats horsepower with PS suffix", () => {
    expect(formatPS(136)).toContain("136");
    expect(formatPS(136)).toContain("PS");
  });

  it("returns N/A for null", () => {
    expect(formatPS(null)).toBe("N/A");
  });
});

describe("formatKW", () => {
  it("formats kilowatts with kW suffix", () => {
    expect(formatKW(100)).toContain("100");
    expect(formatKW(100)).toContain("kW");
  });

  it("returns N/A for null", () => {
    expect(formatKW(null)).toBe("N/A");
  });
});

describe("formatEnumLabel", () => {
  it("converts UPPER_SNAKE to title case", () => {
    expect(formatEnumLabel("MHEV_DIESEL")).toBe("Mhev Diesel");
  });

  it("handles single word", () => {
    expect(formatEnumLabel("ELECTRIC")).toBe("Electric");
  });

  it("handles multiple underscores", () => {
    expect(formatEnumLabel("PHEV_PETROL")).toBe("Phev Petrol");
  });

  it("returns N/A for null", () => {
    expect(formatEnumLabel(null)).toBe("N/A");
  });

  it("returns N/A for undefined", () => {
    expect(formatEnumLabel(undefined)).toBe("N/A");
  });

  it("returns N/A for empty string", () => {
    expect(formatEnumLabel("")).toBe("N/A");
  });
});

describe("formatDate", () => {
  it("formats date in Swiss format (DD.MM.YYYY)", () => {
    const result = formatDate(new Date(2026, 4, 4)); // May 4, 2026
    expect(result).toMatch(/04\.05\.2026/);
  });

  it("accepts string date input", () => {
    const result = formatDate("2026-01-15");
    expect(result).toContain("2026");
  });

  it("accepts timestamp input", () => {
    const result = formatDate(0);
    expect(result).toContain("1970");
  });
});

describe("formatCardNumber", () => {
  it("capitalizes brand and masks number", () => {
    expect(formatCardNumber("visa", "4242")).toBe("Visa •••• 4242");
  });

  it("handles mastercard", () => {
    expect(formatCardNumber("mastercard", "1234")).toBe("Mastercard •••• 1234");
  });
});

describe("formatCardExpiry", () => {
  it("formats month and year as MM/YY", () => {
    expect(formatCardExpiry(3, 2028)).toBe("03/28");
  });

  it("pads single-digit month", () => {
    expect(formatCardExpiry(1, 2030)).toBe("01/30");
  });

  it("handles December", () => {
    expect(formatCardExpiry(12, 2025)).toBe("12/25");
  });
});

describe("formatCount", () => {
  it("formats count with thousand separators", () => {
    const result = formatCount(1234);
    expect(result).toMatch(/1['']234/);
  });

  it("formats zero", () => {
    expect(formatCount(0)).toBe("0");
  });

  it("formats large count", () => {
    const result = formatCount(1000000);
    expect(result).toMatch(/1['']000['']000/);
  });
});

describe("formatDateShort", () => {
  it("formats date with abbreviated month name", () => {
    const result = formatDateShort(new Date(2026, 4, 4)); // May 4, 2026
    expect(result).toContain("2026");
    expect(result).toContain("04");
  });

  it("accepts string date input", () => {
    const result = formatDateShort("2026-12-01");
    expect(result).toContain("2026");
  });
});

describe("formatDateTime", () => {
  it("formats with default options (DD.MM.YYYY)", () => {
    const result = formatDateTime(new Date(2026, 0, 15)); // Jan 15, 2026
    expect(result).toMatch(/15\.01\.2026/);
  });

  it("accepts custom format options", () => {
    const result = formatDateTime(new Date(2026, 0, 15), {
      year: "numeric",
      month: "long",
    });
    expect(result).toContain("2026");
  });

  it("accepts string date", () => {
    const result = formatDateTime("2026-06-01");
    expect(result).toContain("2026");
  });

  it("accepts timestamp", () => {
    const result = formatDateTime(0);
    expect(result).toContain("1970");
  });

  it("uses provided locale", () => {
    const de = formatDateTime(new Date(2026, 0, 15), undefined, "de-CH");
    const en = formatDateTime(new Date(2026, 0, 15), undefined, "en-US");
    // Both should contain the year
    expect(de).toContain("2026");
    expect(en).toContain("2026");
  });
});
