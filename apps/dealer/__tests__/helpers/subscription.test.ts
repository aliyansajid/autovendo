import { describe, it, expect } from "vitest";
import {
  computeSubscriptionStatus,
  isBlockedFromCreating,
  isBlockedFromEditing,
  isBlockedFromPublishing,
  isUIBlocked,
  isBanned,
  type RawSubscription,
} from "@/lib/helpers/subscription";

// ---------------------------------------------------------------------------
// computeSubscriptionStatus
// ---------------------------------------------------------------------------

describe("computeSubscriptionStatus", () => {
  describe("no_subscription", () => {
    it("returns no_subscription when subscriptions array is empty", () => {
      const result = computeSubscriptionStatus([], 10, 3);
      expect(result.type).toBe("no_subscription");
      expect(result.plan).toBe("");
      expect(result.maxVehicles).toBe(0);
      expect(result.remainingQuota).toBe(0);
      expect(result.currentCount).toBe(3);
    });

    it("returns no_subscription when all statuses are unrecognised", () => {
      const subs: RawSubscription[] = [
        { status: "canceled", plan: "pro" },
        { status: "incomplete_expired", plan: "pro" },
      ];
      const result = computeSubscriptionStatus(subs, 10, 0);
      expect(result.type).toBe("no_subscription");
    });
  });

  describe("active", () => {
    it("returns active for status=active with quota remaining", () => {
      const subs: RawSubscription[] = [{ status: "active", plan: "pro" }];
      const result = computeSubscriptionStatus(subs, 10, 3);
      expect(result.type).toBe("active");
      expect(result.plan).toBe("pro");
      expect(result.maxVehicles).toBe(10);
      expect(result.currentCount).toBe(3);
      expect(result.remainingQuota).toBe(7);
    });

    it("returns active for status=trialing", () => {
      const subs: RawSubscription[] = [{ status: "trialing", plan: "starter" }];
      const result = computeSubscriptionStatus(subs, 5, 0);
      expect(result.type).toBe("active");
      expect(result.remainingQuota).toBe(5);
    });

    it("returns active for status=incomplete", () => {
      const subs: RawSubscription[] = [
        { status: "incomplete", plan: "pro" },
      ];
      const result = computeSubscriptionStatus(subs, 10, 2);
      expect(result.type).toBe("active");
    });

    it("prefers active over past_due when both present", () => {
      const subs: RawSubscription[] = [
        { status: "past_due", plan: "basic" },
        { status: "active", plan: "pro" },
      ];
      const result = computeSubscriptionStatus(subs, 10, 0);
      expect(result.type).toBe("active");
      expect(result.plan).toBe("pro");
    });
  });

  describe("quota_exhausted", () => {
    it("returns quota_exhausted when currentCount equals maxVehicles", () => {
      const subs: RawSubscription[] = [{ status: "active", plan: "starter" }];
      const result = computeSubscriptionStatus(subs, 5, 5);
      expect(result.type).toBe("quota_exhausted");
      expect(result.remainingQuota).toBe(0);
    });

    it("returns quota_exhausted when currentCount exceeds maxVehicles", () => {
      const subs: RawSubscription[] = [{ status: "active", plan: "starter" }];
      const result = computeSubscriptionStatus(subs, 5, 8);
      expect(result.type).toBe("quota_exhausted");
      expect(result.remainingQuota).toBe(0);
    });

    it("does NOT return quota_exhausted when maxVehicles is 0 (no_subscription path)", () => {
      // maxVehicles=0 with 0 vehicles — should be caught by no_subscription first
      const subs: RawSubscription[] = [];
      const result = computeSubscriptionStatus(subs, 0, 0);
      expect(result.type).toBe("no_subscription");
    });

    it("remainingQuota is never negative", () => {
      const subs: RawSubscription[] = [{ status: "active", plan: "pro" }];
      const result = computeSubscriptionStatus(subs, 5, 20);
      expect(result.remainingQuota).toBe(0);
    });
  });

  describe("past_due", () => {
    it("returns past_due for status=past_due", () => {
      const subs: RawSubscription[] = [{ status: "past_due", plan: "pro" }];
      const result = computeSubscriptionStatus(subs, 10, 3);
      expect(result.type).toBe("past_due");
      expect(result.plan).toBe("pro");
    });

    it("returns past_due for status=unpaid", () => {
      const subs: RawSubscription[] = [{ status: "unpaid", plan: "basic" }];
      const result = computeSubscriptionStatus(subs, 10, 1);
      expect(result.type).toBe("past_due");
    });

    it("past_due still carries remainingQuota info", () => {
      const subs: RawSubscription[] = [{ status: "past_due", plan: "pro" }];
      const result = computeSubscriptionStatus(subs, 10, 4);
      expect(result.remainingQuota).toBe(6);
    });
  });
});

// ---------------------------------------------------------------------------
// isBlockedFromCreating
// ---------------------------------------------------------------------------

describe("isBlockedFromCreating", () => {
  it("allows active subscriptions", () => {
    expect(isBlockedFromCreating("active")).toBe(false);
  });

  it("blocks no_subscription", () => {
    expect(isBlockedFromCreating("no_subscription")).toBe(true);
  });

  it("blocks quota_exhausted", () => {
    expect(isBlockedFromCreating("quota_exhausted")).toBe(true);
  });

  it("blocks expired", () => {
    expect(isBlockedFromCreating("expired")).toBe(true);
  });

  it("blocks past_due", () => {
    expect(isBlockedFromCreating("past_due")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBlockedFromEditing
// ---------------------------------------------------------------------------

describe("isBlockedFromEditing", () => {
  it("allows active subscriptions", () => {
    expect(isBlockedFromEditing("active")).toBe(false);
  });

  it("allows past_due (can still edit)", () => {
    expect(isBlockedFromEditing("past_due")).toBe(false);
  });

  it("allows quota_exhausted (can still edit existing)", () => {
    expect(isBlockedFromEditing("quota_exhausted")).toBe(false);
  });

  it("blocks no_subscription", () => {
    expect(isBlockedFromEditing("no_subscription")).toBe(true);
  });

  it("blocks expired", () => {
    expect(isBlockedFromEditing("expired")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBlockedFromPublishing
// ---------------------------------------------------------------------------

describe("isBlockedFromPublishing", () => {
  it("allows active subscriptions to publish", () => {
    expect(isBlockedFromPublishing("active")).toBe(false);
  });

  it("blocks past_due from publishing", () => {
    expect(isBlockedFromPublishing("past_due")).toBe(true);
  });

  it("blocks no_subscription from publishing", () => {
    expect(isBlockedFromPublishing("no_subscription")).toBe(true);
  });

  it("blocks quota_exhausted from publishing", () => {
    expect(isBlockedFromPublishing("quota_exhausted")).toBe(true);
  });

  it("blocks expired from publishing", () => {
    expect(isBlockedFromPublishing("expired")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isUIBlocked (dashboard "new listing" button state)
// ---------------------------------------------------------------------------

describe("isUIBlocked", () => {
  it("is NOT blocked for active", () => {
    expect(isUIBlocked("active")).toBe(false);
  });

  it("is blocked for no_subscription", () => {
    expect(isUIBlocked("no_subscription")).toBe(true);
  });

  it("is blocked for quota_exhausted", () => {
    expect(isUIBlocked("quota_exhausted")).toBe(true);
  });

  it("is blocked for expired", () => {
    expect(isUIBlocked("expired")).toBe(true);
  });

  it("is blocked for past_due", () => {
    expect(isUIBlocked("past_due")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBanned
// ---------------------------------------------------------------------------

describe("isBanned", () => {
  it("returns true when banned is true", () => {
    expect(isBanned(true)).toBe(true);
  });

  it("returns false when banned is false", () => {
    expect(isBanned(false)).toBe(false);
  });

  it("returns false when banned is null (matches Prisma { not: true } behaviour)", () => {
    expect(isBanned(null)).toBe(false);
  });

  it("returns false when banned is undefined", () => {
    expect(isBanned(undefined)).toBe(false);
  });
});
