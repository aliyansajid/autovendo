/**
 * Build /cars search params from advanced search form values and vehicle type.
 * Used for submit navigation and for fetching count/facets.
 *
 * IMPORTANT: Form field names use the raw UPPERCASE enum value (e.g. color-BLUE,
 * fuel-PETROL, condition-NEW). Keys here must match exactly.
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

  // Exclude make (array)
  const excludeMake = formValues.excludeMake;
  if (Array.isArray(excludeMake) && excludeMake.length > 0) {
    params.excludeMake = excludeMake.filter(
      (m): m is string => typeof m === "string",
    );
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

  // Condition — form fields: condition-NEW, condition-USED, etc.
  const condition: string[] = [];
  for (const key of ["NEW", "DEMONSTRATION", "PRE_REGISTERED", "USED", "OLDTIMER"]) {
    if (formValues[`condition-${key}`] === true) condition.push(key);
  }
  if (condition.length > 0) params.condition = condition;

  // Body type — form fields: bodyType-SUV, bodyType-SMALL_CAR, etc.
  const bodyType: string[] = [];
  const bodyKeys = [
    // Car
    "BUS", "CABRIOLET", "COUPE", "SMALL_CAR", "ESTATE", "MINIVAN", "SALOON", "PICKUP", "SUV",
    // Utility
    "BRIDGE", "BRIDGE_DOUBLE_CAB", "CHASSIS_CAB", "BOX", "BOX_GLAZED", "BOX_DOUBLE_CAB",
    "TIPPER", "PLATFORM", "SEMI_TRAILER",
    // Truck
    "CAB_OVER", "COACH",
    // Camper
    "ALCOVE", "TRAILER", "INTEGRATED", "CAB", "OTHER", "SEMI_INTEGRATED", "MOTORHOME", "CARAVAN",
  ];
  for (const key of bodyKeys) {
    if (formValues[`bodyType-${key}`] === true) bodyType.push(key);
  }
  if (bodyType.length > 0) params.bodyType = bodyType;

  // Fuel — form fields: fuel-PETROL, fuel-CNG_PETROL, etc.
  const fuel: string[] = [];
  const fuelKeys = [
    "PETROL", "ETHANOL_PETROL", "DIESEL", "ELECTRIC", "CNG_PETROL", "LPG_PETROL",
    "MHEV_DIESEL", "MHEV_PETROL", "PHEV_DIESEL", "PHEV_PETROL", "HEV_DIESEL", "HEV_PETROL", "HYDROGEN",
  ];
  for (const key of fuelKeys) {
    if (formValues[`fuel-${key}`] === true) fuel.push(key);
  }
  if (fuel.length > 0) params.fuel = fuel;

  // Transmission — form fields: transmission-AUTOMATIC, transmission-SEMI_AUTOMATIC, etc.
  const transmission: string[] = [];
  for (const key of ["AUTOMATIC", "AUTOMATIC_STEPLESS", "SEMI_AUTOMATIC", "MANUAL"]) {
    if (formValues[`transmission-${key}`] === true) transmission.push(key);
  }
  if (transmission.length > 0) params.transmission = transmission;

  // Exterior color — form fields: color-BLUE, color-BLACK, etc.
  const color: string[] = [];
  const colorKeys = [
    "ANTHRACITE", "BEIGE", "BLACK", "BLUE", "BORDEAUX", "BROWN", "GOLD", "GRAY", "GREEN",
    "MULTICOLOURED", "ORANGE", "PINK", "RED", "SILVER", "TURQUOISE", "VIOLET", "WHITE", "YELLOW", "OTHER",
  ];
  for (const key of colorKeys) {
    if (formValues[`color-${key}`] === true) color.push(key);
  }
  if (color.length > 0) params.color = color;

  // Equipment — form fields: equipment-<VALUE> (dynamic, scanned via Object.entries)
  const equipment: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("equipment-") && value === true) {
      equipment.push(key.replace("equipment-", ""));
    }
  }
  if (equipment.length > 0) params.equipment = equipment;

  // Extras — form fields: extra-<VALUE> (dynamic, scanned via Object.entries)
  const extras: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("extra-") && value === true) {
      extras.push(key.replace("extra-", ""));
    }
  }
  if (extras.length > 0) params.extras = extras;

  // Metallic
  if (formValues.metallic === true) params.metallic = "true";
  if (formValues.metallic === false) params.metallic = "false";

  // Drive type — form fields: drive-ALL, drive-FRONT, drive-REAR
  const driveType: string[] = [];
  for (const key of ["ALL", "FRONT", "REAR"]) {
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

  // Energy efficiency label — form fields: energy-A, energy-B, etc.
  const energyLabels: string[] = [];
  for (const key of ["A", "B", "C", "D", "E", "F", "G"]) {
    if (formValues[`energy-${key}`] === true) energyLabels.push(key);
  }
  if (energyLabels.length > 0) params.energyLabels = energyLabels;

  // Emission standard / Euronorm — form fields: eu-EURO_1, eu-EURO_2, etc. (dynamic)
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

  // Interior color — form fields: int-BLUE, int-BLACK, etc.
  const interiorColor: string[] = [];
  for (const key of colorKeys) {
    if (formValues[`int-${key}`] === true) interiorColor.push(key);
  }
  if (interiorColor.length > 0) params.interiorColor = interiorColor;

  // Days listed
  const daysListed = formValues["daysListed"];
  if (typeof daysListed === "string" && daysListed !== "any") {
    const days = parseInt(daysListed.split(" ")[0] ?? "", 10);
    if (!isNaN(days)) params.daysListed = String(days);
  }

  return params;
}
