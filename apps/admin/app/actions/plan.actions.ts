"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { planSchema } from "@/schema";
import { serverFetch } from "@/lib/api/client";

export async function getPlans() {
  const res = await serverFetch("/api/admin/plans");
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json();
}

export async function createPlan(formData: z.infer<typeof planSchema>) {
  try {
    const validatedData = planSchema.parse(formData);

    const res = await serverFetch("/api/admin/plans", {
      method: "POST",
      body: JSON.stringify({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        priceId: validatedData.priceId,
        vehicles: validatedData.vehicles,
        popular: validatedData.popular,
        hasTrial: validatedData.hasTrial,
        trialDays: validatedData.trialDays,
      }),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to create plan" };
    }

    revalidatePath("/plans");
    return { success: true, message: "Plan created successfully" };
  } catch (error) {
    console.error("Plan creation error:", error);
    return { success: false, error: "Failed to create plan" };
  }
}

export async function updatePlan(
  id: string,
  formData: z.infer<typeof planSchema>,
) {
  try {
    const validatedData = planSchema.parse(formData);

    const res = await serverFetch(`/api/admin/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        priceId: validatedData.priceId,
        vehicles: validatedData.vehicles,
        popular: validatedData.popular,
        hasTrial: validatedData.hasTrial,
        trialDays: validatedData.trialDays,
      }),
    });

    if (!res.ok) {
      return { success: false, error: "Failed to update plan" };
    }

    revalidatePath("/plans");
    return { success: true, message: "Plan updated successfully" };
  } catch (error) {
    console.error("Plan update error:", error);
    return { success: false, error: "Failed to update plan" };
  }
}

export async function deletePlan(id: string) {
  try {
    const res = await serverFetch(`/api/admin/plans/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return { success: false, error: "Failed to delete plan" };
    }

    revalidatePath("/plans");
    return { success: true, message: "Plan deleted successfully" };
  } catch (error) {
    console.error("Plan deletion error:", error);
    return { success: false, error: "Failed to delete plan" };
  }
}
