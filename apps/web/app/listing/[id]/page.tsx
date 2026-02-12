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
} from "lucide-react";
import Image from "next/image";

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
  } = carDetail;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mobile Header */}
            <div className="lg:hidden space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                € {price.toLocaleString()}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  VAT deductible
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs border-gray-300"
                >
                  Negotiable
                </Badge>
              </div>
            </div>

            {/* Image Carousel */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((src, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full bg-gray-100">
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
                <CarouselPrevious className="left-4 bg-white/90 hover:bg-white shadow-md" />
                <CarouselNext className="right-4 bg-white/90 hover:bg-white shadow-md" />
              </Carousel>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <KeyDetailCard
                icon={<Gauge className="w-5 h-5" />}
                label="Mileage"
                value={keyDetails.mileage}
              />
              <KeyDetailCard
                icon={<Disc className="w-5 h-5" />}
                label="Transmission"
                value={keyDetails.transmission}
              />
              <KeyDetailCard
                icon={<Calendar className="w-5 h-5" />}
                label="First Reg."
                value={keyDetails.firstRegistration}
              />
              <KeyDetailCard
                icon={<Fuel className="w-5 h-5" />}
                label="Fuel Type"
                value={keyDetails.fuelType}
              />
              <KeyDetailCard
                icon={<Zap className="w-5 h-5" />}
                label="Power"
                value={keyDetails.power}
              />
              <KeyDetailCard
                icon={<Store className="w-5 h-5" />}
                label="Seller"
                value={keyDetails.sellerType}
              />
            </div>

            {/* Data Sections */}
            <div className="space-y-5">
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
                <DataGrid data={energyConsumption} />
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
                <p className="whitespace-pre-line text-gray-700 leading-relaxed text-[15px]">
                  {description}
                </p>
              </Section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-5">
              {/* Desktop Price Card */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h1>
                  <div className="text-3xl font-bold text-primary">
                    € {price.toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge className="px-3 py-1.5 text-xs">
                      VAT deductible
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="px-3 py-1.5 text-xs border-gray-300"
                    >
                      Negotiable
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 space-y-5">
                  {/* Seller Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {seller.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Verified Dealer
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.round(seller.rating))}
                      </div>
                      <span className="font-semibold text-gray-900 ml-0.5">
                        {seller.rating}
                      </span>
                      <span className="text-gray-500">
                        ({seller.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Details */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-50 p-2.5 rounded-lg shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">
                        {seller.address}
                      </p>
                    </div>

                    {seller.phones.slice(0, 1).map((phone, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="bg-gray-50 p-2.5 rounded-lg shrink-0">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <a
                          href={`tel:${phone}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                        >
                          {phone}
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full " size="lg">
                      Contact Seller
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <Mail />
                      Send Message
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="flex-1 text-gray-600 hover:text-red-500 hover:bg-red-50"
                    >
                      <Heart />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="flex-1 text-gray-600 hover:text-primary hover:bg-primary/5"
                    >
                      <Share2 />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-b from-gray-50 to-white">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
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
              shouldHideBorder ? "" : "border-b border-gray-100"
            } last:border-0`}
          >
            <span className="text-[13px] text-gray-600 capitalize font-medium">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="font-semibold text-gray-900 text-sm text-right">
              {value}
            </span>
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
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center gap-2.5 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <div className="text-primary bg-primary/8 p-2.5 rounded-full">{icon}</div>
      <div className="space-y-1">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className="font-bold text-gray-900 text-sm md:text-base">
          {value}
        </div>
      </div>
    </div>
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
      <h3 className="font-bold text-base text-gray-900 mb-3.5">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 text-gray-700 text-[14px] group"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
