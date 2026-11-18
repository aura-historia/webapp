import {
    SUBSCRIPTION_TYPES,
    type SubscriptionType,
} from "@/data/internal/account/SubscriptionType.ts";

/**
 * What a pricing card's call to action offers the visitor:
 * - `get-started` / `subscribe`: signed out, or the current plan is not known yet.
 * - `current`: the visitor's own plan; shown as a status, not an action.
 * - `upgrade`: a plan above the current one.
 * - `switch`: a plan below the current one.
 */
export type PricingCta = "get-started" | "subscribe" | "current" | "upgrade" | "switch";

/** The call to action for a plan card, given the signed-in visitor's plan (if known). */
export function pricingCtaFor(tier: SubscriptionType, currentPlan?: SubscriptionType): PricingCta {
    if (!currentPlan) {
        return tier === "free" ? "get-started" : "subscribe";
    }

    const rank = SUBSCRIPTION_TYPES.indexOf(tier);
    const currentRank = SUBSCRIPTION_TYPES.indexOf(currentPlan);

    if (rank === currentRank) return "current";
    return rank > currentRank ? "upgrade" : "switch";
}
