-- AlterTable
ALTER TABLE "dealer" ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleReviewCount" INTEGER,
ADD COLUMN     "googleReviews" JSONB;
