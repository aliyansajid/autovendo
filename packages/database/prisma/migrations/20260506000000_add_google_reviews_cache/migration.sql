-- AlterTable
ALTER TABLE "Dealer" ADD COLUMN "googleRating" DOUBLE PRECISION,
ADD COLUMN "googleReviewCount" INTEGER,
ADD COLUMN "googleReviews" JSONB;
