"use client";

import { ListingListCard } from "@/app/(root)/cars/_components/listing-list-card";
import { Button } from "@repo/ui/src/components/button";
import { Badge } from "@repo/ui/src/components/badge";
import GarageFilters from "../../_components/garage-rich-filters";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/components/tabs";
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
  Star,
  Globe,
  Calendar,
  BadgeCheck,
  Send,
  PlusCircle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Field, FieldGroup } from "@repo/ui/src/components/field";
import type { DealerDetail } from "@/types";
import { dealerContactSchema } from "@/schema/dealer-contact-schema";

interface DealerDetailContentProps {
  dealer: DealerDetail;
}

export const DealerDetailContent = ({ dealer }: DealerDetailContentProps) => {
  const form = useForm<DealerContactFormValues>({
    resolver: zodResolver(dealerContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: DealerContactFormValues) {
    console.log(values);
  }

  return (
    <div className="pb-12">
      <div className="bg-white">
        <div className="h-40 md:h-56 lg:h-64 w-full relative">
          <Image
            src={dealer.coverImage}
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
                  <AvatarImage
                    src={dealer.logo || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {dealer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl md:text-2xl font-bold">
                        {dealer.name}
                      </h1>
                      {dealer.isVerified && (
                        <BadgeCheck className="text-primary" size={20} />
                      )}
                    </div>
                    <Badge className="bg-rating/10">
                      <div className="flex text-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${i < Math.round(dealer.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">
                        {dealer.rating}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({dealer.reviewCount} Bewertungen)
                      </span>
                    </Badge>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {dealer.address}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Gegr. {dealer.established}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button className="flex-1">
                  <Phone />
                  Telefon
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail />
                  E-Mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-285 mx-auto px-4 pt-6">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="about">Über uns</TabsTrigger>
            <TabsTrigger value="cars">
              Unsere Fahrzeuge&nbsp;
              <Badge variant="secondary">{dealer.vehicles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ratings">Bewertungen</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-12 mb-0">
            <Card>
              <CardHeader className="border-b gap-0">
                <CardTitle>Über {dealer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {dealer.about}
                </p>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-xl font-bold mb-6">Neue Angebote</h2>
              <div className="flex flex-col gap-6">
                {dealer.vehicles.slice(0, 3).map((item) => (
                  <ListingListCard
                    key={item.id}
                    item={item}
                    showDealerLink={false}
                  />
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold mb-6">Bewertungen</h2>
              <Card>
                <CardContent className="flex items-center gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold">{dealer.rating}</div>
                    <div className="flex text-rating justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < Math.round(dealer.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ({dealer.reviewCount}) Bewertungen
                    </div>
                  </div>
                  <Separator className="h-12!" orientation="vertical" />
                  <div className="flex-1 space-y-2 w-full">
                    <p className="font-medium">
                      94% der Kunden empfehlen dieses Autohaus
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h2 className="text-xl font-bold mb-6">Öffnungszeiten</h2>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    {dealer.openingHours.map((item, i) => (
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
                  <CardTitle>Kontaktinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Link
                      href={`tel:${dealer.phoneNumber}`}
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <Phone className="size-4 text-muted-foreground" />
                      {dealer.phoneNumber}
                    </Link>

                    <Link
                      href={`mailto:${dealer.email}`}
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <Mail className="size-4 text-muted-foreground" />
                      {dealer.email}
                    </Link>

                    <Link
                      href={`https://maps.google.com/?q=${dealer.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <MapPin className="size-4 text-muted-foreground" />
                      {dealer.address}
                    </Link>

                    {dealer.website && (
                      <Link
                        href={dealer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        <Globe className="size-4 text-muted-foreground" />
                        {dealer.website}
                      </Link>
                    )}
                  </div>

                  <Separator />

                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                      <h3 className="font-semibold text-lg">
                        Nachricht senden
                      </h3>
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="text"
                        name="name"
                        label="Name"
                        placeholder="Max Mustermann"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="tel"
                        name="phone"
                        label="Telefon"
                        placeholder="+41 79 123 45 67"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="email"
                        name="email"
                        label="E-Mail"
                        placeholder="m@example.com"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.TEXTAREA}
                        name="message"
                        label="Nachricht"
                        placeholder="Ich interessiere mich für..."
                      />
                      <Field>
                        <Button className="w-full">
                          Nachricht senden
                          <Send />
                        </Button>
                      </Field>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cars" className="space-y-12 mb-0">
            <GarageFilters />

            <div className="space-y-12">
              <div className="flex flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border">
                <p className="font-semibold text-foreground">
                  {dealer.vehicles.length} Ergebnisse
                </p>
                <div className="flex items-center gap-2 w-auto">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Sortieren nach:
                  </span>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Neueste zuerst</SelectItem>
                      <SelectItem value="price_asc">
                        Preis: aufsteigend
                      </SelectItem>
                      <SelectItem value="price_desc">
                        Preis: absteigend
                      </SelectItem>
                      <SelectItem value="kilometer">Kilometerstand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {dealer.vehicles.map((item) => (
                  <ListingListCard
                    key={item.id}
                    item={item}
                    showDealerLink={false}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline">
                  <PlusCircle />
                  Mehr laden
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ratings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
                      Bewertungsübersicht
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-rating">
                        <span className="text-4xl font-bold">
                          {dealer.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center text-rating gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-5 ${i < Math.round(dealer.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                        />
                      ))}
                    </div>

                    <p className="text-muted-foreground text-center text-sm">
                      Basierend auf {dealer.reviewCount} Kundenbewertungen
                    </p>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-3">{star}</span>
                          <Star className="size-3 text-rating fill-rating" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rating"
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
                <h3 className="font-bold text-xl">Kundenbewertungen</h3>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold">Hervorragender Service!</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex text-rating text-xs">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3 ${i < 5 ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Vor 2 Tagen
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 bg-green-50 border-green-200"
                        >
                          Verifizierter Kauf
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam.
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Von Max Mustermann</span>
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
};
