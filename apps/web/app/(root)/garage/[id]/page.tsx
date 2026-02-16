"use client";

import { garagePageData } from "@/lib/mock-data";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@repo/ui/src/components/button";
import { Badge } from "@repo/ui/src/components/badge";
import GarageFilters from "@/components/garage/garage-rich-filters";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/components/tabs";
import { Input } from "@repo/ui/src/components/input";
import { Textarea } from "@repo/ui/src/components/textarea";
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
  CheckCircle2,
  Star,
  Globe,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/src/components/avatar";
import Link from "next/link";
import { Form } from "@repo/ui/src/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";

const formSchema = z.object({});

export default function GaragePage() {
  const { garage, listings } = garagePageData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle login logic here
  }

  return (
    <div className="pb-16">
      <div className="bg-white">
        <div className="h-40 md:h-64 lg:h-80 w-full relative">
          <Image
            src={garage.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="max-w-285 mx-auto px-4 relative -mt-16">
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Avatar className="size-20 md:size-32 shadow-md">
                  <AvatarImage src={garage.logo} />
                  <AvatarFallback>{garage.name}</AvatarFallback>
                </Avatar>

                <div className="space-y-2 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl md:text-3xl font-bold">
                        {garage.name}
                      </h1>
                      {garage.isVerified && (
                        <BadgeCheck className="text-primary" size={20} />
                      )}
                    </div>
                    <Badge className="bg-yellow-50">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.round(garage.rating))}
                      </div>
                      <span className="font-semibold text-foreground">
                        {garage.rating}
                      </span>
                      <span className="text-muted-foreground">
                        ({garage.reviewCount} reviews)
                      </span>
                    </Badge>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {garage.address}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Est. {garage.established}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button className="flex-1">
                  <Phone />
                  Phone
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-285 mx-auto px-4 pt-8">
        <Tabs defaultValue="about" className="space-y-8">
          <TabsList className="w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="cars">
              Our Cars&nbsp;
              <Badge variant="secondary">{listings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-8 mb-0">
            <Card>
              <CardHeader className="border-b gap-0">
                <CardTitle>About {garage.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{garage.about}</p>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-xl font-bold mb-6">New Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Reviews</h2>
                <Button variant="link" className="text-primary">
                  See all reviews
                </Button>
              </div>
              <Card>
                <CardContent className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{garage.rating}</div>
                    <div className="flex text-yellow-400 justify-center my-2">
                      {"★".repeat(Math.round(garage.rating))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ({garage.reviewCount}) reviews
                    </div>
                  </div>
                  <Separator className="h-12!" orientation="vertical" />
                  <div className="flex-1 space-y-2 w-full">
                    <p className="font-medium">
                      94% of customers recommend this garage
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "94%" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-xl font-bold mb-6">Services We Offer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {garage.services.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-4 bg-white rounded-lg border"
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
                        <span className="font-medium text-muted-foreground">
                          {item.day}
                        </span>
                        <span className="font-semibold">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      {garage.phones.map((phone, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <Link
                            href={`tel:${phone}`}
                            className="hover:underline text-primary"
                          >
                            {phone}
                          </Link>
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Link
                          href={`mailto:${garage.email}`}
                          className="hover:underline text-primary"
                        >
                          {garage.email}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{garage.address}</span>
                      </div>
                      {garage.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <Link
                            href={`https://${garage.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary"
                          >
                            {garage.website}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <h3 className="font-semibold">Send a message</h3>
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        name="name"
                        label="Name"
                        placeholder="John Doe"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        name="phone"
                        label="Phone"
                        placeholder="+1 (555) 123-4567"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        name="email"
                        label="Email"
                        placeholder="m@example.com"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.TEXTAREA}
                        name="message"
                        label="Message"
                        placeholder="I'm interested in..."
                      />
                      <Button className="w-full">Send Message</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cars" className="space-y-8 mb-0">
            <GarageFilters />

            <div className="space-y-6">
              <div className="flex flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border">
                <p className="font-semibold text-foreground">
                  {listings.length} Results
                </p>
                <div className="flex items-center gap-2 w-auto">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Sort by:
                  </span>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-0">
                {listings.map((item) => (
                  <div key={item.id}>
                    {/* @ts-ignore */}
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-12">
                <Button variant="outline" size="lg">
                  Load More Vehicles
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
                      Rating Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                    <p className="text-muted-foreground text-center text-sm">
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
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width:
                                  star === 5
                                    ? "70%"
                                    : star === 4
                                      ? "20%"
                                      : "10%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h3 className="font-bold text-xl">Customer Reviews</h3>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold">Excellent Service!</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400 text-xs">
                              {"★".repeat(5)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              2 days ago
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 bg-green-50 border-green-200"
                        >
                          Verified Purchase
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By John Doe</span>
                        <span>•</span>
                        <span>Volkswagen T-Roc</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
