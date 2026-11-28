import type { ShippingCurrencyCode } from "@/client";
import { type Currency, isCurrency } from "@/data/internal/common/Currency.ts";
import {
    type CountryCode,
    type GeographicReferenceRelease,
    parseCountryCode,
    parseGeographicReferenceRelease,
    parseSubdivisionCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";

/*
 * Leaf values shared by the consumer shipping reads (`ListingShipping.ts`) and the protected
 * management and write contracts (`ShippingTerms.ts`). Each parser returns `undefined` for a
 * value this app does not recognize; callers decide whether that drops an optional fact
 * (consumer reads) or marks the whole management view unsupported. Unknown vocabulary never
 * becomes a permission, a price or a narrower area.
 */

export const SHIPPING_ELIGIBILITIES = [
    "OFFERED",
    "NOT_OFFERED",
    "SUBJECT_TO_CONFIRMATION",
] as const;
/** Only `NOT_OFFERED` is a negative; an absent eligibility is unknown or unasserted. */
export type ShippingEligibility = (typeof SHIPPING_ELIGIBILITIES)[number];

export const SHIPPING_CHARGE_BASES = [
    "PER_ITEM",
    "PER_LOT",
    "PER_SHIPMENT",
    "PER_SELLER_ORDER",
] as const;
export type ShippingChargeBasis = (typeof SHIPPING_CHARGE_BASES)[number];

export const SHIPPING_AMOUNT_SCOPES = ["ITEM", "LOT", "SHIPMENT", "SELLER_ORDER"] as const;
export type ShippingAmountScope = (typeof SHIPPING_AMOUNT_SCOPES)[number];

export const SHIPPING_RATE_COMPONENTS = [
    "TRANSPORT",
    "PACKING",
    "INSURANCE",
    "HANDLING",
    "INSTALLATION",
    "IMPORT_DUTY",
    "TAX",
] as const;
export type ShippingRateComponent = (typeof SHIPPING_RATE_COMPONENTS)[number];
export type ShippingComponentInclusion = "INCLUDED" | "EXCLUDED";
/** Absence of a component is no inclusion assertion. */
export type ShippingRateComponents = Readonly<
    Partial<Record<ShippingRateComponent, ShippingComponentInclusion>>
>;

export const SHIPPING_FEATURES = [
    "TRACKING",
    "INSURED",
    "WHITE_GLOVE",
    "INSTALLATION",
    "PACKING",
] as const;
export type ShippingFeature = (typeof SHIPPING_FEATURES)[number];

export const SHIPPING_TIME_UNITS = ["HOURS", "DAYS", "WEEKS"] as const;
export type ShippingTimeUnit = (typeof SHIPPING_TIME_UNITS)[number];
export const SHIPPING_TIME_BASES = ["CALENDAR", "BUSINESS"] as const;
export type ShippingTimeBasis = (typeof SHIPPING_TIME_BASES)[number];
export const SHIPPING_TIME_TRIGGERS = [
    "ORDER",
    "ORDER_CONFIRMATION",
    "PAYMENT",
    "DISPATCH",
    "READY_FOR_COLLECTION",
] as const;
export type ShippingTimeTrigger = (typeof SHIPPING_TIME_TRIGGERS)[number];

export const SHIPPING_COVERAGE_COMPLETENESS = ["PARTIAL", "COMPLETE"] as const;
/** Only `COMPLETE` coverage can establish a negative from no matching area. */
export type ShippingCoverageCompleteness = (typeof SHIPPING_COVERAGE_COMPLETENESS)[number];

export const SHIPPING_COLLECTION_DEPENDENCIES = ["INDEPENDENT", "SHIPPING"] as const;
export type ShippingCollectionDependency = (typeof SHIPPING_COLLECTION_DEPENDENCIES)[number];

export function parseEnumValue<const T extends readonly string[]>(
    values: T,
    value: unknown,
): T[number] | undefined {
    return typeof value === "string" && values.includes(value) ? value : undefined;
}

export function isMinorUnitAmount(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function isPositiveCount(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

/** An advertised amount in integer minor units of its own currency; never a quote or total. */
export type ShippingMoney = {
    readonly amountMinor: number;
    readonly currency: Currency;
};

export function parseShippingMoney(
    value: { amount_minor: number; currency: ShippingCurrencyCode } | null | undefined,
): ShippingMoney | undefined {
    if (value == null || !isMinorUnitAmount(value.amount_minor) || !isCurrency(value.currency)) {
        return undefined;
    }
    return { amountMinor: value.amount_minor, currency: value.currency };
}

export function toBackendShippingMoney(money: ShippingMoney): {
    amount_minor: number;
    currency: ShippingCurrencyCode;
} {
    return { amount_minor: money.amountMinor, currency: money.currency };
}

/** Ordered inclusive bounds; `minimum` never exceeds `maximum`. */
export type ShippingQuantity = { readonly minimum: number; readonly maximum: number };

export function parseShippingQuantity(
    value: { minimum: number; maximum: number } | null | undefined,
): ShippingQuantity | undefined {
    if (
        value == null ||
        !isPositiveCount(value.minimum) ||
        !isPositiveCount(value.maximum) ||
        value.minimum > value.maximum
    ) {
        return undefined;
    }
    return { minimum: value.minimum, maximum: value.maximum };
}

/** A condition on a qualifying amount at its explicit scope, in its exact currency. */
export type ShippingThreshold = {
    readonly minimum: ShippingMoney;
    readonly scope: ShippingAmountScope;
};

export function parseShippingThreshold(
    value:
        | {
              minimum: { amount_minor: number; currency: ShippingCurrencyCode };
              scope: string;
          }
        | null
        | undefined,
): ShippingThreshold | undefined {
    if (value == null) return undefined;
    const minimum = parseShippingMoney(value.minimum);
    const scope = parseEnumValue(SHIPPING_AMOUNT_SCOPES, value.scope);
    return minimum && scope ? { minimum, scope } : undefined;
}

export type ShippingPostalForm =
    | { readonly kind: "EXACT"; readonly code: string }
    | { readonly kind: "GERMAN_PREFIX"; readonly prefix: string }
    | { readonly kind: "GERMAN_RANGE"; readonly first: string; readonly last: string };

/**
 * One ordered area of a coverage. Postal and subdivision areas keep their exact codes; no
 * hierarchy, aliases or successor areas are inferred.
 */
export type ShippingArea =
    | { readonly kind: "ANYWHERE" }
    | { readonly kind: "DOMESTIC" }
    | {
          readonly kind: "COUNTRY";
          readonly code: CountryCode;
          readonly referenceRelease: GeographicReferenceRelease;
      }
    | {
          readonly kind: "SUBDIVISION";
          readonly code: SubdivisionCode;
          readonly referenceRelease: GeographicReferenceRelease;
      }
    | {
          readonly kind: "POSTAL";
          readonly version: "POSTAL_RULE_V1";
          readonly country: CountryCode;
          readonly referenceRelease: GeographicReferenceRelease;
          readonly form: ShippingPostalForm;
      }
    /** A seller assertion the backend could not interpret; never a match. */
    | { readonly kind: "UNRESOLVED"; readonly assertion: string };

type ShippingAreaDto =
    | { kind: "ANYWHERE" }
    | { kind: "DOMESTIC" }
    | { kind: "COUNTRY"; code: string; reference_release: string }
    | { kind: "SUBDIVISION"; code: string; reference_release: string }
    | {
          kind: "POSTAL";
          version: string;
          country: string;
          reference_release: string;
          form:
              | { kind: "EXACT"; code: string }
              | { kind: "GERMAN_PREFIX"; prefix: string }
              | { kind: "GERMAN_RANGE"; first: string; last: string };
      }
    | { kind: "UNRESOLVED"; assertion: string };

function parsePostalForm(form: unknown): ShippingPostalForm | undefined {
    if (typeof form !== "object" || form === null) return undefined;
    const value = form as Record<string, unknown>;
    switch (value.kind) {
        case "EXACT":
            return typeof value.code === "string" ? { kind: "EXACT", code: value.code } : undefined;
        case "GERMAN_PREFIX":
            return typeof value.prefix === "string"
                ? { kind: "GERMAN_PREFIX", prefix: value.prefix }
                : undefined;
        case "GERMAN_RANGE":
            return typeof value.first === "string" && typeof value.last === "string"
                ? { kind: "GERMAN_RANGE", first: value.first, last: value.last }
                : undefined;
        default:
            return undefined;
    }
}

/** `undefined` for an area kind, code or release this app cannot interpret. */
export function parseShippingArea(area: ShippingAreaDto): ShippingArea | undefined {
    const value = area as { kind?: unknown } & Record<string, unknown>;
    switch (value.kind) {
        case "ANYWHERE":
        case "DOMESTIC":
            return { kind: value.kind };
        case "COUNTRY": {
            const code = parseCountryCode(value.code);
            const referenceRelease = parseGeographicReferenceRelease(value.reference_release);
            return code && referenceRelease
                ? { kind: "COUNTRY", code, referenceRelease }
                : undefined;
        }
        case "SUBDIVISION": {
            const code = parseSubdivisionCode(value.code);
            const referenceRelease = parseGeographicReferenceRelease(value.reference_release);
            return code && referenceRelease
                ? { kind: "SUBDIVISION", code, referenceRelease }
                : undefined;
        }
        case "POSTAL": {
            const country = parseCountryCode(value.country);
            const referenceRelease = parseGeographicReferenceRelease(value.reference_release);
            const form = parsePostalForm(value.form);
            return value.version === "POSTAL_RULE_V1" && country && referenceRelease && form
                ? { kind: "POSTAL", version: "POSTAL_RULE_V1", country, referenceRelease, form }
                : undefined;
        }
        case "UNRESOLVED":
            return typeof value.assertion === "string"
                ? { kind: "UNRESOLVED", assertion: value.assertion }
                : undefined;
        default:
            return undefined;
    }
}

export function toBackendShippingArea(area: ShippingArea): ShippingAreaDto & {
    reference_release?: GeographicReferenceRelease;
} {
    switch (area.kind) {
        case "ANYWHERE":
        case "DOMESTIC":
            return { kind: area.kind };
        case "COUNTRY":
        case "SUBDIVISION":
            return { kind: area.kind, code: area.code, reference_release: area.referenceRelease };
        case "POSTAL":
            return {
                kind: "POSTAL",
                version: area.version,
                country: area.country,
                reference_release: area.referenceRelease,
                form: { ...area.form },
            };
        case "UNRESOLVED":
            return { kind: "UNRESOLVED", assertion: area.assertion };
    }
}

/** Who arranges or performs a service. A Party reference is an opaque ID. */
export type ShippingActor =
    | { readonly kind: "LISTING_SOURCE" }
    | { readonly kind: "BUYER" }
    | { readonly kind: "PARTY"; readonly partyId: string };

export function parseShippingActor(
    actor: { kind: string; party_id?: string } | null | undefined,
): ShippingActor | undefined {
    if (actor == null) return undefined;
    switch (actor.kind) {
        case "LISTING_SOURCE":
        case "BUYER":
            return { kind: actor.kind };
        case "PARTY":
            return typeof actor.party_id === "string"
                ? { kind: "PARTY", partyId: actor.party_id }
                : undefined;
        default:
            return undefined;
    }
}

export function toBackendShippingActor(
    actor: ShippingActor,
): { kind: "LISTING_SOURCE" } | { kind: "BUYER" } | { kind: "PARTY"; party_id: string } {
    return actor.kind === "PARTY"
        ? { kind: "PARTY", party_id: actor.partyId }
        : { kind: actor.kind };
}

/** Parses a list where every entry must be recognized; `undefined` if any entry is not. */
export function parseAll<TInput, TOutput>(
    values: readonly TInput[],
    parse: (value: TInput) => TOutput | undefined,
): TOutput[] | undefined {
    const parsed: TOutput[] = [];
    for (const value of values) {
        const result = parse(value);
        if (result === undefined) return undefined;
        parsed.push(result);
    }
    return parsed;
}

/** Keeps recognized entries of a closed vocabulary and drops the rest. */
export function parseKnownValues<const T extends readonly string[]>(
    vocabulary: T,
    values: readonly unknown[] | null | undefined,
): T[number][] {
    if (!Array.isArray(values)) return [];
    return values.flatMap((value) => {
        const parsed = parseEnumValue(vocabulary, value);
        return parsed === undefined ? [] : [parsed];
    });
}

/** `undefined` unless every key is a known component with a known inclusion. */
export function parseShippingRateComponents(
    components: Record<string, string> | null | undefined,
): ShippingRateComponents | undefined {
    if (components == null) return {};
    const result: Partial<Record<ShippingRateComponent, ShippingComponentInclusion>> = {};
    for (const [key, inclusion] of Object.entries(components)) {
        const component = parseEnumValue(SHIPPING_RATE_COMPONENTS, key);
        if (!component || (inclusion !== "INCLUDED" && inclusion !== "EXCLUDED")) return undefined;
        result[component] = inclusion;
    }
    return result;
}
