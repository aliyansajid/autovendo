// =============================================================================
// GARAGE / DEALER TYPES
// =============================================================================

export interface Garage {
  id: string | number;
  name: string;
  slug?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  mapLocation?: { lat: number; lng: number };
  phones?: string[];
  email?: string;
  website?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  established?: string;
  languages?: string[];
  about?: string;
  services?: string[];
  openingHours?: { day: string; hours: string }[];
  ownerId?: string | number;
}

export interface DealerListItem {
  id: string;
  companyName: string;
  city: string;
  address: string;
  logo: string | null;
}

export interface DealerListResult {
  dealers: DealerListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface DealerOpeningHour {
  day: string;
  isOpen: boolean;
  hours: string;
}

export interface DealerDetail {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  address: string;
  city: string;
  zipCode: string;
  phoneNumber: string | null;
  email: string | null;
  openingHours: DealerOpeningHour[];
  vehicles: VehicleSummary[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  established: string;
  coverImage: string;
  about: string;
  services: string[];
  phones: string[];
}

export type VehicleSummary = import("@/lib/schemas/vehicle.schema").VehicleListItem;

// =============================================================================
// LISTING TYPES
// =============================================================================

export interface Listing {
  id: string | number;
  title: string;
  price: string; // or number depending on backend, string in mock data ("CHF 30,490")
  details: string[];
  badge?: string;
  image: string;
  garageId: string | number;
  garage?: Pick<Garage, "id" | "name" | "address" | "rating" | "reviewCount">;
}

// =============================================================================
// DASHBOARD DEALER PROFILE
// =============================================================================

export interface DealerProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  companyName: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  address: string;
  zipCode: string;
  city: string;
  uidNumber: string;
  contactPerson: string;
  phoneNumber: string;
  businessEmail: string;
  openingHours: {
    day: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }[];
}

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
