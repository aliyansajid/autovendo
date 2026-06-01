import { Hono } from "hono";
import { prisma } from "@repo/db";
import { z } from "zod";

type Variables = {
  user: { id: string; email: string; name?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Validation schema ────────────────────────────────────────────────────────

const updateSchema = z.object({
  phoneNumber: z
    .string()
    .min(1)
    .regex(/^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/),
  streetAddress: z.string().min(5).max(100),
  zipCode: z.string().min(4).max(10),
  city: z.string().min(2).max(50),
});

// ─── GET /profile ─────────────────────────────────────────────────────────────

router.get("/profile", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await prisma.seller.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      phoneNumber: true,
      streetAddress: true,
      zipCode: true,
      city: true,
      country: true,
    },
  });

  return c.json(seller);
});

// ─── PUT /profile ─────────────────────────────────────────────────────────────

router.put("/profile", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      400,
    );
  }

  try {
    await prisma.seller.update({
      where: { userId: user.id },
      data: {
        phoneNumber: parsed.data.phoneNumber,
        streetAddress: parsed.data.streetAddress,
        zipCode: parsed.data.zipCode,
        city: parsed.data.city,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update seller profile:", error);
    return c.json({ success: false, error: "errorDefault" }, 500);
  }
});

export default router;
