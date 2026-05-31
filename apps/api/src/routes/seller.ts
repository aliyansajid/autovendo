import { Hono } from "hono";
import { prisma } from "@repo/db";
import { z } from "zod";
import sendEmail from "@repo/transactional";
import { SellerWelcomeEmail } from "@repo/transactional/emails/seller-welcome";

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

// ─── POST /signup ─────────────────────────────────────────────────────────────
// Called after successful sign-up to create seller profile + send welcome email

router.post("/signup", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { name, email, locale } = await c.req.json<{
    name: string;
    email: string;
    locale: string;
  }>();

  // Create seller profile (non-critical — ignore if already exists)
  try {
    await prisma.seller.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        phoneNumber: "",
        streetAddress: "",
        zipCode: "",
        city: "",
        country: "ch",
      },
    });
  } catch {
    // non-critical
  }

  // Send welcome email (non-critical)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autosolo.ch";
    const appName = process.env.APP_NAME ?? "AutoSolo";

    await sendEmail({
      to: email,
      subject: `Welcome to ${appName} – your account is ready`,
      template: SellerWelcomeEmail({
        sellerName: name,
        dashboardUrl: `${appUrl}/${locale}/dashboard`,
      }),
    });
  } catch {
    // non-critical
  }

  return c.json({ success: true });
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
