import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@repo/auth";

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
