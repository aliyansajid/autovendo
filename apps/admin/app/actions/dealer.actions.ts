"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dealerSchema, updateDealerSchema } from "@/schema";
import { cacheDelete, cacheDeletePattern } from "@/lib/cache";
import { serverFetch } from "@/lib/api/client";

export async function createDealer(formData: z.infer<typeof dealerSchema>) {
  try {
    const validatedData = dealerSchema.parse(formData);

    const res = await serverFetch("/api/admin/dealers", {
      method: "POST",
      body: JSON.stringify({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        companyName: validatedData.companyName,
        streetAddress: validatedData.streetAddress,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        uidNumber: validatedData.uidNumber,
        contactPerson: validatedData.contactPerson,
        phoneNumber: validatedData.phoneNumber,
        businessEmail: validatedData.businessEmail,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: (err as any).error ?? "Failed to create dealer" };
    }

    await cacheDeletePattern("dealers:list:*");
    revalidatePath("/dealers");

    return { success: true, message: "Dealer created successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }
    console.error("Dealer creation error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

export async function getDealer(id: string) {
  const res = await serverFetch(`/api/admin/dealers/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch dealer");
  return res.json();
}

export async function updateDealer(
  id: string,
  formData: z.infer<typeof updateDealerSchema>,
) {
  try {
    const validatedData = updateDealerSchema.parse(formData);

    const res = await serverFetch(`/api/admin/dealers/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        companyName: validatedData.companyName,
        streetAddress: validatedData.streetAddress,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        uidNumber: validatedData.uidNumber,
        contactPerson: validatedData.contactPerson,
        phoneNumber: validatedData.phoneNumber,
        businessEmail: validatedData.businessEmail,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: (err as any).error ?? "Failed to update dealer" };
    }

    await Promise.all([
      cacheDelete(`dealer:${id}`),
      cacheDeletePattern("dealers:list:*"),
      cacheDeletePattern(`dealer:vehicles:${id}:*`),
    ]);
    revalidatePath("/dealers");
    revalidatePath(`/dealers/${id}`);

    return { success: true, message: "Dealer updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }
    console.error("Dealer update error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

export async function setUserPasswordAdmin({
  dealerId,
  userId,
  newPassword,
}: {
  dealerId: string;
  userId: string;
  newPassword: string;
}) {
  try {
    const res = await serverFetch(`/api/admin/dealers/${dealerId}/set-password`, {
      method: "POST",
      body: JSON.stringify({ userId, newPassword }),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to set password" };
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Set password error:", error);
    return { success: false, error: "Failed to set password" };
  }
}

export async function setRole({
  dealerId,
  role,
}: {
  dealerId: string;
  role: "user" | "admin";
}) {
  try {
    const res = await serverFetch(`/api/admin/dealers/${dealerId}/set-role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to set role" };
    }

    revalidatePath("/dealers");
    return { success: true, message: `Role updated to ${role}` };
  } catch (error) {
    console.error("Set role error:", error);
    return { success: false, error: "Failed to set role" };
  }
}

export async function banUser({
  dealerId,
  reason,
  expiresIn,
}: {
  dealerId: string;
  reason?: string;
  expiresIn?: number;
}) {
  try {
    const res = await serverFetch(`/api/admin/dealers/${dealerId}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason, expiresIn }),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to ban user" };
    }

    revalidatePath("/dealers");
    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Ban user error:", error);
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(dealerId: string) {
  try {
    const res = await serverFetch(`/api/admin/dealers/${dealerId}/unban`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to unban user" };
    }

    revalidatePath("/dealers");
    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("Unban user error:", error);
    return { success: false, error: "Failed to unban user" };
  }
}

export async function removeUser(dealerId: string) {
  try {
    const dealer = await getDealer(dealerId);
    if (!dealer) return { success: false, error: "User not found" };

    const res = await serverFetch(`/api/admin/dealers/${dealerId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return { success: false, error: "Failed to remove user" };
    }

    if (dealer?.id) {
      await Promise.all([
        cacheDelete(`dealer:${dealer.id}`),
        cacheDeletePattern("dealers:list:*"),
        cacheDeletePattern(`dealer:vehicles:${dealer.id}:*`),
        cacheDeletePattern("vehicles:*"),
      ]);
    }
    revalidatePath("/dealers");
    return { success: true, message: "User and all associated data removed successfully" };
  } catch (error) {
    console.error("Remove user error:", error);
    return { success: false, error: "Failed to remove user" };
  }
}

export async function revokeSession(sessionToken: string) {
  try {
    const res = await serverFetch(
      `/api/admin/dealers/sessions/${encodeURIComponent(sessionToken)}`,
      { method: "DELETE" },
    );

    if (!res.ok) {
      return { success: false, error: "Failed to revoke session" };
    }

    revalidatePath("/dealers");
    return { success: true, message: "Session revoked successfully" };
  } catch (error) {
    console.error("Revoke session error:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}

export async function revokeAllSessions(dealerId: string) {
  try {
    const res = await serverFetch(`/api/admin/dealers/${dealerId}/sessions`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return { success: false, error: "Failed to revoke sessions" };
    }

    revalidatePath("/dealers");
    return { success: true, message: "All sessions revoked successfully" };
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return { success: false, error: "Failed to revoke sessions" };
  }
}
