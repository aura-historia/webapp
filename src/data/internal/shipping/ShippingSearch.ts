import type {
    AcceptShippingDestinationData,
    ShippingMatchValuationData,
    ShippingSearchData,
} from "@/client";
import { type Currency, isCurrency } from "@/data/internal/common/Currency.ts";
import {
    type CountryCode,
    GEOGRAPHIC_REFERENCE_RELEASE,
    type GeographicReferenceRelease,
    parseCountryCode,
    parseGeographicReferenceRelease,
} from "@/data/internal/geography/GeographicCodes.ts";
import { isMinorUnitAmount } from "@/data/internal/shipping/ShippingValues.ts";

/*
 * The shipping predicate of listing search and saved search filters, independent of item
 * `geography` and of the browsing destination. Country, service and maximum must belong to one
 * advertised offer; absence from results never proves that a listing does not ship. Search never
 * sorts by shipping price and never totals item and shipping prices.
 */

export const SHIPPING_SEARCH_INTERPRETATIONS = [
    /** Compares the advertised source currency; only fixed or denominated free per-item prices. */
    "WHOLE_COUNTRY_PER_ITEM_V1",
    /** Compares backend-converted amounts in the maximum's currency (pinned FX snapshot). */
    "WHOLE_COUNTRY_PER_ITEM_FX_V1",
] as const;
export type ShippingSearchInterpretation = (typeof SHIPPING_SEARCH_INTERPRETATIONS)[number];

export type ShippingSearchMaximum = {
    /** Inclusive maximum per item in minor units of `currency`. */
    readonly amount: number;
    readonly currency: Currency;
};

export type ShippingSearch = {
    /** Whole-country destination; absent selects no country. */
    readonly country?: CountryCode;
    readonly referenceRelease: GeographicReferenceRelease;
    readonly interpretation: ShippingSearchInterpretation;
    /** Exact advertised service code; requires `country`. */
    readonly service?: string;
    /** Requires `country`; the FX interpretation requires it. */
    readonly maximumPerItem?: ShippingSearchMaximum;
    /** `true` requires independently definite offered collection. */
    readonly collectionOffered?: true;
};

/** A stored predicate this app cannot show or reproduce; keep it or remove it as a whole. */
export const UNSUPPORTED_SHIPPING_SEARCH = "UNSUPPORTED";
export type UnsupportedShippingSearch = typeof UNSUPPORTED_SHIPPING_SEARCH;

export type ShippingSearchValidationError =
    | "EMPTY"
    | "SERVICE_WITHOUT_COUNTRY"
    | "MAXIMUM_WITHOUT_COUNTRY"
    | "FX_WITHOUT_MAXIMUM"
    | "INVALID_SERVICE"
    | "INVALID_MAXIMUM";

/** Mirrors the backend's predicate rules so an invalid predicate is never sent. */
export function validateShippingSearch(
    search: ShippingSearch,
): ShippingSearchValidationError | undefined {
    if (!search.country && !search.collectionOffered) return "EMPTY";
    if (search.service !== undefined) {
        if (search.service.trim() === "") return "INVALID_SERVICE";
        if (!search.country) return "SERVICE_WITHOUT_COUNTRY";
    }
    if (search.maximumPerItem !== undefined) {
        if (
            !isMinorUnitAmount(search.maximumPerItem.amount) ||
            !isCurrency(search.maximumPerItem.currency)
        ) {
            return "INVALID_MAXIMUM";
        }
        if (!search.country) return "MAXIMUM_WITHOUT_COUNTRY";
    }
    if (search.interpretation === "WHOLE_COUNTRY_PER_ITEM_FX_V1" && !search.maximumPerItem) {
        return "FX_WITHOUT_MAXIMUM";
    }
    return undefined;
}

/** The complete predicate, with its release and interpretation stated explicitly. */
export function mapToBackendShippingSearch(search: ShippingSearch): ShippingSearchData {
    return {
        ...(search.country ? { destination: { kind: "COUNTRY", country: search.country } } : {}),
        referenceRelease: search.referenceRelease,
        interpretation: search.interpretation,
        ...(search.service !== undefined ? { service: search.service } : {}),
        ...(search.maximumPerItem
            ? {
                  maximumPerItem: {
                      amount: search.maximumPerItem.amount,
                      currency: search.maximumPerItem.currency,
                  },
              }
            : {}),
        ...(search.collectionOffered ? { collectionOffered: true } : {}),
    };
}

/**
 * Reads a stored or echoed predicate. Any value this app does not recognize makes the whole
 * predicate `UNSUPPORTED` rather than a narrower one that would silently match more. A predicate
 * that selects nothing (`NONE` without collection) is no predicate.
 */
export function mapToShippingSearch(
    data: ShippingSearchData | null | undefined,
): ShippingSearch | UnsupportedShippingSearch | undefined {
    if (data == null) return undefined;
    const destination = data.destination as { kind?: unknown; country?: unknown } | undefined;
    let country: CountryCode | undefined;
    if (destination?.kind === "COUNTRY") {
        country = parseCountryCode(destination.country);
        if (!country) return UNSUPPORTED_SHIPPING_SEARCH;
    } else if (destination != null && destination.kind !== "NONE") {
        return UNSUPPORTED_SHIPPING_SEARCH;
    }

    const referenceRelease =
        data.referenceRelease == null
            ? GEOGRAPHIC_REFERENCE_RELEASE
            : parseGeographicReferenceRelease(data.referenceRelease);
    const interpretation =
        data.interpretation == null
            ? "WHOLE_COUNTRY_PER_ITEM_V1"
            : SHIPPING_SEARCH_INTERPRETATIONS.find((value) => value === data.interpretation);
    const maximum = data.maximumPerItem;
    if (
        !referenceRelease ||
        !interpretation ||
        (data.service != null && typeof data.service !== "string") ||
        (maximum != null &&
            (!isMinorUnitAmount(maximum.amount) || !isCurrency(maximum.currency))) ||
        (data.collectionOffered != null && typeof data.collectionOffered !== "boolean")
    ) {
        return UNSUPPORTED_SHIPPING_SEARCH;
    }

    if (!country && data.collectionOffered !== true) return undefined;
    const search: ShippingSearch = {
        ...(country ? { country } : {}),
        referenceRelease,
        interpretation,
        ...(data.service != null ? { service: data.service } : {}),
        ...(maximum != null
            ? { maximumPerItem: { amount: maximum.amount, currency: maximum.currency } }
            : {}),
        ...(data.collectionOffered === true ? { collectionOffered: true as const } : {}),
    };
    return validateShippingSearch(search) === undefined ? search : UNSUPPORTED_SHIPPING_SEARCH;
}

/**
 * The saved-filter guard that the authored country equals an owned address's or the selected
 * preference's country. Only the country is saved; the reference never is.
 */
export type ShippingDestinationAcceptance =
    | { readonly kind: "ADDRESS"; readonly addressId: string }
    | { readonly kind: "PREFERENCE" };

export function mapToBackendAcceptShippingDestination(
    acceptance: ShippingDestinationAcceptance,
): AcceptShippingDestinationData {
    return acceptance.kind === "ADDRESS"
        ? { kind: "ADDRESS", addressId: acceptance.addressId }
        : { kind: "PREFERENCE" };
}

/**
 * The immutable FX basis a saved-search shipping match was decided on, separate from the item's
 * price valuation. Later captures or filter edits never rewrite it.
 */
export type ShippingMatchValuation = {
    readonly interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1";
    readonly fxRateId: string;
    readonly capturedAt: Date;
    readonly maximumPerItem: ShippingSearchMaximum;
};

export function mapToShippingMatchValuation(
    data: ShippingMatchValuationData | null | undefined,
): ShippingMatchValuation | undefined {
    if (data == null) return undefined;
    const capturedAt = new Date(data.capturedAt);
    const maximum = data.maximumPerItem;
    if (
        data.interpretation !== "WHOLE_COUNTRY_PER_ITEM_FX_V1" ||
        typeof data.fxRateId !== "string" ||
        data.fxRateId === "" ||
        Number.isNaN(capturedAt.getTime()) ||
        maximum == null ||
        !isMinorUnitAmount(maximum.amount) ||
        !isCurrency(maximum.currency)
    ) {
        return undefined;
    }
    return {
        interpretation: data.interpretation,
        fxRateId: data.fxRateId,
        capturedAt,
        maximumPerItem: { amount: maximum.amount, currency: maximum.currency },
    };
}

/**
 * A stable, order-independent query-key part for a predicate, so equal predicates share a cache
 * entry and every member that changes results changes the key.
 */
export function shippingSearchQueryKeyPart(search: ShippingSearch | undefined) {
    if (!search) return null;
    return [
        search.country ?? null,
        search.referenceRelease,
        search.interpretation,
        search.service ?? null,
        search.maximumPerItem?.amount ?? null,
        search.maximumPerItem?.currency ?? null,
        search.collectionOffered ?? false,
    ] as const;
}
