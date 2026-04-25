import type { UserTierData } from "@/client";

export const SUBSCRIPTION_TYPES = ["free", "pro", "ultimate"] as const;

export type SubscriptionType = (typeof SUBSCRIPTION_TYPES)[number];

export const SUBSCRIPTION_TYPE_TRANSLATION_KEYS: Record<SubscriptionType, string> = {
    free: "landingPage.pricing.free.name",
    pro: "landingPage.pricing.pro.name",
    ultimate: "landingPage.pricing.ultimate.name",
};

export function parseSubscriptionType(userTier?: string): SubscriptionType {
    const uppercasedUserTier = userTier?.toUpperCase() ?? "FREE";

    switch (uppercasedUserTier) {
        case "FREE":
            return "free";
        case "PRO":
            return "pro";
        case "ULTIMATE":
            return "ultimate";
        default:
            return "free";
    }
}

export function mapToBackendUserTier(
    subscriptionType?: SubscriptionType,
): UserTierData | undefined {
    if (!subscriptionType) return undefined;

    switch (subscriptionType) {
        case "free":
            return "FREE";
        case "pro":
            return "PRO";
        case "ultimate":
            return "ULTIMATE";
    }
}
