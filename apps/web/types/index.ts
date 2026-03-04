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

export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  personalPhone?: string;
  role: "BUYER" | "DEALER_OWNER" | "DEALER_STAFF" | "ADMIN";
}

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
