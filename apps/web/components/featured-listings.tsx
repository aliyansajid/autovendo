"use client";

import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Separator } from "@repo/ui/src/components/separator";
import { useState } from "react";

// Mock data with generated images
const listings = [
  {
    id: 1,
    title: "Volkswagen T-Roc 1.5 TSI",
    price: "€ 30,490",
    details: ["02/2026", "20 km", "Gasoline"],
    dealer: "Bierschneider",
    location: "DE 94315 Straubing",
    badge: "New",
    image: "/suv_side_view_1770816147177.png", // SUV image
  },
  {
    id: 2,
    title: "Peugeot 5008 N GT HDI 130",
    price: "€ 29,790",
    details: ["12/2023", "47,850 km", "Diesel"],
    dealer: "GROMES",
    location: "DE 85456 Wartenberg",
    badge: "New",
    image: "/hatchback_red_1770816163420.png", // Using hatchback as placeholder for now or rotate
  },
  {
    id: 3,
    title: "Nissan Ariya 87kWh",
    price: "€ 44,890",
    details: ["01/2024", "3,645 km", "Electric"],
    dealer: "Auto Schmid",
    location: "DE 85635 Höhenkirchen",
    badge: "New",
    image: "/sport_car_blue_1770816178212.png", // Using sport car
  },
  {
    id: 4,
    title: "DR Automobiles DR6.0 1.5",
    price: "€ 19,800",
    details: ["11/2022", "82,373 km", "LPG"],
    dealer: "DR Roma",
    location: "IT 00137 Roma",
    badge: "New",
    image: "/sedan_white_v2_1770816230304.png", // Will be replaced by actual generated filename if successful, otherwise I'll need to check the output
  },
  // Repeat similar data to fill 16 slots
  {
    id: 5,
    title: "Audi A4 Avant",
    price: "€ 35,900",
    details: ["05/2023", "15,000 km", "Diesel"],
    dealer: "Audi Zentrum",
    location: "DE 10115 Berlin",
    badge: "Used",
    image: "/suv_side_view_1770816147177.png",
  },
  {
    id: 6,
    title: "BMW 320i",
    price: "€ 42,500",
    details: ["09/2024", "10 km", "Gasoline"],
    dealer: "BMW Niederlassung",
    location: "DE 80331 München",
    badge: "New",
    image: "/sedan_white_v2_1770816230304.png",
  },
  {
    id: 7,
    title: "Mercedes-Benz C 220 d",
    price: "€ 48,900",
    details: ["01/2024", "5,000 km", "Diesel"],
    dealer: "Mercedes-Benz Berlin",
    location: "DE 10117 Berlin",
    badge: "Demonstration",
    image: "/sedan_white_v2_1770816230304.png",
  },
  {
    id: 8,
    title: "Ford Focus ST-Line",
    price: "€ 25,490",
    details: ["03/2023", "25,000 km", "Gasoline"],
    dealer: "Ford Store",
    location: "DE 50667 Köln",
    badge: "Used",
    image: "/hatchback_red_1770816163420.png",
  },
  {
    id: 9,
    title: "Renault Clio",
    price: "€ 18,900",
    details: ["06/2024", "100 km", "Gasoline"],
    dealer: "Renault Retail",
    location: "FR 75001 Paris",
    badge: "New",
    image: "/hatchback_red_1770816163420.png",
  },
  {
    id: 10,
    title: "Opel Astra",
    price: "€ 22,500",
    details: ["11/2023", "12,000 km", "Gasoline"],
    dealer: "Opel Handler",
    location: "DE 60311 Frankfurt",
    badge: "Used",
    image: "/hatchback_red_1770816163420.png",
  },
  {
    id: 11,
    title: "Tesla Model 3",
    price: "€ 41,990",
    details: ["02/2024", "1,000 km", "Electric"],
    dealer: "Tesla Store",
    location: "NL 1012 Amsterdam",
    badge: "New",
    image: "/sport_car_blue_1770816178212.png",
  },
  {
    id: 12,
    title: "Porsche 911 Carrera",
    price: "€ 115,000",
    details: ["07/2022", "8,000 km", "Gasoline"],
    dealer: "Porsche Zentrum",
    location: "DE 70173 Stuttgart",
    badge: "Used",
    image: "/sport_car_blue_1770816178212.png",
  },
  {
    id: 13,
    title: "Volvo XC60",
    price: "€ 55,000",
    details: ["04/2024", "500 km", "Hybrid"],
    dealer: "Volvo Car",
    location: "SE 40531 Gothenburg",
    badge: "New",
    image: "/suv_side_view_1770816147177.png",
  },
  {
    id: 14,
    title: "Land Rover Defender",
    price: "€ 85,000",
    details: ["01/2024", "1,500 km", "Diesel"],
    dealer: "Land Rover UK",
    location: "UK SW1A 1AA London",
    badge: "Demonstration",
    image: "/suv_side_view_1770816147177.png",
  },
  {
    id: 15,
    title: "Fiat 500e",
    price: "€ 28,500",
    details: ["03/2024", "200 km", "Electric"],
    dealer: "Fiat Torino",
    location: "IT 10121 Torino",
    badge: "New",
    image: "/hatchback_red_1770816163420.png",
  },
  {
    id: 16,
    title: "Toyota RAV4",
    price: "€ 38,900",
    details: ["10/2023", "18,000 km", "Hybrid"],
    dealer: "Toyota City",
    location: "JP 100-0001 Tokyo", // Just kidding, let's keep it Europe
    badge: "Used",
    image: "/suv_side_view_1770816147177.png",
  },
];

const FeaturedListings = () => {
  const [visibleCount, setVisibleCount] = useState(4);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, listings.length));
  };

  return (
    <section className="py-12">
      <div className="max-w-[1140px] mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">
          Latest results from your last search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {listings.slice(0, visibleCount).map((item) => (
            <Card key={item.id} className="pt-0">
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-xl"
                />
                <Badge
                  className="absolute top-2 right-2 shadow-sm"
                  variant="secondary"
                >
                  {item.badge}
                </Badge>
              </div>
              <CardContent className="space-y-3">
                <h1 className="text-lg font-bold truncate" title={item.title}>
                  {item.title}
                </h1>
                <h3 className="text-xl font-bold text-primary">{item.price}</h3>
                <Separator />
                <div className="flex items-center text-sm text-gray-600">
                  {item.details.map((detail, i) => (
                    <span key={i} className="flex items-center">
                      {detail}
                      {i < item.details.length - 1 && (
                        <Separator
                          orientation="vertical"
                          className="h-10 mx-2"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-end w-full">
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-semibold truncate"
                      title={item.dealer}
                    >
                      {item.dealer}
                    </span>

                    <span
                      className="text-xs text-gray-500 truncate"
                      title={item.location}
                    >
                      {item.location}
                    </span>
                  </div>
                  <Button variant="outline" size="icon">
                    <Heart className="text-gray-400" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {visibleCount < listings.length && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={handleLoadMore}
              className="px-8 py-6 text-lg font-semibold rounded-full"
            >
              Load More listings
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedListings;
