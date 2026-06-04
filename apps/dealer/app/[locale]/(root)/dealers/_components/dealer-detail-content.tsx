"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ListingListCard } from "@/app/[locale]/(root)/cars/_components/listing-list-card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import GarageFilters from "./garage-rich-filters";
import { Separator } from "@repo/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Globe,
  BadgeCheck,
  Send,
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
} from "@repo/ui/components/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/avatar";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { Field, FieldGroup } from "@repo/ui/components/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { formatCount } from "@repo/ui/lib/helpers/format";
import type {
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types/dealer";
import type { VehicleFacets } from "@/types/vehicle";
import { createDealerContactSchema } from "@/schema/dealer-contact-schema";
import { sendDealerContactEmailFromApi } from "@/lib/api/dealers";
import { Spinner } from "@repo/ui/components/spinner";
import type { VehicleSearchParams } from "@/schema/vehicle-search-schema";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@repo/ui/lib/helpers/image";

// ─── Serialise filter object → URLSearchParams ────────────────────────────────

const ARRAY_KEYS = [
  "make", "model", "excludeMake", "excludeModel",
  "fuel", "transmission", "condition", "vehicleType", "bodyType", "color",
  "driveType", "equipment", "energyLabels", "emissionStandards", "interiorColor",
] as const;

const NUM_KEYS = [
  "priceFrom", "priceTo", "registrationFrom", "registrationTo",
  "kilometerFrom", "kilometerTo", "powerFrom", "powerTo",
  "kwFrom", "kwTo", "cubicCapacityFrom", "cubicCapacityTo",
  "cylindersFrom", "cylindersTo", "co2From", "co2To", "daysListed",
] as const;

function filtersToParams(
  filters: Partial<VehicleSearchParams>,
  base: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base);

  // Clear all filter keys from base so we start fresh
  [...ARRAY_KEYS, ...NUM_KEYS, "metallic", "inspectionPassed", "hasWarranty", "evs", "search"].forEach(
    (k) => params.delete(k),
  );

  for (const key of ARRAY_KEYS) {
    const val = (filters as any)[key] as string[] | undefined;
    if (Array.isArray(val) && val.length > 0) val.forEach((v) => params.append(key, v));
  }
  for (const key of NUM_KEYS) {
    const val = (filters as any)[key] as number | undefined;
    if (val != null) params.set(key, String(val));
  }
  if (filters.metallic != null) params.set("metallic", String(filters.metallic));
  if (filters.inspectionPassed != null) params.set("inspectionPassed", String(filters.inspectionPassed));
  if (filters.hasWarranty != null) params.set("hasWarranty", String(filters.hasWarranty));
  if (filters.evs) params.set("evs", filters.evs);
  if (filters.q) params.set("q", filters.q);

  // Reset to page 1 on filter change
  params.delete("page");

  return params;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DealerDetailContentProps {
  dealer: DealerDetail;
  initialVehicles: DealerVehiclesResult;
  googleData: GooglePlaceData | null;
  initialFilters?: Partial<VehicleSearchParams>;
  facets?: VehicleFacets | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DealerDetailContent = ({
  dealer,
  initialVehicles,
  googleData,
  initialFilters = {},
  facets,
}: DealerDetailContentProps) => {
  const t = useTranslations("DealerDetail");
  const tForm = useTranslations("DealerProfileForm");
  const tSchema = useTranslations("DealerContactSchema");
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "about";
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read current sort from URL
  const currentSort = searchParams.get("sort") ?? "created-desc";

  // Vehicles + pagination come from server props directly
  const vehicles = initialVehicles.vehicles;
  const totalCount = initialVehicles.totalCount;
  const totalPages = initialVehicles.totalPages;
  const currentPage = initialVehicles.currentPage;

  // ── URL helpers ──────────────────────────────────────────────────────────────

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      const qs = params.toString();
      return qs ? `?${qs}` : "?";
    },
    [searchParams],
  );

  // ── Filter change → update URL ───────────────────────────────────────────────

  const handleFilterChange = useCallback(
    (newFilters: Partial<VehicleSearchParams>) => {
      const params = filtersToParams(newFilters, new URLSearchParams(searchParams.toString()));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Sort change → update URL ─────────────────────────────────────────────────

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!newSort || newSort === "created-desc") params.delete("sort");
    else params.set("sort", newSort);
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // ── Contact form ─────────────────────────────────────────────────────────────

  const contactSchema = useMemo(() => createDealerContactSchema(tSchema), [tSchema]);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const result = await sendDealerContactEmailFromApi(dealer.id, values);
        if (result.success) {
          toast.success(t("successToast"));
          form.reset();
        } else {
          toast.error(result.error ?? t("errorToast"));
        }
      } catch {
        toast.error(t("unexpectedError"));
      } finally {
        setIsSubmitting(false);
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
              src={getImageUrl(dealer.coverImage)}
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
                    src={getImageUrl(dealer.logo)}
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
                    {t("phoneButton")}
                  </Link>
                </Button>

                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`mailto:${dealer.email}`}>
                    <Mail />
                    {t("emailButton")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-285 mx-auto px-4 pt-6">
        <Tabs key={activeTab} defaultValue={activeTab} className="space-y-6">
          <TabsList className="w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="about">{t("tabAbout")}</TabsTrigger>
            <TabsTrigger value="cars">
              {t("tabCars")}
              <Badge variant="secondary" className="ml-1">
                {totalCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ratings">{t("tabRatings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-10 mb-0">
            <Card>
              <CardHeader className="border-b gap-0">
                <CardTitle>{t("aboutTitle", { name: dealer.companyName })}</CardTitle>
              </CardHeader>
              <CardContent>
                {dealer.description ? (
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    {(() => {
                      const norm = dealer.description!.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                      const parts = norm
                        .split(/\n\n+/.test(norm) ? /\n\n+/ : /\n/)
                        .map((p) => p.trim())
                        .filter(Boolean);
                      return parts.map((para, i) => (
                        <p key={i} className="whitespace-pre-line">
                          {para}
                        </p>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t("noDescription")}
                  </p>
                )}
              </CardContent>
            </Card>

            {vehicles.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-6">{t("currentOffers")}</h2>
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
                  <h2 className="text-xl font-bold mb-6">{t("ratingsTitle")}</h2>
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
                            {t("reviewsCount", { count: reviewCount })}
                          </p>
                        )}
                      </div>
                      <Separator orientation="vertical" className="h-12!" />
                      <p className="text-sm text-muted-foreground">
                        {t("googleRatings")}
                      </p>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">{t("openingHours")}</h2>

                {hasOpeningHours ? (
                  <div className="rounded-xl border overflow-hidden">
                    {dealer.openingHours.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-4 border-b last:border-0 hover:bg-muted/30"
                      >
                        <span className="font-medium text-muted-foreground">
                          {tForm(`days.${item.day}`)}
                        </span>
                        <span
                          className={`font-semibold ${!item.isOpen ? "text-muted-foreground" : ""}`}
                        >
                          {item.hours ?? tForm("isClosed")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-xl border bg-muted/20">
                    <Clock className="size-4 shrink-0" />
                    <span>{t("noOpeningHours")}</span>
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("contactTitle")}</CardTitle>
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
                        {t("sendMessage")}
                      </h3>
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="text"
                        name="name"
                        label={t("nameLabel")}
                        placeholder={t("namePlaceholder")}
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="tel"
                        name="phone"
                        label={t("phoneLabel")}
                        placeholder="+41 79 123 45 67"
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="email"
                        name="email"
                        label={t("emailLabel")}
                        placeholder="m@example.com"
                        disabled={isPending}
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.TEXTAREA}
                        name="message"
                        label={t("messageLabel")}
                        placeholder={t("messagePlaceholder")}
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
                              <span>{t("submitting")}</span>
                            </>
                          ) : (
                            <>
                              <Send />
                              <span>{t("sendMessage")}</span>
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

          <TabsContent
            value="cars"
            className="space-y-8 mb-0"
            id="cars-tabs-content"
          >
            <GarageFilters
              onFilterChange={handleFilterChange}
              dealerId={dealer.id}
              initialFilters={initialFilters}
              facets={facets}
            />

            <div className="flex flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border">
              <p className="font-semibold">
                {t("vehiclesCount", { count: formatCount(totalCount) })}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {t("sortBy")}
                </span>
                <Select value={currentSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created-desc">{t("sortNewest")}</SelectItem>
                    <SelectItem value="price-asc">{t("sortPriceAsc")}</SelectItem>
                    <SelectItem value="price-desc">{t("sortPriceDesc")}</SelectItem>
                    <SelectItem value="kilometer-asc">{t("sortMileage")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="py-20 text-center bg-secondary/30 rounded-xl border">
                <p className="text-muted-foreground text-sm">
                  {t("noVehicles")}
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

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={currentPage > 1 ? buildUrl(currentPage - 1) : "#"}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href={buildUrl(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={currentPage < totalPages ? buildUrl(currentPage + 1) : "#"}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>

          <TabsContent value="ratings">
            {googleData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        {t("ratingsOverview")}
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
                          {reviewCount} {t("googleRatings")}
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
                  <h3 className="font-bold text-xl">{t("customerReviews")}</h3>

                  {googleData.reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("noReviews")}
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
                              {t("moreOnGoogle")}
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
                  {t("noRatings")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {t("noRatingsDescription")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
