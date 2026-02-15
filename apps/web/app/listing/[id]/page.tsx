"use client";

import { carDetail } from "../../../lib/mock-data";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import {
  MapPin,
  Phone,
  Mail,
  Share2,
  Heart,
  CheckCircle2,
  Calendar,
  Fuel,
  Gauge,
  Zap,
  Store,
  Disc,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import { EnergyLabel } from "@/components/energy-label";
import { SimilarListings } from "@/components/similar-listings";
import { ListingHeader } from "@/components/listing-header";
import { SellerSection } from "@/components/seller-section";
import { ReviewSection } from "@/components/review-section";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import Link from "next/link";
import { StickyActionBar } from "@/components/sticky-action-bar";

export default function ListingPage() {
  const {
    title,
    price,
    images,
    keyDetails,
    basicData,
    vehicleHistory,
    technicalData,
    energyConsumption,
    equipment,
    colourAndUpholstery,
    description,
    seller,
    similarListings,
  } = carDetail;

  return (
    <div className="max-w-285 mx-auto px-4 py-12 pb-16">
      <ListingHeader
        make="Volkswagen"
        model="T-Roc"
        trim={title.replace("Volkswagen T-Roc ", "")}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="lg:hidden space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {title}
            </h1>
            <div className="text-3xl sm:text-4xl font-bold text-primary">
              € {price.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="px-3 py-1.5 text-xs">VAT deductible</Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs ">
                Negotiable
              </Badge>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-sm border">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video w-full">
                      <Image
                        src={src}
                        alt={`${title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <KeyDetailCard
              icon={<Gauge />}
              label="Mileage"
              value={keyDetails.mileage}
            />
            <KeyDetailCard
              icon={<Disc />}
              label="Transmission"
              value={keyDetails.transmission}
            />
            <KeyDetailCard
              icon={<Calendar />}
              label="First Reg."
              value={keyDetails.firstRegistration}
            />
            <KeyDetailCard
              icon={<Fuel />}
              label="Fuel Type"
              value={keyDetails.fuelType}
            />
            <KeyDetailCard
              icon={<Zap />}
              label="Power"
              value={keyDetails.power}
            />
            <KeyDetailCard
              icon={<Store />}
              label="Seller"
              value={keyDetails.sellerType}
            />
          </div>

          <div className="space-y-6">
            <Section title="Basic Data">
              <DataGrid data={basicData} />
            </Section>

            <Section title="Vehicle History">
              <DataGrid data={vehicleHistory} />
            </Section>

            <Section title="Technical Data">
              <DataGrid data={technicalData} />
            </Section>

            <Section title="Energy Consumption">
              <div className="space-y-6">
                <DataGrid
                  data={Object.fromEntries(
                    Object.entries(energyConsumption).filter(
                      ([key]) => key !== "efficiencyClass",
                    ),
                  )}
                />
                {energyConsumption.efficiencyClass && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-4">
                        Energy Efficiency Class
                      </h3>
                      <EnergyLabel
                        efficiencyClass={energyConsumption.efficiencyClass}
                      />
                    </div>
                  </>
                )}
              </div>
            </Section>

            <Section title="Colour and Upholstery">
              <DataGrid data={colourAndUpholstery} />
            </Section>

            <Section title="Equipment">
              <div className="space-y-6">
                <EquipmentCategory
                  title="Comfort & Convenience"
                  items={equipment.comfort}
                />
                <EquipmentCategory
                  title="Entertainment & Media"
                  items={equipment.entertainment}
                />
                <EquipmentCategory
                  title="Safety & Security"
                  items={equipment.safety}
                />
              </div>
            </Section>

            <Section title="Vehicle Description">
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {description}
              </p>
            </Section>

            <SellerSection seller={seller} />

            <ReviewSection
              rating={seller.rating}
              count={seller.reviewCount}
              reviews={carDetail.reviews}
            />

            <Separator className="my-8" />

            <SimilarListings listings={similarListings} />
          </div>
        </div>

        <div className="space-y-6 sticky top-4 self-start">
          <Card className="hidden lg:block">
            <CardContent className="space-y-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              <h2 className="text-3xl font-bold text-primary">
                € {price.toLocaleString()}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge className="px-3 py-1.5 text-xs">VAT deductible</Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  Negotiable
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{seller.name}</h3>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Verified Dealer
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex text-yellow-400">
                    {"★".repeat(Math.round(seller.rating))}
                  </div>
                  <span className="font-semibold">{seller.rating}</span>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {seller.address}
                  </p>
                </div>

                {seller.phones.slice(0, 1).map((phone, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-muted p-2.5 rounded-lg">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Link
                      href={`tel:${phone}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {phone}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button className="w-full " size="lg">
                  <Mail />
                  Contact
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Phone />
                  Phone
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <StickyActionBar price={price} sellerPhone={seller.phones?.[0] || ""} />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DataGrid({ data }: { data: Record<string, string | number> }) {
  const noBorderKeys = ["doors", "mileage", "cylinders"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
      {Object.entries(data).map(([key, value]) => {
        const shouldHideBorder = noBorderKeys.includes(key.toLowerCase());

        return (
          <div
            key={key}
            className={`flex justify-between items-center py-3.5 ${
              shouldHideBorder ? "border-b sm:border-b-0" : "border-b"
            } last:border-0`}
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="font-medium text-sm text-right">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

function KeyDetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 items-center justify-center">
        <div className="text-primary bg-primary/8 p-2.5 rounded-full">
          {icon}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {label}
        </p>
        <p className="font-bold text-sm md:text-base">{value}</p>
      </CardContent>
    </Card>
  );
}

function EquipmentCategory({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-bold text-base mb-3.5">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-muted-foreground text-sm group"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
