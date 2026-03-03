"use client";

import { dealerPageData } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { Badge } from "@repo/ui/src/components/badge";
import { Separator } from "@repo/ui/src/components/separator";
import { Avatar, AvatarFallback } from "@repo/ui/src/components/avatar";
import { Star, ArrowLeft, BadgeCheck, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/src/components/button";

const allReviews = [
  {
    id: "1",
    author: "Dario N.",
    initials: "DN",
    date: "12 days ago",
    rating: 5,
    title: "Excellent Service!",
    content:
      "Excellent service, very professional. The team helped me find exactly the car I was looking for within my budget. Highly recommend this dealer to anyone looking for a quality vehicle.",
    vehicle: "Volkswagen T-Roc",
    helpful: 8,
    verified: true,
  },
  {
    id: "2",
    author: "Hans R. Blatter",
    initials: "HB",
    date: "37 days ago",
    rating: 5,
    title: "Found My Dream Car!",
    content:
      "Wir haben seit kurzem ein Hymer Camper auf Sprinter 4x4 Basis. Wir haben unseren Traumwagen gefunden. Der Service war ausgezeichnet und das Team sehr hilfsbereit!",
    vehicle: "Mercedes Sprinter",
    helpful: 12,
    verified: true,
  },
  {
    id: "3",
    author: "Nicole R.",
    initials: "NR",
    date: "61 days ago",
    rating: 5,
    title: "Friendly and Fast",
    content:
      "Motorschaden nach nur 120000 km - 7 jährig. Zuständiger Mitarbeiter war sehr freundlich und hat sich um alles gekümmert. Sehr empfehlenswert!",
    vehicle: "BMW 3 Series",
    helpful: 4,
    verified: true,
  },
  {
    id: "4",
    author: "Marco R.",
    initials: "MR",
    date: "80 days ago",
    rating: 4,
    title: "Quick and Reliable Repair",
    content:
      "Mein Mercedes-Sprinter Lieferwagen wurde innert nur 5 Tagen super repariert. Gute Kommunikation, transparente Preise. Ich komme wieder.",
    vehicle: "Mercedes-Benz Sprinter",
    helpful: 6,
    verified: true,
  },
  {
    id: "5",
    author: "Sophia K.",
    initials: "SK",
    date: "95 days ago",
    rating: 5,
    title: "Outstanding Experience",
    content:
      "From the moment I walked in, the staff was welcoming and knowledgeable. They helped me through every step of the financing process and I drove away with my new car within two days!",
    vehicle: "Audi A4",
    helpful: 15,
    verified: true,
  },
  {
    id: "6",
    author: "Luca M.",
    initials: "LM",
    date: "110 days ago",
    rating: 4,
    title: "Good Overall",
    content:
      "Good selection of vehicles and competitive prices. The only downside was a slight delay in paperwork, but the salesperson was apologetic and kept me updated throughout.",
    vehicle: "Fiat 500",
    helpful: 3,
    verified: false,
  },
  {
    id: "7",
    author: "Anna W.",
    initials: "AW",
    date: "130 days ago",
    rating: 5,
    title: "Highly Recommend!",
    content:
      "Truly a five-star experience. Professional team, immaculate showroom, and genuine care for customer satisfaction. I've been to many dealers but this one stands out.",
    vehicle: "Porsche Cayenne",
    helpful: 22,
    verified: true,
  },
  {
    id: "8",
    author: "Tomasz P.",
    initials: "TP",
    date: "150 days ago",
    rating: 3,
    title: "Decent but Not Perfect",
    content:
      "The car I bought was in good condition, but the after-sales follow-up was lacking. Had to chase them a few times to get my service documents. The car itself is great though.",
    vehicle: "Toyota RAV4",
    helpful: 1,
    verified: true,
  },
];

const ratingBreakdown = [
  { stars: 5, count: 240, pct: 70 },
  { stars: 4, count: 69, pct: 20 },
  { stars: 3, count: 20, pct: 6 },
  { stars: 2, count: 8, pct: 2 },
  { stars: 1, count: 5, pct: 2 },
];

export default function DealerReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  const { garage } = dealerPageData;

  return (
    <div className="max-w-285 mx-auto px-4 py-10 space-y-8">
      {/* Back link */}
      <Link
        href={`/dealers/${params.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to {garage.name}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Reviews</h1>
            {garage.isVerified && (
              <BadgeCheck className="text-primary size-5" />
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">{garage.name}</p>
        </div>
        <Button>Write a Review</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Overview Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="border-b gap-0">
              <CardTitle className="text-base">Rating Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Big score */}
              <div className="flex flex-col items-center gap-2 py-2">
                <span className="text-6xl font-bold">{garage.rating}</span>
                <div className="flex text-[#F9A602] text-xl gap-0.5">
                  {"★".repeat(Math.round(garage.rating))}
                  {"☆".repeat(5 - Math.round(garage.rating))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Based on {garage.reviewCount} reviews
                </span>
              </div>

              <Separator />

              {/* Star breakdown */}
              <div className="space-y-2">
                {ratingBreakdown.map(({ stars, count, pct }) => (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-3 text-right shrink-0">{stars}</span>
                    <Star className="size-3 text-[#F9A602] fill-[#F9A602] shrink-0" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f9a602] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-6 shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                <span className="font-semibold text-foreground">94%</span> of
                customers would recommend this dealer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {allReviews.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {garage.reviewCount}
              </span>{" "}
              reviews
            </p>
          </div>

          {allReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm">{review.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  {review.verified && (
                    <Badge
                      variant="outline"
                      className="text-green-600 bg-green-50 border-green-200 shrink-0"
                    >
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Stars + title */}
                <div className="space-y-1">
                  <div className="flex text-[#F9A602] text-sm gap-0.5">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <p className="font-semibold">{review.title}</p>
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    Vehicle:{" "}
                    <span className="font-medium text-foreground">
                      {review.vehicle}
                    </span>
                  </span>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp className="size-3.5" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-4">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
