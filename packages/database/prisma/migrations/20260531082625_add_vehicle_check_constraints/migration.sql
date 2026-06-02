ALTER TABLE "vehicle"
  -- ── Registration ────────────────────────────────────────────────────────────
  ADD CONSTRAINT "chk_registration_month"
    CHECK ("registrationMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "chk_registration_year"
    CHECK ("registrationYear" BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::int),

  -- ── Mileage & Price ──────────────────────────────────────────────────────────
  ADD CONSTRAINT "chk_kilometer"
    CHECK ("kilometer" >= 0),
  ADD CONSTRAINT "chk_price"
    CHECK ("price" >= 0),
  ADD CONSTRAINT "chk_new_price"
    CHECK ("newPrice" IS NULL OR "newPrice" >= 0),

  -- ── Power ───────────────────────────────────────────────────────────────────
  -- Total: Yangwang U9 Xtreme 3,000 hp | Combustion: Hennessey Venom F5 1,817 hp
  ADD CONSTRAINT "chk_hp"
    CHECK ("hp" IS NULL OR "hp" BETWEEN 1 AND 4000),
  ADD CONSTRAINT "chk_kw"
    CHECK ("kw" IS NULL OR "kw" BETWEEN 1 AND 3000),
  ADD CONSTRAINT "chk_combustion_engine_power_hp"
    CHECK ("combustionEnginePowerHp" IS NULL OR "combustionEnginePowerHp" BETWEEN 1 AND 2500),
  ADD CONSTRAINT "chk_electric_motor_power_hp"
    CHECK ("electricMotorPowerHp" IS NULL OR "electricMotorPowerHp" BETWEEN 1 AND 4000),

  -- ── Cabin ────────────────────────────────────────────────────────────────────
  -- Seats: city buses 80+, coaches 60+; 150 covers any production bus
  ADD CONSTRAINT "chk_seats"
    CHECK ("seats" IS NULL OR "seats" BETWEEN 1 AND 150),
  -- Doors: buses have multiple entry/exit sets; 20 covers any production bus
  ADD CONSTRAINT "chk_doors"
    CHECK ("doors" IS NULL OR "doors" BETWEEN 1 AND 20),

  -- ── Engine ───────────────────────────────────────────────────────────────────
  -- Cylinders: Bugatti Tourbillon V16 is production max
  ADD CONSTRAINT "chk_cylinders"
    CHECK ("cylinders" IS NULL OR "cylinders" BETWEEN 1 AND 16),
  -- Gears: Ford/GM 10R80 10-speed is production max
  ADD CONSTRAINT "chk_number_of_gears"
    CHECK ("numberOfGears" IS NULL OR "numberOfGears" BETWEEN 1 AND 10),
  -- Cubic capacity: ~16,000cc for large truck engines
  ADD CONSTRAINT "chk_cubic_capacity"
    CHECK ("cubicCapacity" IS NULL OR "cubicCapacity" BETWEEN 1 AND 30000),

  -- ── Dimensions (mm) ─────────────────────────────────────────────────────────
  ADD CONSTRAINT "chk_length"
    CHECK ("length" IS NULL OR "length" BETWEEN 1 AND 30000),
  ADD CONSTRAINT "chk_width"
    CHECK ("width" IS NULL OR "width" BETWEEN 1 AND 5000),
  ADD CONSTRAINT "chk_height"
    CHECK ("height" IS NULL OR "height" BETWEEN 1 AND 6000),
  ADD CONSTRAINT "chk_wheelbase"
    CHECK ("wheelbase" IS NULL OR "wheelbase" BETWEEN 1 AND 15000),

  -- ── Weight & Capacity (kg) ───────────────────────────────────────────────────
  ADD CONSTRAINT "chk_empty_weight"
    CHECK ("emptyWeight" IS NULL OR "emptyWeight" BETWEEN 1 AND 100000),
  ADD CONSTRAINT "chk_load_capacity"
    CHECK ("loadCapacity" IS NULL OR "loadCapacity" BETWEEN 0 AND 100000),
  ADD CONSTRAINT "chk_towing_capacity_braked"
    CHECK ("towingCapacityBraked" IS NULL OR "towingCapacityBraked" BETWEEN 0 AND 100000),

  -- ── Emissions ────────────────────────────────────────────────────────────────
  -- CO2: Bugatti ~520 g/km is production max
  ADD CONSTRAINT "chk_co2_emission"
    CHECK ("co2Emission" IS NULL OR "co2Emission" BETWEEN 0 AND 1000),

  -- ── Consumption (l/100km or kWh/100km) ──────────────────────────────────────
  ADD CONSTRAINT "chk_consumption_city"
    CHECK ("consumptionCity" IS NULL OR "consumptionCity" BETWEEN 0 AND 100),
  ADD CONSTRAINT "chk_consumption_country"
    CHECK ("consumptionCountry" IS NULL OR "consumptionCountry" BETWEEN 0 AND 100),
  ADD CONSTRAINT "chk_consumption_total"
    CHECK ("consumptionTotal" IS NULL OR "consumptionTotal" BETWEEN 0 AND 100),

  -- ── Electric ─────────────────────────────────────────────────────────────────
  -- Range: BYD 1,036 km is current production max
  ADD CONSTRAINT "chk_range"
    CHECK ("range" IS NULL OR "range" BETWEEN 1 AND 1500),
  -- Battery capacity: current max ~200 kWh
  ADD CONSTRAINT "chk_battery_capacity"
    CHECK ("batteryCapacity" IS NULL OR "batteryCapacity" BETWEEN 0 AND 500),
  -- Power consumption: kWh/100km
  ADD CONSTRAINT "chk_power_consumption"
    CHECK ("powerConsumption" IS NULL OR "powerConsumption" BETWEEN 0 AND 100),
  -- Charging power: fastest current ~350 kW
  ADD CONSTRAINT "chk_charging_power"
    CHECK ("chargingPower" IS NULL OR "chargingPower" BETWEEN 0 AND 1000),
  -- Battery rental: max 10 years = 120 months
  ADD CONSTRAINT "chk_battery_rental_month"
    CHECK ("batteryRentalMonth" IS NULL OR "batteryRentalMonth" BETWEEN 1 AND 120),

  -- ── Warranty ─────────────────────────────────────────────────────────────────
  ADD CONSTRAINT "chk_duration"
    CHECK ("duration" IS NULL OR "duration" BETWEEN 1 AND 120),
  ADD CONSTRAINT "chk_max_km"
    CHECK ("maxKm" IS NULL OR "maxKm" BETWEEN 0 AND 500000),

  -- ── Strings ──────────────────────────────────────────────────────────────────
  -- VIN: ISO 3779 standard — exactly 17 alphanumeric chars, no I/O/Q
  ADD CONSTRAINT "chk_vin"
    CHECK ("vehicleIdentificationNumber" IS NULL OR (
      LENGTH("vehicleIdentificationNumber") = 17 AND
      "vehicleIdentificationNumber" ~ '^[A-HJ-NPR-Z0-9]{17}$'
    )),
  -- Serial number: varies by manufacturer, cap at 100 chars
  ADD CONSTRAINT "chk_serial_number"
    CHECK ("serialNumber" IS NULL OR (LENGTH("serialNumber") BETWEEN 1 AND 100)),
  -- Type approval: EU format e.g. e1*2001/116*0001*00, cap at 50 chars
  ADD CONSTRAINT "chk_type_approval"
    CHECK ("typeApproval" IS NULL OR (LENGTH("typeApproval") BETWEEN 1 AND 50)),
  -- Make: required, cap at 50 chars
  ADD CONSTRAINT "chk_make"
    CHECK (LENGTH("make") BETWEEN 1 AND 50),
  -- Model/version: optional, cap at 50 chars each
  ADD CONSTRAINT "chk_model"
    CHECK ("model" IS NULL OR (LENGTH("model") BETWEEN 1 AND 50)),
  ADD CONSTRAINT "chk_version"
    CHECK ("version" IS NULL OR (LENGTH("version") BETWEEN 1 AND 50));
