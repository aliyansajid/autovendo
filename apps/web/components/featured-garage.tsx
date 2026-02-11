import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";

// Mock data using existing placeholder images
const garages = [
  {
    id: 1,
    name: "Elite Motors Zurich",
    location: "Zurich, Switzerland",
    image: "/suv_side_view_1770816147177.png",
  },
  {
    id: 2,
    name: "Alpine Auto Group",
    location: "Geneva, Switzerland",
    image: "/sport_car_blue_1770816178212.png",
  },
  {
    id: 3,
    name: "Prestige Cars Bern",
    location: "Bern, Switzerland",
    image: "/sedan_white_v2_1770816230304.png",
  },
  {
    id: 4,
    name: "Lakeside Classics",
    location: "Lucerne, Switzerland",
    image: "/hatchback_red_1770816163420.png",
  },
];

const FeaturedGarage = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-285 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-black">Featured Garages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {garages.map((garage) => (
            <Card
              key={garage.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 p-0"
            >
              <div className="flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto">
                  <Image
                    src={garage.image}
                    alt={garage.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-black hover:bg-white/75 border-none shadow-sm">
                    Featured
                  </Badge>
                </div>
                <CardContent className="flex flex-col justify-center p-6 w-full sm:w-3/5">
                  <h3 className="text-xl font-bold mb-2">{garage.name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{garage.location}</span>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary hover:no-underline font-medium text-sm self-start flex items-center gap-1"
                  >
                    View Inventory <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGarage;
