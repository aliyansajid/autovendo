/**
 * ============================================================================
 * SUBSCRIPTION HELPERS
 * ============================================================================
 * Pure functions for subscription status computation and guard checks.
 * Extracted from server actions so they can be unit-tested independently.
 */

export type SubscriptionStatusType =
  | "active"
  | "no_subscription"
  | "quota_exhausted"
  | "expired"
  | "past_due";

export type SubscriptionStatus = {
  type: SubscriptionStatusType;
  plan: string;
  maxVehicles: number;
  currentCount: number;
  remainingQuota: number;
};

export type RawSubscription = {
  status: string;
  plan: string;
};

/**
 * Compute subscription status from raw Stripe subscription data.
 * - active / trialing / incomplete → candidate for "active"
 * - past_due / unpaid → candidate for "past_due"
 * - No match → "no_subscription"
 */
export function computeSubscriptionStatus(
  subscriptions: RawSubscription[],
  maxVehicles: number,
  currentCount: number,
): SubscriptionStatus {
  const activeSub = subscriptions.find(
    (s) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "incomplete",
  );
  const pastDueSub = subscriptions.find(
    (s) => s.status === "past_due" || s.status === "unpaid",
  );

  const mainSub = activeSub || pastDueSub;

  if (!mainSub) {
    return {
      type: "no_subscription",
      plan: "",
      maxVehicles: 0,
      currentCount,
      remainingQuota: 0,
    };
  }

  const remainingQuota = Math.max(0, maxVehicles - currentCount);

  if (mainSub.status === "past_due" || mainSub.status === "unpaid") {
    return {
      type: "past_due",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota,
    };
  }

  if (remainingQuota === 0 && maxVehicles > 0) {
    return {
      type: "quota_exhausted",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota: 0,
    };
  }

  return {
    type: "active",
    plan: mainSub.plan,
    maxVehicles,
    currentCount,
    remainingQuota,
  };
}

/**
 * Creating a new vehicle requires an active subscription.
 * Blocked by: no_subscription, quota_exhausted, expired, past_due.
 */
export function isBlockedFromCreating(type: SubscriptionStatusType): boolean {
  return type !== "active";
}

/**
 * Editing an existing vehicle is blocked only when the subscription is
 * completely gone (no_subscription or expired). past_due may still edit.
 */
export function isBlockedFromEditing(type: SubscriptionStatusType): boolean {
  return type === "no_subscription" || type === "expired";
}

/**
 * Publishing a vehicle requires an active subscription.
 * Taking a vehicle offline (SOLD/DRAFT) is always allowed.
 */
export function isBlockedFromPublishing(type: SubscriptionStatusType): boolean {
  return type !== "active";
}

/**
 * UI "blocked" state — disables new listing button and shows alerts.
 * True for every non-active status.
 */
export function isUIBlocked(type: SubscriptionStatusType): boolean {
  return (
    type === "no_subscription" ||
    type === "quota_exhausted" ||
    type === "expired" ||
    type === "past_due"
  );
}

/**
 * Check if a user/dealer is effectively banned.
 * Mirrors the Prisma `banned: { not: true }` filter — null is NOT banned.
 */
export function isBanned(banned: boolean | null | undefined): boolean {
  return banned === true;
}
