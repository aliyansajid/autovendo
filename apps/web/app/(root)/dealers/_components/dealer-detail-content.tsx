"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ListingListCard } from "@/app/(root)/cars/_components/listing-list-card";
import { Button } from "@repo/ui/src/components/button";
import { Badge } from "@repo/ui/src/components/badge";
import GarageFilters from "./garage-rich-filters";
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
  BadgeCheck,
  Send,
  PlusCircle,
  Loader2,
  Clock,
  ExternalLink,
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
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Field, FieldGroup } from "@repo/ui/src/components/field";
import type {
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
  VehicleListItem,
} from "@/types";
import { dealerContactSchema } from "@/schema/dealer-contact-schema";
import {
  sendDealerContactEmail,
  getDealerVehicles,
} from "@/app/actions/dealer.actions";
import { Spinner } from "@repo/ui/src/components/spinner";
import type { VehicleSearchParams } from "@/lib/schemas/vehicle.schema";

interface DealerDetailContentProps {
  dealer: DealerDetail;
  initialVehicles: DealerVehiclesResult;
  googleData: GooglePlaceData | null;
  initialFilters?: Partial<VehicleSearchParams>;
}

export const DealerDetailContent = ({
  dealer,
  initialVehicles,
  googleData,
  initialFilters = {},
}: DealerDetailContentProps) => {
  const [isPending, startTransition] = useTransition();

  const [vehicles, setVehicles] = useState<VehicleListItem[]>(
    initialVehicles.vehicles,
  );
  const [totalCount, setTotalCount] = useState(initialVehicles.totalCount);
  const [hasMore, setHasMore] = useState(initialVehicles.hasMore);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Partial<VehicleSearchParams>>(
    initialFilters,
  );
  const [sortBy, setSortBy] = useState("newest");
  const [isLoadingMore, startLoadMore] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFiltering, startFilterTransition] = useTransition();

  function loadMore() {
    startLoadMore(async () => {
      const next = vehiclePage + 1;
      const result = await getDealerVehicles(
        dealer.id,
        next,
        12,
        currentFilters,
        sortBy,
      );
      setVehicles((prev) => [...prev, ...result.vehicles]);
      setHasMore(result.hasMore);
      setVehiclePage(next);
    });
  }

  const handleFilterChange = useCallback(
    (newFilters: Partial<VehicleSearchParams>) => {
      setCurrentFilters(newFilters);
      startFilterTransition(async () => {
        const result = await getDealerVehicles(
          dealer.id,
          1,
          12,
          newFilters,
          sortBy,
        );
        setVehicles(result.vehicles);
        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
        setVehiclePage(1);
      });
    },
    [dealer.id, sortBy],
  );

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    startFilterTransition(async () => {
      const result = await getDealerVehicles(
        dealer.id,
        1,
        12,
        currentFilters,
        newSort,
      );
      setVehicles(result.vehicles);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setVehiclePage(1);
    });
  };

  const form = useForm<z.infer<typeof dealerContactSchema>>({
    resolver: zodResolver(dealerContactSchema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof dealerContactSchema>) {
    startTransition(async () => {
      try {
        const result = await sendDealerContactEmail(dealer.id, values);

        if (result.success) {
          toast.success(
            "Nachricht gesendet! Der Händler meldet sich bei Ihnen.",
          );
          form.reset();
        } else {
          toast.error(
            result.error ?? "Nachricht konnte nicht gesendet werden.",
          );
        }
      } catch (error) {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      }
    });
  }
  const rating = googleData?.rating ?? null;
  const reviewCount = googleData?.reviewCount ?? null;
  const fullAddress = `${dealer.streetAddress}, ${dealer.zipCode} ${dealer.city}`;
  const hasOpeningHours = dealer.openingHours.length > 0;

  return (
    <div className="pb-12">
      <div className="bg-white">
        {dealer.coverImage && (
          <div className="h-40 md:h-56 lg:h-64 w-full relative">
            <Image
              src={dealer.coverImage}
              alt={`${dealer.companyName} Cover`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        <div
          className={`max-w-285 mx-auto px-4 ${dealer.coverImage ? "relative -mt-16" : "pt-6"}`}
        >
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Avatar className="size-20 md:size-32 shadow-md shrink-0">
                  <AvatarImage
                    src={dealer.logo ?? undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold">
                    {dealer.companyName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-xl md:text-2xl font-bold">
                        {dealer.companyName}
                      </h1>
                      {dealer.isVerified && (
                        <BadgeCheck className="text-primary" />
                      )}
                    </div>

                    {rating !== null && (
                      <Badge className="bg-rating/10 gap-1">
                        <div className="flex text-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < Math.round(rating)
                                  ? "fill-rating text-rating"
                                  : "text-muted-foreground opacity-30 fill-current"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-foreground">
                          {rating.toFixed(1)}
                        </span>
                        {reviewCount !== null && (
                          <span className="text-muted-foreground">
                            ({reviewCount})
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center md:justify-start">
                    <MapPin className="size-4 shrink-0" />
                    <span>{fullAddress}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto shrink-0">
                <Button className="flex-1" asChild>
                  <Link href={`tel:${dealer.phoneNumber}`}>
                    <Phone />
                    Telefon
                  </Link>
                </Button>

                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`mailto:${dealer.email}`}>
                    <Mail />
                    E-Mail
                  </Link>
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
              Fahrzeuge
              <Badge variant="secondary" className="ml-1">
                {totalCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ratings">Bewertungen</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-10 mb-0">
            <Card>
              <CardHeader className="border-b gap-0">
                <CardTitle>Über {dealer.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                {dealer.description ? (
                  <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                    {dealer.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Dieser Händler hat noch keine Beschreibung hinterlegt.
                  </p>
                )}
              </CardContent>
            </Card>

            {vehicles.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-6">Aktuelle Angebote</h2>
                <div className="flex flex-col gap-6">
                  {vehicles.slice(0, 3).map((item) => (
                    <ListingListCard
                      key={item.id}
                      item={item}
                      showDealerLink={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {rating !== null && (
              <>
                <Separator />
                <section>
                  <h2 className="text-xl font-bold mb-6">Bewertungen</h2>
                  <Card>
                    <CardContent className="flex items-center gap-6">
                      <div className="text-center space-y-1 shrink-0">
                        <div className="text-4xl font-bold">
                          {rating.toFixed(1)}
                        </div>
                        <div className="flex text-rating justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${
                                i < Math.round(rating)
                                  ? "fill-rating text-rating"
                                  : "text-muted-foreground opacity-30 fill-current"
                              }`}
                            />
                          ))}
                        </div>
                        {reviewCount !== null && (
                          <p className="text-xs text-muted-foreground">
                            {reviewCount} Bewertungen
                          </p>
                        )}
                      </div>
                      <Separator orientation="vertical" className="h-12!" />
                      <p className="text-sm text-muted-foreground">
                        Google-Bewertungen
                      </p>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">Öffnungszeiten</h2>

                {hasOpeningHours ? (
                  <div className="rounded-xl border overflow-hidden">
                    {dealer.openingHours.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-4 border-b last:border-0 hover:bg-muted/30"
                      >
                        <span className="font-medium text-muted-foreground">
                          {item.day}
                        </span>
                        <span
                          className={`font-semibold ${!item.isOpen ? "text-muted-foreground" : ""}`}
                        >
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-xl border bg-muted/20">
                    <Clock className="size-4 shrink-0" />
                    <span>
                      Keine Öffnungszeiten hinterlegt. Bitte kontaktieren Sie
                      den Händler direkt.
                    </span>
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Kontakt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Link
                      href={`tel:${dealer.phoneNumber}`}
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <Phone className="size-4 text-muted-foreground shrink-0" />
                      {dealer.phoneNumber}
                    </Link>

                    <Link
                      href={`mailto:${dealer.email}`}
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <Mail className="size-4 text-muted-foreground shrink-0" />
                      {dealer.email}
                    </Link>

                    <Link
                      href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <MapPin className="size-4 text-muted-foreground shrink-0" />
                      {fullAddress}
                    </Link>

                    {dealer.website && (
                      <Link
                        href={dealer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        <Globe className="size-4 text-muted-foreground shrink-0" />
                        {dealer.website.replace(/^https?:\/\//, "")}
                      </Link>
                    )}
                  </div>

                  <Separator />

                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                      <h3 className="font-semibold text-base">
                        Nachricht senden
                      </h3>
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="text"
                        name="name"
                        label="Name"
                        placeholder="Max Mustermann"
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="tel"
                        name="phone"
                        label="Telefon"
                        placeholder="+41 79 123 45 67"
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="email"
                        name="email"
                        label="E-Mail"
                        placeholder="m@example.com"
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.TEXTAREA}
                        name="message"
                        label="Nachricht"
                        placeholder="Ich interessiere mich für..."
                        disabled={isPending}
                      />
                      <Field>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner />
                              <span>Wird gesendet</span>
                            </>
                          ) : (
                            <>
                              <Send />
                              <span>Nachricht senden</span>
                            </>
                          )}
                        </Button>
                      </Field>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cars" className="space-y-8 mb-0">
            <GarageFilters
              onFilterChange={handleFilterChange}
              dealerId={dealer.id}
            />

            <div className="flex flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border relative">
              {isFiltering && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              )}
              <p className="font-semibold">
                {totalCount} Fahrzeuge
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Sortieren nach:
                </span>
                <Select value={sortBy} onValueChange={handleSortChange}>
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

            {vehicles.length === 0 ? (
              <div className="py-20 text-center bg-secondary/30 rounded-xl border">
                <p className="text-muted-foreground text-sm">
                  Dieser Händler hat noch keine Fahrzeuge inseriert.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {vehicles.map((item) => (
                  <ListingListCard
                    key={item.id}
                    item={item}
                    showDealerLink={false}
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? <Spinner /> : <PlusCircle />}
                  Mehr laden
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ratings">
            {googleData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        Bewertungsübersicht
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-32 h-32 flex items-center justify-center rounded-full border-8 border-rating">
                          <span className="text-4xl font-bold">
                            {rating !== null ? rating.toFixed(1) : "–"}
                          </span>
                        </div>
                      </div>

                      {rating !== null && (
                        <div className="flex justify-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-5 ${
                                i < Math.round(rating)
                                  ? "fill-rating text-rating"
                                  : "text-muted-foreground opacity-30 fill-current"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {reviewCount !== null && (
                        <p className="text-muted-foreground text-center text-sm">
                          {reviewCount} Google-Bewertungen
                        </p>
                      )}

                      {googleData.reviews.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = googleData.reviews.filter(
                              (r) => Math.round(r.rating) === star,
                            ).length;
                            const pct =
                              googleData.reviews.length > 0
                                ? Math.round(
                                    (count / googleData.reviews.length) * 100,
                                  )
                                : 0;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="w-3 text-right">{star}</span>
                                <Star className="size-3 text-rating fill-rating shrink-0" />
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-rating rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-bold text-xl">Kundenbewertungen</h3>

                  {googleData.reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Noch keine Bewertungen vorhanden.
                    </p>
                  ) : (
                    <>
                      {googleData.reviews.slice(0, 12).map((review, i) => (
                        <Card key={i}>
                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="size-9 shrink-0">
                                {review.profilePhotoUrl && (
                                  <AvatarImage src={review.profilePhotoUrl} />
                                )}
                                <AvatarFallback>
                                  {review.authorName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                <p className="font-semibold text-sm">
                                  {review.authorName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                      <Star
                                        key={j}
                                        className={`size-3 ${
                                          j < review.rating
                                            ? "fill-rating text-rating"
                                            : "text-muted-foreground opacity-30 fill-current"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {review.relativeTimeDescription}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {review.text && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {review.text}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {dealer.googlePlaceId && (
                        <div className="flex justify-center pt-2">
                          <Button variant="outline" asChild>
                            <Link
                              href={`https://search.google.com/local/reviews?placeid=${dealer.googlePlaceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4" />
                              Mehr auf Google
                            </Link>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center bg-secondary/30 rounded-xl border space-y-2">
                <h3 className="text-lg font-semibold">
                  Keine Bewertungen verfügbar
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Dieser Händler hat noch keine Google-Bewertungen verknüpft.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
