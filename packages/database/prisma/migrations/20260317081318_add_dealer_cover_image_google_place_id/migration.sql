-- AlterTable
ALTER TABLE "dealer" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "googlePlaceId" TEXT;

-- CreateIndex
CREATE INDEX "dealer_companyName_idx" ON "dealer"("companyName");

-- CreateIndex
CREATE INDEX "vehicle_dealerId_createdAt_idx" ON "vehicle"("dealerId", "createdAt");

-- CreateIndex
CREATE INDEX "vehicle_vehicleType_idx" ON "vehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "vehicle_fuelType_idx" ON "vehicle"("fuelType");

-- CreateIndex
CREATE INDEX "vehicle_vehicleCondition_idx" ON "vehicle"("vehicleCondition");

-- CreateIndex
CREATE INDEX "vehicle_price_idx" ON "vehicle"("price");

-- CreateIndex
CREATE INDEX "vehicle_kilometer_idx" ON "vehicle"("kilometer");

-- CreateIndex
CREATE INDEX "vehicle_registrationYear_idx" ON "vehicle"("registrationYear");

-- CreateIndex
CREATE INDEX "vehicle_createdAt_idx" ON "vehicle"("createdAt");

-- CreateIndex
CREATE INDEX "vehicle_vehicleType_fuelType_price_idx" ON "vehicle"("vehicleType", "fuelType", "price");

-- CreateIndex
CREATE INDEX "vehicle_vehicleCondition_kilometer_idx" ON "vehicle"("vehicleCondition", "kilometer");
