-- Add CHECK constraint: vehicleDescription must be <= 1000 characters when not NULL
ALTER TABLE "vehicle" ADD CONSTRAINT "chk_vehicle_description"
  CHECK ("vehicleDescription" IS NULL OR length("vehicleDescription") <= 1000);
