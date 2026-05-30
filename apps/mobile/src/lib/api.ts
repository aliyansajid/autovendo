const BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL ?? 'http://localhost:4000';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  price: number;
  mileage: number;
  fuel: string | null;
  year: number;
  image: string | null;
  city: string | null;
  createdAt: string;
};

export type HomeData = {
  stats: { totalCars: number; totalDealers: number; newToday: number };
  featured: Vehicle[];
  newArrivals: Vehicle[];
};

export async function fetchHome(category = 'all'): Promise<HomeData> {
  const res = await fetch(`${BASE_URL}/api/home?category=${category}`);
  if (!res.ok) throw new Error('request_failed');
  return res.json();
}
