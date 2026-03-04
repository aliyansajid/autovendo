"use client";

import { carDetail } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { ImageGallery } from "../_components/image-gallery";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Fuel,
  Gauge,
  Zap,
  Store,
  Disc,
  BadgeCheck,
  Star,
} from "lucide-react";
import { SimilarListings } from "../_components/similar-listings";
import { ListingHeader } from "../_components/listing-header";
import { SellerSection } from "../_components/seller-section";
import { ReviewSection } from "../_components/review-section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import Link from "next/link";
import { StickyActionBar } from "../_components/sticky-action-bar";
import { EnergyLabel } from "../_components/energy-label";

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
    <div className="max-w-285 mx-auto px-4 py-12">
      <ListingHeader
        make="Volkswagen"
        model="T-Roc"
        trim={title.replace("Volkswagen T-Roc ", "")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="lg:hidden space-y-3">
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            <div className="text-3xl font-bold text-primary">
              CHF {price.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>VAT deductible</Badge>
              <Badge variant="secondary">Negotiable</Badge>
            </div>
          </div>

          <ImageGallery images={images} title={title} />

          <Card>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <KeyDetailCard
                icon={
                  <Gauge
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="Mileage"
                value={keyDetails.mileage}
              />
              <KeyDetailCard
                icon={
                  <Zap
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="Power"
                value={keyDetails.power}
              />
              <KeyDetailCard
                icon={
                  <Fuel
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="Fuel Type"
                value={keyDetails.fuelType}
              />
              <KeyDetailCard
                icon={
                  <Disc
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="Transmission"
                value={keyDetails.transmission}
              />
              <KeyDetailCard
                icon={
                  <Calendar
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="First Reg."
                value={keyDetails.firstRegistration}
              />
              <KeyDetailCard
                icon={
                  <Store
                    className="text-muted-foreground w-6 h-6"
                    strokeWidth={1.5}
                  />
                }
                label="Seller"
                value={keyDetails.sellerType}
              />
            </CardContent>
          </Card>

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
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-4">
                      Energy Efficiency Class
                    </h3>
                    <EnergyLabel
                      efficiencyClass={energyConsumption.efficiencyClass}
                    />
                  </div>
                </>
              )}
            </Section>

            <Section title="Colour and Upholstery">
              <DataGrid data={colourAndUpholstery} />
            </Section>

            <Section title="Equipment">
              <EquipmentCategory items={equipment.comfort} />
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
              dealerId={seller.id}
            />

            <Separator className="my-12" />

            <SimilarListings listings={similarListings} />
          </div>
        </div>

        <div className="space-y-6 sticky top-20 self-start">
          <Card className="hidden lg:block">
            <CardContent className="space-y-3">
              <h1 className="text-xl font-bold">{title}</h1>
              <h2 className="text-2xl font-bold text-primary">
                CHF {price.toLocaleString()}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge>VAT deductible</Badge>
                <Badge variant="secondary">Negotiable</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{seller.name}</h3>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Verified Dealer
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex text-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.round(seller.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                      />
                    ))}
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
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {seller.address}
                  </p>
                </div>

                {seller.phones.slice(0, 1).map((phone, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-muted p-2.5 rounded-lg">
                      <Phone className="size-4 text-muted-foreground" />
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
                <Button className="w-full">
                  <Phone />
                  Phone
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail />
                  Contact
                </Button>
                <Link
                  href={`/dealers/${seller.id}`}
                  className="block text-center text-sm text-primary font-medium hover:underline pt-2"
                >
                  All vehicles from this dealer
                </Link>
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
    <div className="flex items-center gap-4">
      <div className="shrink-0 flex items-center justify-center">{icon}</div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">
          {label}
        </p>
        <p className="font-bold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function EquipmentCategory({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <CheckCircle2 className="size-4 text-green-500" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
