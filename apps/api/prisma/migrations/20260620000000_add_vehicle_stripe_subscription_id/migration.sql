ALTER TABLE "vehicle" ADD COLUMN "stripeSubscriptionId" TEXT;
CREATE UNIQUE INDEX "vehicle_stripeSubscriptionId_key" ON "vehicle"("stripeSubscriptionId");
