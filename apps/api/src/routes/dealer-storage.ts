import { Hono } from "hono";
import { prisma } from "@repo/db";
import { StorageService } from "@repo/storage";
import { storage } from "../lib/storage.js";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// ─── POST /presign — generate presigned upload URLs ──────────────────────────

router.post("/presign", async (c) => {
  const user = c.get("user")!;

  const dealer = await prisma.dealer.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body?.listingId || !Array.isArray(body?.files)) {
    return c.json({ error: "listingId and files[] are required" }, 400);
  }

  const { listingId, files } = body as {
    listingId: string;
    files: { name: string; type: string }[];
  };

  const urls = await Promise.all(
    files.map(async (file) => {
      const key = StorageService.formatPath(dealer.id, "listing", file.name, listingId);
      const url = await storage.getUploadUrl(key, file.type);
      return { url, key };
    }),
  );

  return c.json(urls);
});

// ─── DELETE /cleanup — delete orphaned S3 keys ───────────────────────────────

router.delete("/cleanup", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!Array.isArray(body?.keys) || body.keys.length === 0) {
    return c.json({ ok: true });
  }

  await Promise.allSettled(
    (body.keys as string[]).map((key) => storage.deleteFile(key)),
  );

  return c.json({ ok: true });
});

export default router;
