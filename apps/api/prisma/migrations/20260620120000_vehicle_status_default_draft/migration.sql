-- Vehicles must never be created as PUBLISHED implicitly. Publishing now happens
-- only through validated, paid/quota-checked transitions in the application layer.
ALTER TABLE "vehicle" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
