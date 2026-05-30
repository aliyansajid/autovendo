import { Hono } from "hono";
import { prisma } from "@repo/db";

const home = new Hono();

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

// Category → bodyType filter
const CATEGORY_FILTERS: Record<string, string[]> = {
  suv: ["SUV", "Crossover"],
  sedan: ["Sedan", "Saloon"],
  electric: [], // filtered by fuelType
  sports: ["Coupe", "Convertible", "Cabriolet", "Roadster"],
  luxury: ["Limousine"],
  van: ["Van", "Minivan", "Bus"],
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
            mode: "insensitive" as const,
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
    image: v.images[0] ?? null,
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
