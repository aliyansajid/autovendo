import type { VehicleListItem as _VehicleListItem } from "@/lib/schemas/vehicle.schema";

export type {
  VehicleListItem,
  VehicleDetails,
  PaginatedVehicles,
  VehicleFacets,
  VehicleSearchParams,
  PriceRating,
  SortOption,
  FuelType,
  TransmissionType,
  VehicleCondition,
  VehicleType,
  BodyType,
  Color,
} from "@/lib/schemas/vehicle.schema";

export {
  VehicleSearchSchema,
  SORT_OPTIONS,
} from "@/lib/schemas/vehicle.schema";

// =============================================================================
// DEALER LIST
// =============================================================================

export interface DealerListItem {
  id: string;
  companyName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  logo: string | null;
}

export interface DealerListResult {
  dealers: DealerListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// =============================================================================
// DEALER DETAIL
// =============================================================================

export interface DealerOpeningHour {
  day: string;
  isOpen: boolean;
  hours: string;
}

export interface DealerDetail {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  description: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  streetAddress: string;
  city: string;
  zipCode: string;
  country: string;
  
  openingHours: DealerOpeningHour[];
  googlePlaceId: string | null;
}

export interface DealerVehiclesResult {
  vehicles: _VehicleListItem[];
  totalCount: number;
  hasMore: boolean;
}

// =============================================================================
// GOOGLE REVIEWS
// =============================================================================

export interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  profilePhotoUrl: string | null;
}

export interface GooglePlaceData {
  rating: number | null;
  reviewCount: number | null;
  reviews: GoogleReview[];
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
  streetAddress: string;
  zipCode: string;
  city: string;
  country: string;
  uidNumber: string;
  contactPerson: string;
  phoneNumber: string;
  businessEmail: string;
  coverImage: string | null;
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
