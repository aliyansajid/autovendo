import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import home from "./routes/home";
import search from "./routes/search";
import vehicle from "./routes/vehicle";
import dealerVehicles from "./routes/dealer-vehicles";
import dealerDashboard from "./routes/dealer-dashboard";
import dealerStorage from "./routes/dealer-storage";
import dealerBilling from "./routes/dealer-billing";
import contact from "./routes/contact";
import dealerProfile from "./routes/dealer-profile";
import dealers from "./routes/dealers";
import plans from "./routes/plans";
import dealerSubscriptions from "./routes/dealer-subscriptions";
import sitemapData from "./routes/sitemap";
import seller from "./routes/seller";
import sellerBilling from "./routes/seller-billing";
import sellerListings from "./routes/seller-listings";
import sellerStripeWebhook from "./routes/seller-stripe-webhook";
import sellerVehicles from "./routes/seller-vehicles";
import adminDealers from "./routes/admin-dealers";
import adminPlans from "./routes/admin-plans";
import adminSubscriptions from "./routes/admin-subscriptions";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS — must be before routes
app.use(
  "*",
  cors({
    origin: [
      "https://autovendo.ch",
      "https://www.autovendo.ch",
      "https://autosolo.ch",
      "https://www.autosolo.ch",
      "https://admin.autovendo.ch",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Session middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Auth routes (email/password + Google + Apple)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Home screen data
app.route("/api/home", home);

// Vehicle search
app.route("/api/search", search);

// Vehicle detail (public)
app.route("/api/vehicles", vehicle);

// Dealer vehicle CRUD (authenticated)
app.route("/api/dealer/vehicles", dealerVehicles);

// Dealer dashboard (authenticated)
app.route("/api/dealer/dashboard", dealerDashboard);

// Dealer storage — presigned URLs + cleanup (authenticated)
app.route("/api/dealer/storage", dealerStorage);

// Dealer billing — payment method, invoices, billing portal
app.route("/api/dealer/billing", dealerBilling);

// Contact form
app.route("/api/contact", contact);

// Dealer profile (authenticated)
app.route("/api/dealer/profile", dealerProfile);

// Public dealers list and detail
app.route("/api/dealers", dealers);

// Plans (public)
app.route("/api/plans", plans);

// Active subscriptions (authenticated)
app.route("/api/dealer/subscriptions", dealerSubscriptions);

// Sitemap data (public)
app.route("/api/sitemap", sitemapData);

// Seller onboarding (authenticated)
app.route("/api/seller", seller);

// Seller billing — payment method, invoices, billing portal
app.route("/api/seller/billing", sellerBilling);

// Seller listings — checkout sessions
app.route("/api/seller/listings", sellerListings);

// Seller listing payment webhook (separate from Better Auth subscription webhook)
app.route("/api/seller/stripe/webhook", sellerStripeWebhook);

// Seller vehicles — public listing + authenticated dashboard
app.route("/api/seller/vehicles", sellerVehicles);

// Admin — dealer management
app.route("/api/admin/dealers", adminDealers);

// Admin — plan management
app.route("/api/admin/plans", adminPlans);

// Admin — subscriptions
app.route("/api/admin/subscriptions", adminSubscriptions);

// Session endpoint
app.get("/api/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");
  if (!user) return c.body(null, 401);
  return c.json({ user, session });
});

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});

export type AppType = typeof app;
