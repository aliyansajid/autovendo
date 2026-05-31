import { Hono } from "hono";
import { auth } from "../lib/auth.js";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

router.get("/", async (c) => {
  try {
    const result = await (auth.api as any).listActiveSubscriptions({
      headers: c.req.raw.headers,
    });
    const subscriptions = Array.isArray(result)
      ? result
      : (result as any)?.data ?? [];
    return c.json(subscriptions);
  } catch {
    return c.json([]);
  }
});

export default router;
