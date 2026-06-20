# API Reference — apps/web

All requests go to `NEXT_PUBLIC_API_URL` (e.g. `https://api.autovendo.ch`). All endpoints are public — no authentication required. All responses fail silently (empty array / null) rather than throwing, so pages degrade gracefully.

---

## Vehicles

### `GET /vehicles`

List vehicles with filters, sorting, and pagination.

**Query params**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Results per page (default: 24, max: 100) |
| `sort` | string | `relevance` `price-asc` `price-desc` `kilometer-asc` `kilometer-desc` `registration-asc` `registration-desc` `created-asc` `created-desc` |
| `q` | string | Full-text search across make, model, version, description |
| `dealerId` | string | Scope results to a specific dealer |
| `vehicleType` | string / string[] | `CAR` `UTILITY` `TRUCK` `CAMPER` |
| `make` | string / string[] | Filter by make(s) |
| `excludeMake` | string / string[] | Exclude make(s) (ignored if `make` is set) |
| `model` | string | Filter by model (exact match) |
| `fuel` | string / string[] | Fuel type(s) |
| `condition` | string / string[] | `NEW` `USED` `DEMONSTRATION` `PRE_REGISTERED` `OLDTIMER` |
| `bodyType` | string / string[] | Body type(s) |
| `transmission` | string / string[] | `AUTOMATIC` `AUTOMATIC_STEPLESS` `SEMI_AUTOMATIC` `MANUAL` |
| `color` | string / string[] | Exterior color(s) |
| `interiorColor` | string / string[] | Interior color(s) |
| `driveType` | string / string[] | `ALL` `FRONT` `REAR` |
| `sellerType` | string / string[] | `DEALER` `SELLER` |
| `metallic` | `true` / `false` | Filter by metallic paint |
| `inspectionPassed` | `true` | Has passed MFK inspection |
| `hasWarranty` | `true` | Has an active warranty |
| `daysListed` | number | Listed within N days |
| `energyLabels` | string / string[] | `A` `B` `C` `D` `E` `F` `G` |
| `emissionStandards` | string / string[] | Euro norm(s) |
| `batteryOwnership` | string / string[] | `BATTERY_INCLUDED` `BATTERY_RENT_REQUIRED` |
| `chargingPlugTypeStandard` | string / string[] | AC charging plug type(s) |
| `chargingPlugTypeFast` | string / string[] | DC charging plug type(s) |
| `equipment` | string / string[] | Equipment items (vehicle must have ALL selected) |
| `extras` | string / string[] | Extras (vehicle must have ALL selected) |
| `priceFrom` / `priceTo` | number | Price range (CHF) |
| `kilometerFrom` / `kilometerTo` | number | Mileage range |
| `registrationFrom` / `registrationTo` | number | Registration year range |
| `powerFrom` / `powerTo` | number | Power range (HP) |
| `kwFrom` / `kwTo` | number | Power range (kW) |
| `cubicCapacityFrom` / `cubicCapacityTo` | number | Engine displacement range (ccm) |
| `cylindersFrom` / `cylindersTo` | number | Cylinder count range |
| `consumptionFrom` / `consumptionTo` | number | Fuel consumption range (l/100km) |
| `co2From` / `co2To` | number | CO₂ emissions range (g/km) |
| `rangeFrom` / `rangeTo` | number | EV range (km) |
| `doorsFrom` / `doorsTo` | number | Door count range |
| `seatsFrom` / `seatsTo` | number | Seat count range |

**Notes**
- Array params accept repeated query params (`?fuel=PETROL&fuel=DIESEL`) or comma-separated values (`?fuel=PETROL,DIESEL`)
- Every response is automatically filtered to `status: PUBLISHED` and non-banned owners — no need to pass these manually
- Always returns `facets` alongside results — used to show live counts in filter UI

**Response**

```json
{
  "data": [ /* VehicleListItem[] */ ],
  "total": 142,
  "page": 1,
  "pageSize": 24,
  "totalPages": 6,
  "facets": {
    "make": { "BMW": 12, "VW": 8 },
    "fuelType": { "PETROL": 20, "ELECTRIC": 5 },
    "transmissionType": { "AUTOMATIC": 18 },
    "vehicleCondition": { "USED": 30 },
    "bodyType": { "SUV": 15 },
    "color": { "BLACK": 10 },
    "sellerType": { "DEALER": 120, "SELLER": 22 },
    "priceMax": 85000,
    "kilometerMax": 320000,
    "yearMin": 1998,
    "yearMax": 2024
  }
}
```

---

### `GET /vehicles/featured`

Returns the 6 most recently published vehicles. No params.

**Response**

```json
{ "data": [ /* VehicleListItem[] */ ] }
```

---

### `GET /vehicles/:id`

Returns full vehicle detail. Returns 404 if the vehicle is not published or the owner is banned.

**Response**

```json
{ "data": { /* VehicleDetails */ } }
```

---

### `GET /vehicles/:id/similar`

Returns up to 6 similar published vehicles. Matches on same vehicle type + at least one of (same make, same body type, same fuel type), within ±50% of the current vehicle's price.

**Response**

```json
{ "data": [ /* VehicleListItem[] */ ] }
```

---

## Dealers

### `GET /dealers`

List dealers with optional search and pagination.

**Query params**

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by company name |
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Results per page (default: 12) |
| `city` | string | Filter by city |

**Response**

```json
{
  "data": [ /* DealerListItem[] */ ],
  "total": 48,
  "page": 1,
  "pageSize": 12,
  "totalPages": 4
}
```

---

### `GET /dealers/featured`

Returns featured dealers. No params.

**Response**

```json
{ "data": [ /* DealerListItem[] */ ] }
```

---

### `GET /dealers/:id`

Returns full dealer detail including opening hours. Returns 404 if not found.

**Response**

```json
{ "data": { /* DealerDetail */ } }
```

---

### `GET /dealers/:id/reviews`

Returns Google Place reviews data for a dealer.

**Response**

```json
{ "data": { /* GooglePlaceData */ } }
```

Returns `null` if no Google Place ID is configured for the dealer.

---

### `POST /dealers/:id/contact`

Sends a contact email to the dealer.

**Body**

```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "message": "string (optional)"
}
```

**Response**

```json
{ "success": true }
```

---

## General

### `GET /plans`

Returns all subscription plans (name, price, limits, trial info). Used on the pricing page.

**Response**

```json
[ /* Plan[] */ ]
```

---

### `POST /contact`

Sends a general contact message to the AutoVendo team.

**Body**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string (optional)",
  "message": "string (optional)"
}
```

**Response**

```json
{ "ok": true, "message": "success" }
```

---

## Sitemap

The following endpoints are called at build/request time exclusively for sitemap generation. Not used in any page UI.

| Endpoint | Usage |
|---|---|
| `GET /vehicles?pageSize=10000` | All vehicle IDs and `updatedAt` for sitemap |
| `GET /dealers?pageSize=10000` | All dealer IDs and `updatedAt` for sitemap |
