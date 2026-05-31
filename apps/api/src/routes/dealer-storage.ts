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

// ─── POST /presign-profile — presigned URL for profile/branding uploads ──────

const ALLOWED_PROFILE_TYPES = ["branding", "profiles"] as const;
type AllowedProfileType = (typeof ALLOWED_PROFILE_TYPES)[number];

const ALLOWED_CONTENT_TYPES: Record<AllowedProfileType, RegExp> = {
  profiles: /^image\/(jpeg|png|webp|gif)$/,
  branding: /^image\/(jpeg|png|webp|gif|svg\+xml)$/,
};

const MAX_FILENAME_LENGTH = 200;

router.post("/presign-profile", async (c) => {
  const user = c.get("user")!;

  const dealer = await prisma.dealer.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!dealer) return c.json({ success: false, error: "Dealer profile not found" }, 404);

  const body = await c.req.json().catch(() => null);
  const { type, filename, contentType } = (body ?? {}) as {
    type?: string;
    filename?: string;
    contentType?: string;
  };

  if (!type || !filename || !contentType) {
    return c.json({ success: false, error: "type, filename and contentType are required" }, 400);
  }

  if (!ALLOWED_PROFILE_TYPES.includes(type as AllowedProfileType)) {
    return c.json({ success: false, error: "Invalid upload type" }, 400);
  }

  if (!ALLOWED_CONTENT_TYPES[type as AllowedProfileType].test(contentType)) {
    return c.json({ success: false, error: "Invalid file type" }, 400);
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, MAX_FILENAME_LENGTH);
  if (!safeFilename) return c.json({ success: false, error: "Invalid filename" }, 400);

  const key = StorageService.formatPath(dealer.id, type as AllowedProfileType, safeFilename);

  try {
    const uploadUrl = await storage.getUploadUrl(key, contentType);
    return c.json({
      success: true,
      uploadUrl,
      key,
      publicUrl: storage.getPublicUrl(key),
    });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    return c.json({ success: false, error: "Failed to generate upload URL" }, 500);
  }
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
