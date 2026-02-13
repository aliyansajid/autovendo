"use client";

import { garagePageData } from "../../../lib/mock-data";
import { ListingCard } from "../../../components/listing-card";
import { Button } from "@repo/ui/src/components/button";
import { Badge } from "@repo/ui/src/components/badge";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/components/tabs";
import { Input } from "@repo/ui/src/components/input";
import { Textarea } from "@repo/ui/src/components/textarea";
import { Label } from "@repo/ui/src/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Star,
  Globe,
  Calendar,
  Users,
} from "lucide-react";
import Image from "next/image";
import { makes, prices, getRegistrationYears } from "@/data";

export default function GaragePage() {
  const { garage, listings } = garagePageData;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 md:pb-16">
      <div className="bg-white">
        <div className="h-40 md:h-64 lg:h-80 w-full relative bg-gray-200">
          <Image
            src={garage.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="max-w-[1140px] mx-auto px-4 relative -mt-16 pb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
              {garage.logo ? (
                <Image
                  src={garage.logo}
                  alt={garage.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Users className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start space-y-2 w-full">
              <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {garage.name}
                  {garage.isVerified && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50" />
                  )}
                </h1>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 w-fit">
                  <div className="flex text-yellow-400 text-sm">
                    {"★".repeat(Math.round(garage.rating))}
                    {"☆".repeat(5 - Math.round(garage.rating))}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    {garage.rating}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({garage.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {garage.address}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Est. {garage.established}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button className="flex-1" size="lg">
                <Phone />
                Show Phone Number
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                <Mail />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 py-8">
        <Tabs defaultValue="about" className="space-y-8">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-4 md:gap-8 overflow-x-auto flex-nowrap scrollbar-hide">
            <TabsTrigger
              value="about"
              className="px-4 py-3 text-base font-medium"
            >
              About Us
            </TabsTrigger>
            <TabsTrigger
              value="cars"
              className="px-4 py-3 text-base font-medium"
            >
              Our Cars&nbsp;
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {listings.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="px-4 py-3 text-base font-medium"
            >
              Ratings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-12">
            <section className="bg-white p-4 md:p-8 rounded-xl border">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                About {garage.name}
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {garage.about}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {garage.languages.map((lang, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">
                    {lang} spoken
                  </Badge>
                ))}
              </div>
            </section>

            {/* New Offers */}
            <section>
              <h2 className="text-xl font-bold mb-6">New Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    {/* @ts-ignore */}
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Reviews Summary */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Reviews</h2>
                <Button variant="link" className="text-primary">
                  See all reviews
                </Button>
              </div>
              <div className="bg-white p-6 rounded-xl border flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {garage.rating}
                  </div>
                  <div className="flex text-yellow-400 justify-center my-2">
                    {"★".repeat(Math.round(garage.rating))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {garage.reviewCount} reviews
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-200 hidden md:block" />
                <div className="flex-1 space-y-2 w-full">
                  <p className="font-medium">
                    94% of customers recommend this garage
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "94%" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left: What we offer & Opening Hours */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h2 className="text-xl font-bold mb-6">Services We Offer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {garage.services.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-6">Opening Hours</h2>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    {garage.openingHours.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-4 border-b last:border-0 hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-700">
                          {item.day}
                        </span>
                        <span className="font-semibold">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right: Contact Form */}
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold mb-6">Contact</h2>
                  <div className="bg-white p-6 rounded-xl border space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Contact Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        {garage.phones.map((phone, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a
                              href={`tel:${phone}`}
                              className="hover:underline text-blue-600"
                            >
                              {phone}
                            </a>
                          </div>
                        ))}
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a
                            href={`mailto:${garage.email}`}
                            className="hover:underline text-blue-600"
                          >
                            {garage.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{garage.address}</span>
                        </div>
                        {garage.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a
                              href={`https://${garage.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-600"
                            >
                              {garage.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <form className="space-y-4">
                      <h3 className="font-semibold">Send a message</h3>
                      <div className="space-y-2">
                        <Input placeholder="Your Name" />
                      </div>
                      <div className="space-y-2">
                        <Input placeholder="Phone Number" />
                      </div>
                      <div className="space-y-2">
                        <Input placeholder="Email Address" />
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="I'm interested in..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button className="w-full">Send Message</Button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Our Cars Tab Content */}
          <TabsContent value="cars" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl border space-y-6 md:sticky md:top-24">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-red-500 hover:text-red-600 hover:bg-transparent"
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Make</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Makes" />
                        </SelectTrigger>
                        <SelectContent>
                          {makes.map((m) =>
                            m.items.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select disabled>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Models" />
                        </SelectTrigger>
                        <SelectContent></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price From</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="€ 0" />
                        </SelectTrigger>
                        <SelectContent>
                          {prices.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year From</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {getRegistrationYears().map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                              {y.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </div>

              {/* Listing Grid */}
              <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border">
                  <p className="font-semibold text-gray-700">
                    {listings.length} Results
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      Sort by:
                    </span>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price_desc">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="mileage">Mileage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <div key={item.id}>
                      {/* @ts-ignore */}
                      <ListingCard item={item} />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-8">
                  <Button variant="outline" size="lg">
                    Load More Vehicles
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ratings Tab Content */}
          <TabsContent value="ratings" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Overview */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-xl border text-center space-y-6 md:sticky md:top-24">
                  <h3 className="font-bold text-lg">Rating Overview</h3>
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-yellow-400">
                      <span className="text-4xl font-bold">
                        {garage.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center text-yellow-400 gap-1">
                    {"★".repeat(Math.round(garage.rating))}
                  </div>
                  <p className="text-gray-500">
                    Based on {garage.reviewCount} customer reviews
                  </p>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-3">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width:
                                star === 5 ? "70%" : star === 4 ? "20%" : "10%",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-6">
                <h3 className="font-bold text-xl">Customer Reviews</h3>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-xl border space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">Excellent Service!</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-yellow-400 text-xs">
                            {"★".repeat(5)}
                          </div>
                          <span className="text-xs text-gray-500">
                            2 days ago
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-600 bg-green-50"
                      >
                        Verified Purchase
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>By John Doe</span>
                      <span>•</span>
                      <span>Volkswagen T-Roc</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
