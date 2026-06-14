-- Fix bodyType values: normalize to uppercase with underscores (e.g. 'suv' → 'SUV', 'small-car' → 'SMALL_CAR')
UPDATE "vehicle"
SET "bodyType" = UPPER(REPLACE("bodyType", '-', '_'))
WHERE "bodyType" ~ '[a-z]';
