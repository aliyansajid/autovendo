"use server";

import { z } from "zod";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { planSchema } from "@/schema";

export async function getPlans() {
  return await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });
}

export async function createPlan(formData: z.infer<typeof planSchema>) {
  try {
    const validatedData = planSchema.parse(formData);

    await prisma.plan.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        priceId: validatedData.priceId,
        limits: { vehicles: validatedData.vehicles },
        popular: validatedData.popular,
        hasTrial: validatedData.hasTrial,
        trialDays: validatedData.hasTrial ? validatedData.trialDays : null,
      },
    });

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

    await prisma.plan.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        priceId: validatedData.priceId,
        limits: { vehicles: validatedData.vehicles },
        popular: validatedData.popular,
        hasTrial: validatedData.hasTrial,
        trialDays: validatedData.hasTrial ? validatedData.trialDays : null,
      },
    });

    revalidatePath("/plans");
    return { success: true, message: "Plan updated successfully" };
  } catch (error) {
    console.error("Plan update error:", error);
    return { success: false, error: "Failed to update plan" };
  }
}

export async function deletePlan(id: string) {
  try {
    await prisma.plan.delete({
      where: { id },
    });

    revalidatePath("/plans");
    return { success: true, message: "Plan deleted successfully" };
  } catch (error) {
    console.error("Plan deletion error:", error);
    return { success: false, error: "Failed to delete plan" };
  }
}
