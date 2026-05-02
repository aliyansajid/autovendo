"use server";

import { z } from "zod";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { dealerSchema, updateDealerSchema } from "@/schema";

export async function createDealer(formData: z.infer<typeof dealerSchema>) {
  try {
    const validatedData = dealerSchema.parse(formData);

    // 1. Create User via Better Auth Admin API
    const newUser = await auth.api.createUser({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role: "user",
      },
    });

    if (!newUser || !newUser.user) {
      return { error: "Failed to create authentication account" };
    }

    await prisma.user.update({
      where: { id: newUser.user.id },
      data: { emailVerified: true },
    });

    // 2. Create Dealer Record
    await prisma.dealer.create({
      data: {
        userId: newUser.user.id,
        companyName: validatedData.companyName,
        streetAddress: validatedData.streetAddress,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        uidNumber: validatedData.uidNumber,
        contactPerson: validatedData.contactPerson,
        phoneNumber: validatedData.phoneNumber,
        businessEmail: validatedData.businessEmail,
      },
    });

    // 3. Send Welcome Email
    try {
      const { sendEmail } = await import("@repo/transactional");
      const { DealerWelcomeEmail } =
        await import("@repo/transactional/emails/dealer-welcome");

      await sendEmail({
        to: validatedData.email,
        subject: "Welcome to Autovendo",
        template: DealerWelcomeEmail({
          dealerName: validatedData.name,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          locale: "de",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't return error here because the account was successfully created
    }

    revalidatePath("/dealers");

    return {
      success: true,
      message: "Dealer created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }

    console.error("Dealer creation error:", error);

    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getDealer(id: string) {
  return await prisma.dealer.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}

export async function updateDealer(
  id: string,
  formData: z.infer<typeof updateDealerSchema>,
) {
  try {
    const validatedData = updateDealerSchema.parse(formData);

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!dealer) {
      return { error: "Dealer not found" };
    }

    // 1. Update User via Better Auth Admin API
    await auth.api.adminUpdateUser({
      body: {
        userId: dealer.userId,
        data: {
          name: validatedData.name,
          email: validatedData.email,
        },
      },
    });

    // 2. Update password if provided via Admin API
    if (validatedData.password) {
      await auth.api.setUserPassword({
        body: {
          userId: dealer.userId,
          newPassword: validatedData.password,
        },
      });
    }

    // 3. Update Dealer Record
    await prisma.dealer.update({
      where: { id },
      data: {
        companyName: validatedData.companyName,
        streetAddress: validatedData.streetAddress,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        uidNumber: validatedData.uidNumber,
        contactPerson: validatedData.contactPerson,
        phoneNumber: validatedData.phoneNumber,
        businessEmail: validatedData.businessEmail,
      },
    });

    revalidatePath("/dealers");
    revalidatePath(`/dealers/${id}`);

    return {
      success: true,
      message: "Dealer updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }

    console.error("Dealer update error:", error);

    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function setUserPasswordAdmin({
  userId,
  newPassword,
}: {
  userId: string;
  newPassword: string;
}) {
  try {
    await auth.api.setUserPassword({
      body: {
        userId,
        newPassword,
      },
    });
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Set password error:", error);
    return { success: false, error: "Failed to set password" };
  }
}

export async function setRole({
  userId,
  role,
}: {
  userId: string;
  role: "user" | "admin";
}) {
  try {
    const { headers } = await import("next/headers");
    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
    });
    revalidatePath("/dealers");
    return { success: true, message: `Role updated to ${role}` };
  } catch (error) {
    console.error("Set role error:", error);
    return { success: false, error: "Failed to set role" };
  }
}

export async function banUser({
  userId,
  reason,
  expiresIn,
}: {
  userId: string;
  reason?: string;
  expiresIn?: number;
}) {
  try {
    const { headers } = await import("next/headers");

    // 1. Get user and dealer info for the email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dealer: true },
    });

    // 2. Perform the ban
    await auth.api.banUser({
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn,
      },
      headers: await headers(),
    });

    // 3. Send the notification email
    if (user && user.email) {
      const { sendEmail, AccountBannedEmail } =
        await import("@repo/transactional");

      let durationText = "Permanent";
      if (expiresIn) {
        if (expiresIn === 3600) durationText = "1 Hour";
        else if (expiresIn === 86400) durationText = "24 Hours";
        else if (expiresIn === 604800) durationText = "7 Days";
        else if (expiresIn === 2592000) durationText = "30 Days";
      }

      const isPermanent = !expiresIn;
      
      await sendEmail({
        to: user.email,
        subject: isPermanent 
          ? "Important: Your account has been permanently banned"
          : "Notice: Your account has been temporarily suspended",
        template: AccountBannedEmail({
          dealerName: user.dealer?.contactPerson || user.name || "Dealer",
          reason: reason || "Violation of platform policies",
          duration: durationText,
          isPermanent,
        }),
      });
    }

    revalidatePath("/dealers");
    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Ban user error:", error);
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string) {
  try {
    const { headers } = await import("next/headers");

    // 1. Get user and dealer info for the email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dealer: true },
    });

    // 2. Perform the unban
    await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    // 3. Send the notification email
    if (user && user.email) {
      const { sendEmail, AccountUnbannedEmail } =
        await import("@repo/transactional");

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autovendo.ch";
      const loginUrl = `${baseUrl}/de/dashboard`;

      await sendEmail({
        to: user.email,
        subject: "Your Autovendo account access has been restored",
        template: AccountUnbannedEmail({
          dealerName: user.dealer?.contactPerson || user.name || "Dealer",
          loginUrl: loginUrl,
        }),
      });
    }

    revalidatePath("/dealers");
    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("Unban user error:", error);
    return { success: false, error: "Failed to unban user" };
  }
}

export async function removeUser(userId: string) {
  try {
    const { headers } = await import("next/headers");

    // 1. Get user and dealer info for the email BEFORE deleting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dealer: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 2. Remove from Better Auth (this usually triggers cascading deletes if configured, 
    // but we manually handle the dealer record just in case)
    await auth.api.removeUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    // 3. Ensure the dealer record is also gone (if not already deleted by Cascade)
    if (user.dealer) {
      const dealerExists = await prisma.dealer.findUnique({
        where: { id: user.dealer.id },
      });
      if (dealerExists) {
        await prisma.dealer.delete({
          where: { id: user.dealer.id },
        });
      }
    }

    // 4. Send the notification email
    if (user.email) {
      const { sendEmail, AccountDeletedEmail } = await import(
        "@repo/transactional"
      );

      await sendEmail({
        to: user.email,
        subject: "Your Autovendo account has been closed",
        template: AccountDeletedEmail({
          dealerName: user.dealer?.contactPerson || user.name || "Dealer",
        }),
      });
    }

    revalidatePath("/dealers");
    return { success: true, message: "User removed successfully" };
  } catch (error) {
    console.error("Remove user error:", error);
    return { success: false, error: "Failed to remove user" };
  }
}

export async function revokeSession(sessionToken: string) {
  try {
    const { headers } = await import("next/headers");
    await auth.api.revokeUserSession({
      body: {
        sessionToken,
      },
      headers: await headers(),
    });
    revalidatePath("/dealers");
    return { success: true, message: "Session revoked successfully" };
  } catch (error) {
    console.error("Revoke session error:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}

export async function revokeAllSessions(userId: string) {
  try {
    const { headers } = await import("next/headers");
    await auth.api.revokeUserSessions({
      body: {
        userId,
      },
      headers: await headers(),
    });
    revalidatePath("/dealers");
    return { success: true, message: "All sessions revoked successfully" };
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return { success: false, error: "Failed to revoke sessions" };
  }
}
