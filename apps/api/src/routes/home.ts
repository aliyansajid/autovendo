import { Hono } from "hono";
import { prisma } from "@repo/db";

const home = new Hono();

const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN ?? "";

function getImageUrl(key: string | undefined | null): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return R2_DOMAIN ? `${R2_DOMAIN}/${cleanKey}` : null;
}

// Fuel type display labels
const FUEL_LABELS: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  ELECTRIC: "Electric",
  MHEV_PETROL: "Mild Hybrid",
  MHEV_DIESEL: "Mild Hybrid",
  PHEV_PETROL: "Plug-in Hybrid",
  PHEV_DIESEL: "Plug-in Hybrid",
  HEV_PETROL: "Hybrid",
  HEV_DIESEL: "Hybrid",
  ETHANOL_PETROL: "Ethanol",
  CNG_PETROL: "CNG",
  LPG_PETROL: "LPG",
  HYDROGEN: "Hydrogen",
};

// Category → bodyType filter (values must match DB enum exactly)
const CATEGORY_FILTERS: Record<string, string[]> = {
  suv: ["SUV"],
  sedan: ["SALOON"],
  electric: [], // filtered by fuelType
  sports: ["COUPE", "CABRIOLET"],
  luxury: ["SALOON"],
  van: ["MINIVAN", "BUS"],
};

home.get("/", async (c) => {
  const category = c.req.query("category") ?? "all";

  // Build vehicle WHERE clause
  const baseWhere = {
    status: "PUBLISHED" as const,
    ...(category !== "all" && category !== "electric"
      ? {
          bodyType: {
            in: CATEGORY_FILTERS[category] ?? [],
          },
        }
      : {}),
    ...(category === "electric" ? { fuelType: "ELECTRIC" as const } : {}),
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalCars, totalDealers, newToday, featured, newArrivals] =
    await Promise.all([
      prisma.vehicle.count({ where: baseWhere }),
      prisma.dealer.count(),
      prisma.vehicle.count({
        where: { status: "PUBLISHED", createdAt: { gte: todayStart } },
      }),
      prisma.vehicle.findMany({
        where: { ...baseWhere, images: { isEmpty: false } },
        orderBy: { price: "desc" },
        take: 8,
        select: {
          id: true,
          make: true,
          model: true,
          price: true,
          kilometer: true,
          fuelType: true,
          registrationYear: true,
          images: true,
          createdAt: true,
          dealer: { select: { city: true } },
          seller: { select: { city: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          make: true,
          model: true,
          price: true,
          kilometer: true,
          fuelType: true,
          registrationYear: true,
          images: true,
          createdAt: true,
          dealer: { select: { city: true } },
          seller: { select: { city: true } },
        },
      }),
    ]);

  const mapVehicle = (v: (typeof featured)[number]) => ({
    id: v.id,
    make: v.make,
    model: v.model ?? "",
    price: v.price,
    mileage: v.kilometer,
    fuel: v.fuelType ? (FUEL_LABELS[v.fuelType] ?? v.fuelType) : null,
    year: v.registrationYear,
    image: getImageUrl(v.images[0]),
    city: v.dealer?.city ?? v.seller?.city ?? null,
    createdAt: v.createdAt.toISOString(),
  });

  return c.json({
    stats: { totalCars, totalDealers, newToday },
    featured: featured.map(mapVehicle),
    newArrivals: newArrivals.map(mapVehicle),
  });
});

export default home;
