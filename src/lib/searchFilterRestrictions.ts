import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SubscriptionType } from "@/data/internal/account/SubscriptionType.ts";
import { AUTHENTICITIES } from "@/data/internal/quality-indicators/Authenticity.ts";
import { CONDITIONS } from "@/data/internal/quality-indicators/Condition.ts";
import { PROVENANCES } from "@/data/internal/quality-indicators/Provenance.ts";
import { RESTORATIONS } from "@/data/internal/quality-indicators/Restoration.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

type FilterGroup = {
    formFields: (keyof SearchFilterArguments)[];
    displayNameKey: string;
};

const FILTER_GROUPS_RESTRICTED_FOR_FREE: FilterGroup[] = [
    { formFields: ["shopType"], displayNameKey: "search.filter.shopType" },
    { formFields: ["merchant", "excludeMerchant"], displayNameKey: "search.filter.merchants" },
    {
        formFields: ["auctionDateFrom", "auctionDateTo"],
        displayNameKey: "search.filter.auctionDate",
    },
    {
        formFields: ["creationDateFrom", "creationDateTo"],
        displayNameKey: "search.filter.creationDate",
    },
    { formFields: ["updateDateFrom", "updateDateTo"], displayNameKey: "search.filter.updateDate" },
    {
        formFields: [
            "originYearMin",
            "originYearMax",
            "authenticity",
            "condition",
            "provenance",
            "restoration",
        ],
        displayNameKey: "search.filter.qualityIndicators",
    },
];

// Default (= "no filter applied") values for array fields.
// If the current value equals the full default, the filter is considered inactive.
const FIELD_DEFAULTS: Partial<Record<keyof SearchFilterArguments, readonly unknown[]>> = {
    authenticity: AUTHENTICITIES,
    condition: CONDITIONS,
    provenance: PROVENANCES,
    restoration: RESTORATIONS,
    shopType: SHOP_TYPES,
};

/** Returns true if the given field has a non-default, non-empty value in the search args. */
function fieldHasValue(args: SearchFilterArguments, field: keyof SearchFilterArguments): boolean {
    const value = args[field];
    if (value == null) return false;
    if (Array.isArray(value)) {
        if (value.length === 0) return false;
        const defaultValues = FIELD_DEFAULTS[field];
        // All options selected = same as no filter → not active
        return !(defaultValues && value.length === defaultValues.length);
    }
    return true;
}

/** Returns true if at least one field of the group is set in the search args. */
function filterGroupIsActive(group: FilterGroup, args: SearchFilterArguments): boolean {
    return group.formFields.some((field) => fieldHasValue(args, field));
}

/** Returns true if the subscription type has filter restrictions (= free or unknown). */
function subscriptionHasFilterRestrictions(
    subscriptionType: SubscriptionType | undefined,
): boolean {
    return subscriptionType === "free" || subscriptionType == null;
}

/**
 * Returns the display name translation keys of all filter groups
 * that are currently active but not allowed for the user's subscription.
 *
 * Use this to warn the user BEFORE saving, listing which filters will be removed.
 * Returns [] if the user has no restrictions (pro / ultimate).
 */
export function getActiveRestrictedFilterLabels(
    args: SearchFilterArguments,
    subscriptionType: SubscriptionType | undefined,
): string[] {
    if (!subscriptionHasFilterRestrictions(subscriptionType)) return [];

    return FILTER_GROUPS_RESTRICTED_FOR_FREE.filter((group) =>
        filterGroupIsActive(group, args),
    ).map((group) => group.displayNameKey);
}

/**
 * Returns a cleaned copy of `args` with all FREE-restricted fields removed.
 * Use this right before saving to ensure the API call won't be rejected.
 *
 * Returns `args` unchanged if the user has no restrictions (pro / ultimate).
 */
export function stripRestrictedFilters(
    args: SearchFilterArguments,
    subscriptionType: SubscriptionType | undefined,
): SearchFilterArguments {
    if (!subscriptionHasFilterRestrictions(subscriptionType)) return args;

    const allRestrictedFields = FILTER_GROUPS_RESTRICTED_FOR_FREE.flatMap(
        (group) => group.formFields,
    );
    const cleanedArgs = { ...args };
    for (const field of allRestrictedFields) delete cleanedArgs[field];
    return cleanedArgs;
}
