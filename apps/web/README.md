# apps/web

Public-facing marketplace for AutoVendo. Serves vehicle listings, dealer profiles, and search for buyers across four locales. Runs at `https://autovendo.ch`.

---

## Getting Started

### Prerequisites

Copy `.env.local` and fill in the required values:

```bash
NEXT_PUBLIC_API_URL=https://api.autovendo.ch   # NestJS API base URL
NEXT_PUBLIC_APP_URL=https://autovendo.ch        # This app's own URL
```

### Development

```bash
npm run dev          # http://localhost:3001
npm run build
npm run start
npm run lint
npm run check-types
```

---

## Pages

| Route | Description |
|---|---|
| `/[locale]` | Homepage |
| `/[locale]/cars` | Vehicle listings with filters, search, sort, pagination |
| `/[locale]/cars/[id]` | Vehicle detail page |
| `/[locale]/dealers` | Dealer directory with search and pagination |
| `/[locale]/dealers/[id]` | Dealer profile with vehicles and Google reviews |
| `/[locale]/advanced-search` | Full-featured search form |
| `/[locale]/sell` | Landing page for dealers |
| `/[locale]/pricing` | Pricing plans |
| `/[locale]/how-it-works` | How it works |
| `/[locale]/about` | About |
| `/[locale]/contact` | Contact form |
| `/[locale]/faq` | FAQ |
| `/[locale]/(legal)/*` | Legal pages (AGB, Datenschutz, Impressum, etc.) |

Supported locales: `de` (default), `en`, `fr`, `it`. The locale is always present as a URL prefix.

---

## How It Works

All pages are **server components** — no client-side data fetching. Data is fetched on the server on every request and rendered as HTML. The only client components are interactive elements (search inputs, filter sidebars, image galleries).

All API calls go to `NEXT_PUBLIC_API_URL`. No auth is required for any public page — the API enforces its own filters on every response.

---

## Page Flows

### `/cars`

1. URL search params are passed directly to `GET /vehicles?...`
2. API returns `vehicles`, `total`, `totalPages`, and `facets` in one request
3. Left sidebar shows filters with live counts from facets (desktop only)
4. Sort, search (`?q=`), and pagination all live in the URL — changing any triggers a full server re-render
5. Every response is filtered to `status: PUBLISHED` + non-banned owner automatically

### `/cars/[id]`

1. `GET /vehicles/:id` — full vehicle detail (returns 404 if unpublished or owner banned)
2. `GET /vehicles/:id/similar` — up to 6 similar vehicles (same type, matched on make/body/fuel, ±50% price)
3. Dynamic metadata and two JSON-LD schemas (Car + BreadcrumbList) generated per vehicle
4. Dealer listings show company name, logo, opening hours, Google rating, email CTA
5. Seller listings show private seller label, zip/city, phone only

### `/dealers`

1. `GET /dealers?search=&page=&pageSize=12`
2. Search input is the only client component — pushes `?q=` to URL
3. URL-based pagination, same pattern as `/cars`

### `/dealers/[id]`

1. Three parallel server fetches: dealer profile + dealer's vehicles + Google reviews
2. Vehicles are scoped to the dealer via `dealerId` — same published/non-banned filter applies
3. Search params validated through Zod before being passed to the vehicles query
4. Two JSON-LD schemas injected: `AutoDealer` + `BreadcrumbList`

### `/advanced-search`

1. Client-side form built with `react-hook-form` and `FormProvider`
2. All filter values come from `@repo/vehicle-constants` — the single source of truth
3. On every form change (300ms debounce), calls `GET /vehicles?pageSize=1` to get live result count and facets
4. Switching vehicle type tab resets the form to avoid contradictory filters
5. On submit, builds a query string from form values and navigates to `/cars?...`
6. If opened from a dealer profile (`?dealer=`), submits to `/dealers/:id?tab=cars&...` instead

---

## Data & Constants

All enum values (fuel types, body types, colors, makes, models, equipment, etc.) come from `@repo/vehicle-constants`. This package is the single source of truth shared between this app and the API — adding or removing a value there automatically propagates to both search forms and API validation.

Labels for all enum values come from i18n translation files in `messages/` via `next-intl`.

---

## SEO

- `lib/seo.ts` — single source of truth for `BASE_URL`, OG locale mapping, `buildMetadata()`, `buildAlternates()`
- All public pages have locale-aware titles, descriptions, canonical URLs, and hreflang alternates
- Vehicle and dealer detail pages generate dynamic metadata from API data
- Vehicle detail pages inject `Car` + `BreadcrumbList` JSON-LD
- Dealer detail pages inject `AutoDealer` + `BreadcrumbList` JSON-LD
- `app/robots.ts` — allows all crawlers, blocks AI training bots, allows Google-Extended
- `app/sitemap.ts` — dynamic sitemap covering all static pages + every vehicle and dealer listing across all 4 locales

---

## Locales

| Code | Language | Default |
|---|---|---|
| `de` | German | ✅ |
| `en` | English | |
| `fr` | French | |
| `it` | Italian | |

Locale detection and redirection handled by `next-intl` middleware. Message files live in `messages/`.
