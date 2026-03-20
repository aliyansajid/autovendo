import type { VehicleListItem } from "@/lib/schemas/vehicle.schema";

export type { VehicleListItem };

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
  vehicles: VehicleListItem[];
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

// =============================================================================
// LEGACY — kept for components not yet migrated
// =============================================================================

export interface Garage {
  id: string | number;
  name: string;
  slug?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  phones?: string[];
  email?: string;
  website?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  about?: string;
  services?: string[];
  openingHours?: { day: string; hours: string }[];
}

export interface Listing {
  id: string | number;
  title: string;
  price: string;
  details: string[];
  badge?: string;
  image: string;
  garageId: string | number;
  garage?: Pick<Garage, "id" | "name" | "address" | "rating" | "reviewCount">;
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
