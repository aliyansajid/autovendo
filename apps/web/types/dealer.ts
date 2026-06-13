import { VehicleListItem } from "./vehicle";

export interface DealerListItem {
  id: string;
  companyName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  logo: string | null;
  coverImage: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
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
  hours: string | null;
}

export interface DealerDetail {
  id: string;
  companyName: string;
  businessEmail: string;
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
  googleRating: number | null;
  googleReviewCount: number | null;
}

export interface DealerVehiclesResult {
  vehicles: VehicleListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

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
