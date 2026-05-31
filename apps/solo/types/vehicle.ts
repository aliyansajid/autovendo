export interface PriceRating {
  label: string;
  bars: number;
  sentiment: "red" | "yellow" | "green";
}

export interface VehicleListItem {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number | null;
  kw: number | null;
  hp: number | null;
  fuelType: string | null;
  vehicleCondition: string | null;
  bodyType: string;
  color: string;
  createdAt: Date;
  images: string[];
  equipment: unknown;
  priceRating?: PriceRating;
  seller: {
    id: string;
    user: { name: string };
    city: string;
    zipCode: string;
    phoneNumber: string;
  } | null;
}

export type VehicleDetails = Record<string, unknown>;

export interface VehicleFacets {
  make: Record<string, number>;
  fuelType: Record<string, number>;
  transmissionType: Record<string, number>;
  vehicleCondition: Record<string, number>;
  vehicleType: Record<string, number>;
  bodyType: Record<string, number>;
  color: Record<string, number>;
  interiorColor: Record<string, number>;
  driveType: Record<string, number>;
  energyLabel: Record<string, number>;
  emissionStandard: Record<string, number>;
  metallic: number;
  inspectionPassed: number;
  hasWarranty: number;
  hpMax?: number;
  kwMax?: number;
  priceMax?: number;
  kilometerMax?: number;
  yearMin?: number;
  yearMax?: number;
  consumptionMax?: number;
  co2Max?: number;
  cubicCapacityMax?: number;
  cylindersMax?: number;
  yearHistogram?: { year: number; h: number }[];
  kilometerHistogram?: { value: number; h: number }[];
  priceHistogram?: { value: number; h: number }[];
}

export interface PaginatedVehicles {
  vehicles: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: VehicleFacets;
}

export type FuelType =
  | "petrol"
  | "ethanol-petrol"
  | "diesel"
  | "electric"
  | "cng-petrol"
  | "lpg-petrol"
  | "mhev-diesel"
  | "mhev-petrol"
  | "phev-diesel"
  | "phev-petrol"
  | "hev-diesel"
  | "hev-petrol"
  | "hydrogen";

export type TransmissionType =
  | "automatic"
  | "automatic-stepless"
  | "semi-automatic"
  | "manual";

export type VehicleCondition =
  | "new"
  | "demonstration"
  | "pre-registered"
  | "used"
  | "oldtimer";

export type VehicleType = "car" | "utility" | "truck" | "camper";

export type BodyType =
  | "bus"
  | "cabriolet"
  | "coupe"
  | "small-car"
  | "estate"
  | "minivan"
  | "saloon"
  | "pickup"
  | "suv";

export type Color =
  | "anthracite"
  | "beige"
  | "black"
  | "blue"
  | "bordeaux"
  | "brown"
  | "gold"
  | "gray"
  | "green"
  | "multicoloured"
  | "orange"
  | "pink"
  | "red"
  | "silver"
  | "turquoise"
  | "violet"
  | "white"
  | "yellow"
  | "other";

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "kilometer-asc"
  | "kilometer-desc"
  | "registration-asc"
  | "registration-desc"
  | "created-asc"
  | "created-desc";

export interface ListingProps {
  id: number | string;
  image: string;
  badge?: string;
  title: string;
  price: string;
  details: string[];
  garageName: string;
  garageId: number | string;
  garageLocation: string;
}
