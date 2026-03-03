"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

interface ReviewSectionProps {
  rating: number;
  count: number;
  reviews?: Review[];
  dealerId: string | number;
}

export const ReviewSection = ({
  rating,
  count,
  reviews = [],
  dealerId,
}: ReviewSectionProps) => {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex text-yellow-400">
            {"★".repeat(Math.round(rating))}
          </div>
          <span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground">({count} reviews)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{review.author}</h4>
                  <span className="text-xs text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <div className="flex text-yellow-400 text-xs">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No reviews yet.
            </p>
          )}
        </div>

        {reviews.length > 0 && (
          <Link
            href={`/dealers/${dealerId}/reviews`}
            className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"
          >
            Show all reviews <ArrowRight className="size-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
