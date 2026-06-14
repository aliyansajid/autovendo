-- Create BodyType enum
CREATE TYPE "BodyType" AS ENUM (
  'SUV',
  'SALOON',
  'ESTATE',
  'COUPE',
  'CABRIOLET',
  'SMALL_CAR',
  'MINIVAN',
  'PICKUP',
  'BUS',
  'ALCOVE',
  'TRAILER',
  'INTEGRATED',
  'CAB',
  'BOX',
  'SEMI_INTEGRATED',
  'MOTORHOME',
  'CARAVAN',
  'OTHER',
  'BRIDGE',
  'BRIDGE_DOUBLE_CAB',
  'CHASSIS_CAB',
  'BOX_GLAZED',
  'BOX_DOUBLE_CAB',
  'TIPPER',
  'PLATFORM',
  'SEMI_TRAILER',
  'CAB_OVER',
  'COACH'
);

-- Convert the bodyType column from text to the new enum
ALTER TABLE "vehicle"
  ALTER COLUMN "bodyType" TYPE "BodyType" USING "bodyType"::"BodyType";
