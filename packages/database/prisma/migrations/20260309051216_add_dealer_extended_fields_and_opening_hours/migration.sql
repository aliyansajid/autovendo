-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "dealer" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "opening_hour" (
    "id" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TIME,
    "closeTime" TIME,
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "opening_hour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opening_hour_dealerId_day_key" ON "opening_hour"("dealerId", "day");

-- AddForeignKey
ALTER TABLE "opening_hour" ADD CONSTRAINT "opening_hour_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
