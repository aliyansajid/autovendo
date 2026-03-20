/**
 * Build /cars search params from advanced search form values and vehicle type.
 * Used for submit navigation and for fetching count/facets.
 */
export function buildSearchParams(
  formValues: Record<string, unknown>,
  vehicleType: string,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  // Vehicle type
  if (vehicleType) {
    params.vehicleType = vehicleType;
  }

  // Make (array)
  const make = formValues.make;
  if (Array.isArray(make) && make.length > 0) {
    params.make = make.filter((m): m is string => typeof m === "string");
  }

  // Ranges
  if (formValues["year-from"] != null && formValues["year-from"] !== "") {
    params.registrationFrom = String(formValues["year-from"]);
  }
  if (formValues["year-to"] != null && formValues["year-to"] !== "") {
    params.registrationTo = String(formValues["year-to"]);
  }
  if (formValues["kilometer-from"] != null && formValues["kilometer-from"] !== "") {
    params.kilometerFrom = String(formValues["kilometer-from"]);
  }
  if (formValues["kilometer-to"] != null && formValues["kilometer-to"] !== "") {
    params.kilometerTo = String(formValues["kilometer-to"]);
  }
  if (formValues["price-from"] != null && formValues["price-from"] !== "") {
    params.priceFrom = String(formValues["price-from"]);
  }
  if (formValues["price-to"] != null && formValues["price-to"] !== "") {
    params.priceTo = String(formValues["price-to"]);
  }
  // Power: emit kwFrom/kwTo if powerType=kw, else powerFrom/powerTo (hp)
  const powerType = formValues["powerType"] ?? "ps";
  if (powerType === "kw") {
    if (formValues["power-from"] != null && formValues["power-from"] !== "") {
      params.kwFrom = String(formValues["power-from"]);
    }
    if (formValues["power-to"] != null && formValues["power-to"] !== "") {
      params.kwTo = String(formValues["power-to"]);
    }
  } else {
    if (formValues["power-from"] != null && formValues["power-from"] !== "") {
      params.powerFrom = String(formValues["power-from"]);
    }
    if (formValues["power-to"] != null && formValues["power-to"] !== "") {
      params.powerTo = String(formValues["power-to"]);
    }
  }

  // Condition (condition-new, condition-demonstration, ...)
  const condition: string[] = [];
  for (const key of ["new", "demonstration", "pre-registered", "used", "oldtimer"]) {
    if (formValues[`condition-${key}`] === true) condition.push(key);
  }
  if (condition.length > 0) params.condition = condition;

  // Body type (bodyType-bus, ...)
  const bodyType: string[] = [];
  const bodyKeys = [
    "bus", "cabriolet", "coupe", "small-car", "estate", "minivan", "saloon", "pickup", "suv",
    "box", "platform", "tipper", "van", "flatbed", "other", // utility/truck/camper
  ];
  for (const key of bodyKeys) {
    if (formValues[`bodyType-${key}`] === true) bodyType.push(key);
  }
  if (bodyType.length > 0) params.bodyType = bodyType;

  // Fuel (fuel-petrol, ...)
  const fuel: string[] = [];
  const fuelKeys = [
    "petrol", "ethanol-petrol", "diesel", "electric", "cng-petrol", "lpg-petrol",
    "mhev-diesel", "mhev-petrol", "phev-diesel", "phev-petrol", "hev-diesel", "hev-petrol", "hydrogen",
  ];
  for (const key of fuelKeys) {
    if (formValues[`fuel-${key}`] === true) fuel.push(key);
  }
  if (fuel.length > 0) params.fuel = fuel;

  // Transmission (transmission-automatic, ...)
  const transmission: string[] = [];
  for (const key of ["automatic", "automatic-stepless", "semi-automatic", "manual"]) {
    if (formValues[`transmission-${key}`] === true) transmission.push(key);
  }
  if (transmission.length > 0) params.transmission = transmission;

  // Exterior color (color-black, ...)
  const color: string[] = [];
  const colorKeys = [
    "anthracite", "beige", "black", "blue", "bordeaux", "brown", "gold", "gray", "green",
    "multicoloured", "orange", "pink", "red", "silver", "turquoise", "violet", "white", "yellow", "other",
  ];
  for (const key of colorKeys) {
    if (formValues[`color-${key}`] === true) color.push(key);
  }
  if (color.length > 0) params.color = color;

  // Equipment (equipment-abs, ...)
  const equipment: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("equipment-") && value === true) {
      equipment.push(key.replace("equipment-", ""));
    }
  }
  if (equipment.length > 0) params.equipment = equipment;

  // Metallic
  if (formValues.metallic === true) params.metallic = "true";
  if (formValues.metallic === false) params.metallic = "false";

  // Drive type (drive-all, drive-front, drive-rear)
  const driveType: string[] = [];
  for (const key of ["all", "front", "rear"]) {
    if (formValues[`drive-${key}`] === true) driveType.push(key);
  }
  if (driveType.length > 0) params.driveType = driveType;

  // Cubic capacity (Hubraum)
  if (formValues["capacity-from"] != null && formValues["capacity-from"] !== "") {
    params.cubicCapacityFrom = String(formValues["capacity-from"]);
  }
  if (formValues["capacity-to"] != null && formValues["capacity-to"] !== "") {
    params.cubicCapacityTo = String(formValues["capacity-to"]);
  }

  // Cylinders
  if (formValues["cylinder-from"] != null && formValues["cylinder-from"] !== "") {
    params.cylindersFrom = String(formValues["cylinder-from"]);
  }
  if (formValues["cylinder-to"] != null && formValues["cylinder-to"] !== "") {
    params.cylindersTo = String(formValues["cylinder-to"]);
  }

  // Consumption
  if (formValues["consumption-from"] != null && formValues["consumption-from"] !== "") {
    params.consumptionFrom = String(formValues["consumption-from"]);
  }
  if (formValues["consumption-to"] != null && formValues["consumption-to"] !== "") {
    params.consumptionTo = String(formValues["consumption-to"]);
  }

  // CO2 emissions
  if (formValues["emissions-from"] != null && formValues["emissions-from"] !== "") {
    params.co2From = String(formValues["emissions-from"]);
  }
  if (formValues["emissions-to"] != null && formValues["emissions-to"] !== "") {
    params.co2To = String(formValues["emissions-to"]);
  }

  // Energy efficiency label (energy-a, energy-b, ...)
  const energyLabels: string[] = [];
  for (const key of ["a", "b", "c", "d", "e", "f", "g"]) {
    if (formValues[`energy-${key}`] === true) energyLabels.push(key);
  }
  if (energyLabels.length > 0) params.energyLabels = energyLabels;

  // Emission standard / Euronorm (eu-euro-1, eu-euro-2, ...)
  const emissionStandards: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("eu-") && value === true) {
      emissionStandards.push(key.replace("eu-", ""));
    }
  }
  if (emissionStandards.length > 0) params.emissionStandards = emissionStandards;

  // Inspection passed (MFK)
  if (formValues["condition-mfk"] === true) params.inspectionPassed = "true";

  // Has warranty
  if (formValues["condition-warranty"] === true) params.hasWarranty = "true";

  // Interior color (int-black, ...)
  const interiorColor: string[] = [];
  for (const key of colorKeys) {
    if (formValues[`int-${key}`] === true) interiorColor.push(key);
  }
  if (interiorColor.length > 0) params.interiorColor = interiorColor;

  // Days listed
  const daysListed = formValues["daysListed"];
  if (daysListed && daysListed !== "any") {
    const days = parseInt(String(daysListed).split(" ")[0], 10);
    if (!isNaN(days)) params.daysListed = String(days);
  }

  return params;
}
