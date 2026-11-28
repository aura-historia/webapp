import type {
    DeliveryAssessmentAttribution,
    DeliveryAssessmentExplanations,
    DeliveryAssessmentGeography,
    DeliveryAssessmentOption,
    DeliveryAssessmentRequiredInputs,
    DeliveryAssessmentSummaryData,
    ListingShippingApplicabilityData,
    ListingShippingCollectionData,
    ListingShippingCoverageData,
    ListingShippingDetailData,
    ListingShippingLeadTimesData,
    ListingShippingPolicyData,
    ListingShippingPriceData,
    ListingShippingRateData,
    ListingShippingServiceData,
    ListingShippingSummaryData,
    ListingShippingTermsData,
    ListingShippingTimeData,
    ListingShippingZoneData,
    PersonalizedShippingDetailData,
    PersonalizedShippingSummaryData,
    ShippingDisplayData,
    ShippingPricePreviewData,
} from "@/client";
import { type Currency, isCurrency } from "@/data/internal/common/Currency.ts";
import {
    type CountryCode,
    type GeographicReferenceRelease,
    parseCountryCode,
    parseGeographicReferenceRelease,
    parseSubdivisionCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    type GeographyAttribution,
    mapToGeographyAttribution,
} from "@/data/internal/geography/GeographyAttribution.ts";
import {
    parseEnumValue,
    parseKnownValues,
    parseShippingActor,
    parseShippingArea,
    parseShippingMoney,
    parseShippingQuantity,
    parseShippingRateComponents,
    parseShippingThreshold,
    SHIPPING_AMOUNT_SCOPES,
    SHIPPING_CHARGE_BASES,
    SHIPPING_COLLECTION_DEPENDENCIES,
    SHIPPING_COVERAGE_COMPLETENESS,
    SHIPPING_ELIGIBILITIES,
    SHIPPING_FEATURES,
    SHIPPING_TIME_BASES,
    SHIPPING_TIME_TRIGGERS,
    SHIPPING_TIME_UNITS,
    type ShippingActor,
    type ShippingAmountScope,
    type ShippingArea,
    type ShippingChargeBasis,
    type ShippingCollectionDependency,
    type ShippingCoverageCompleteness,
    type ShippingEligibility,
    type ShippingFeature,
    type ShippingMoney,
    type ShippingQuantity,
    type ShippingRateComponents,
    type ShippingThreshold,
    type ShippingTimeBasis,
    type ShippingTimeTrigger,
    type ShippingTimeUnit,
} from "@/data/internal/shipping/ShippingValues.ts";

/*
 * Consumer shipping read models of listing responses. Collections (search, similar, watchlist,
 * saved-search matches, auction catalogue) carry the bounded summaries even when their item is
 * detail-shaped; single-listing reads (by ID or slug, watchlist PATCH) carry the details. The
 * public `item.shipping` is destination-independent; the private `userState.shipping` exists only
 * for a disclosed, permitted browsing destination.
 *
 * These projections never hold `null`: an absent fact is an absent member, and an object without
 * information is absent itself. A missing summary is never a no-shipping assertion, and only
 * `NOT_OFFERED` is a negative. Management revisions, profile IDs, the terms schema marker and
 * evidence never appear here (see `ShippingTerms.ts` for the protected contracts).
 */

export const SHIPPING_REQUIRED_INPUTS = [
    "DESTINATION",
    "DESTINATION_COUNTRY",
    "DESTINATION_SUBDIVISION",
    "POSTAL_CODE",
    "QUANTITY",
    "LOTS",
    "SHIPMENTS",
    "SELLER_ORDERS",
    "VARIANT",
] as const;
export type ShippingRequiredInput = (typeof SHIPPING_REQUIRED_INPUTS)[number];

export const SHIPPING_EXPLANATION_CODES = [
    "INCOMPLETE_COVERAGE",
    "UNRESOLVED_TERMS",
    "SHIPPING_UNDETERMINED",
    "NOT_ASSERTED",
] as const;

/** Bounded explanation of an undetermined outcome; determined outcomes carry none. */
export type ShippingExplanation =
    | { readonly code: "QUALIFYING_AMOUNT_REQUIRED"; readonly scope: ShippingAmountScope }
    | { readonly code: (typeof SHIPPING_EXPLANATION_CODES)[number] };

/**
 * An assessed outcome. Without `eligibility` it is undetermined, and `requiredInputs` and
 * `explanations` (each present only when non-empty) say why.
 */
export type ShippingOutcome = {
    readonly eligibility?: ShippingEligibility;
    readonly requiredInputs?: readonly ShippingRequiredInput[];
    readonly explanations?: readonly ShippingExplanation[];
};

/** Every advertised price kind. Free, on-request and external prices may assert a currency. */
export type ShippingPrice =
    | { readonly kind: "FREE"; readonly currency?: Currency }
    | { readonly kind: "FIXED"; readonly amount: ShippingMoney }
    | { readonly kind: "FROM"; readonly amount: ShippingMoney }
    | {
          readonly kind: "ESTIMATED_RANGE";
          readonly minimum: ShippingMoney;
          readonly maximum: ShippingMoney;
      }
    | { readonly kind: "EXTERNALLY_CALCULATED"; readonly currency?: Currency }
    | { readonly kind: "ON_REQUEST"; readonly currency?: Currency };

/** The arithmetic advertised charge for a known basis and count; browsing supplies none. */
export type ShippingCharge = Extract<ShippingPrice, { kind: "FIXED" | "FROM" | "ESTIMATED_RANGE" }>;

/**
 * Valuation of every requested-currency value in one shipping object (`displayPrice`, a
 * converted preview). Present only when a value was converted; same-currency reads have none.
 */
export type ShippingDisplayValuation = {
    readonly currency: Currency;
    readonly fxRateId: string;
    readonly capturedAt: Date;
};

export type ShippingRate = {
    /** The advertised source price. */
    readonly price: ShippingPrice;
    /** The backend's requested-currency value of a converted amount, valued by `display`. */
    readonly displayPrice?: ShippingPrice;
    readonly basis?: ShippingChargeBasis;
    readonly qualifyingScope?: ShippingAmountScope;
    readonly components?: ShippingRateComponents;
};

/**
 * Asserted conditions, all of which must hold. `hasUnsupportedConditions` marks a condition this
 * app could not read: the rule is conditional, never unconditional.
 */
export type ShippingConditions = {
    readonly class?: string;
    readonly variants?: readonly string[];
    readonly quantity?: ShippingQuantity;
    readonly threshold?: ShippingThreshold;
    readonly hasUnsupportedConditions?: true;
};

export type ShippingDuration = {
    readonly minimum: number;
    readonly maximum: number;
    readonly unit: ShippingTimeUnit;
    readonly basis?: ShippingTimeBasis;
    readonly trigger?: ShippingTimeTrigger;
};

/** Independent durations; never computed dates. */
export type ShippingLeadTimes = {
    readonly handling?: ShippingDuration;
    readonly transit?: ShippingDuration;
    readonly total?: ShippingDuration;
};

export type ListingShippingService = {
    readonly code: string;
    readonly applicability?: ShippingConditions;
    readonly eligibility?: ShippingEligibility;
    readonly rate?: ShippingRate;
    readonly leadTimes?: ShippingLeadTimes;
    readonly features?: readonly ShippingFeature[];
    readonly arranger?: ShippingActor;
    readonly performer?: ShippingActor;
};

/** An area this app cannot interpret keeps its place in the order and never matches. */
export type ListingShippingArea = ShippingArea | { readonly kind: "UNSUPPORTED" };

/** Zones are ordered: the first matching zone applies. */
export type ListingShippingZone = {
    readonly areas: readonly ListingShippingArea[];
    readonly applicability?: ShippingConditions;
    readonly services: readonly ListingShippingService[];
};

/** Exclusions precede zones. The dispatch origin is never disclosed. */
export type ListingShippingCoverage = {
    readonly referenceRelease: GeographicReferenceRelease;
    readonly completeness: ShippingCoverageCompleteness;
    readonly applicability?: ShippingConditions;
    readonly exclusions?: readonly ListingShippingArea[];
    readonly zones: readonly ListingShippingZone[];
};

/** `UNSUPPORTED` is a policy this app cannot read; it asserts nothing. */
export type ListingShippingPolicy =
    | { readonly kind: "PROHIBITED" }
    | { readonly kind: "COVERAGE"; readonly coverage: ListingShippingCoverage }
    | { readonly kind: "UNSUPPORTED" };

export type ShippingCollectionArrangement =
    | { readonly kind: "BY_APPOINTMENT" }
    | { readonly kind: "CONTACT_TO_ARRANGE" }
    | { readonly kind: "WINDOW"; readonly duration: ShippingDuration };

/** Collection sites are never disclosed. */
export type ListingShippingCollectionTerms = {
    readonly applicability?: ShippingConditions;
    readonly dependency: ShippingCollectionDependency;
    readonly eligibility?: ShippingEligibility;
    readonly arrangement?: ShippingCollectionArrangement;
};

/** Effective advertised terms of a single listing read; never a quote. */
export type ListingShippingTerms = {
    readonly shipping?: ListingShippingPolicy;
    readonly collection?: ListingShippingCollectionTerms;
};

/** Public, destination-independent shipping of a collection item. */
export type ListingShippingSummary = ShippingOutcome & {
    readonly collection?: ShippingOutcome;
};

/** Public, destination-independent shipping of a single listing read. */
export type ListingShippingDetail = ShippingOutcome & {
    readonly terms?: ListingShippingTerms;
    readonly display?: ShippingDisplayValuation;
};

/**
 * One advertised rate of a service that establishes the summarized eligibility in the
 * destination's zone, in the requested currency when convertible. Never a total, a quote, a
 * cheapest rate or proof that a shipping filter matched.
 */
export type ShippingPricePreview = {
    readonly service: string;
    readonly basis: ShippingChargeBasis;
    readonly price: ShippingPrice;
};

/** Private assessment of a collection item for the viewer's selected destination. */
export type PersonalizedShippingSummary = ShippingOutcome & {
    readonly pricePreview?: ShippingPricePreview;
    readonly collection?: ShippingOutcome;
    /** Provider attribution that must accompany the assessment wherever it is shown. */
    readonly attribution?: GeographyAttribution;
    readonly display?: ShippingDisplayValuation;
};

/** Minimal effective destination facts; never a street, coordinates or address identity. */
export type ShippingDestination = {
    readonly referenceRelease: GeographicReferenceRelease;
    readonly country?: CountryCode;
    readonly subdivision?: SubdivisionCode;
    readonly postalCode?: string;
};

/** A service of the destination's zone that its conditions do not definitely exclude. */
export type ShippingOption = ShippingOutcome & {
    readonly service: string;
    readonly rate?: ShippingRate;
    /** Source-currency charge, only when every count its basis needs is known. */
    readonly charge?: ShippingCharge;
};

/** Private assessment of a single listing for the viewer's selected destination. */
export type PersonalizedShippingDetail = ShippingOutcome & {
    readonly destination: ShippingDestination;
    readonly attribution?: GeographyAttribution;
    readonly options?: readonly ShippingOption[];
    readonly collection?: ShippingOutcome;
    readonly display?: ShippingDisplayValuation;
};

function nonEmpty<T>(values: readonly T[]): readonly T[] | undefined {
    return values.length > 0 ? values : undefined;
}

function compact<T extends object>(value: T): T | undefined {
    return Object.values(value).some((member) => member !== undefined)
        ? (Object.fromEntries(
              Object.entries(value).filter(([, member]) => member !== undefined),
          ) as T)
        : undefined;
}

function parseExplanation(value: unknown): ShippingExplanation | undefined {
    if (typeof value !== "object" || value === null) return undefined;
    const explanation = value as { code?: unknown; scope?: unknown };
    if (explanation.code === "QUALIFYING_AMOUNT_REQUIRED") {
        const scope = parseEnumValue(SHIPPING_AMOUNT_SCOPES, explanation.scope);
        return scope ? { code: "QUALIFYING_AMOUNT_REQUIRED", scope } : undefined;
    }
    const code = parseEnumValue(SHIPPING_EXPLANATION_CODES, explanation.code);
    return code ? { code } : undefined;
}

/**
 * An unknown eligibility value is read as undetermined, never as an offer. Unknown required
 * inputs and explanation codes are dropped; an emptied list is absent.
 */
function mapOutcome(value: {
    eligibility?: string;
    requiredInputs?: DeliveryAssessmentRequiredInputs;
    explanations?: DeliveryAssessmentExplanations;
}): ShippingOutcome {
    const eligibility = parseEnumValue(SHIPPING_ELIGIBILITIES, value.eligibility);
    const requiredInputs = nonEmpty(
        parseKnownValues(SHIPPING_REQUIRED_INPUTS, value.requiredInputs),
    );
    const explanations = nonEmpty(
        (value.explanations ?? []).flatMap((entry) => {
            const parsed = parseExplanation(entry);
            return parsed ? [parsed] : [];
        }),
    );
    return compact({ eligibility, requiredInputs, explanations }) ?? {};
}

function mapCollectionOutcome(
    value: DeliveryAssessmentSummaryData | undefined,
): ShippingOutcome | undefined {
    return value == null ? undefined : compact(mapOutcome(value));
}

/** `undefined` for an unknown kind or an unreadable amount or currency: the price is unknown. */
export function mapShippingPrice(
    price: ListingShippingPriceData | null | undefined,
): ShippingPrice | undefined {
    if (price == null) return undefined;
    const value = price as { kind?: unknown } & Record<string, unknown>;
    switch (value.kind) {
        case "FREE":
        case "EXTERNALLY_CALCULATED":
        case "ON_REQUEST": {
            if (value.currency == null) return { kind: value.kind };
            return isCurrency(value.currency)
                ? { kind: value.kind, currency: value.currency }
                : undefined;
        }
        case "FIXED":
        case "FROM": {
            const amount = parseShippingMoney(value.amount as never);
            return amount ? { kind: value.kind, amount } : undefined;
        }
        case "ESTIMATED_RANGE": {
            const minimum = parseShippingMoney(value.minimum as never);
            const maximum = parseShippingMoney(value.maximum as never);
            return minimum &&
                maximum &&
                minimum.currency === maximum.currency &&
                minimum.amountMinor <= maximum.amountMinor
                ? { kind: "ESTIMATED_RANGE", minimum, maximum }
                : undefined;
        }
        default:
            return undefined;
    }
}

function mapCharge(charge: DeliveryAssessmentOption["charge"]): ShippingCharge | undefined {
    const price = mapShippingPrice(charge as ListingShippingPriceData | undefined);
    return price?.kind === "FIXED" || price?.kind === "FROM" || price?.kind === "ESTIMATED_RANGE"
        ? price
        : undefined;
}

type DisplayState =
    | { readonly status: "absent" }
    | { readonly status: "valid"; readonly display: ShippingDisplayValuation }
    /** The backend converted a value but its valuation cannot be read. */
    | { readonly status: "invalid" };

function mapDisplay(display: ShippingDisplayData | undefined): DisplayState {
    if (display == null) return { status: "absent" };
    const capturedAt = new Date(display.capturedAt);
    if (
        !isCurrency(display.currency) ||
        typeof display.fxRateId !== "string" ||
        display.fxRateId === "" ||
        Number.isNaN(capturedAt.getTime())
    ) {
        return { status: "invalid" };
    }
    return {
        status: "valid",
        display: { currency: display.currency, fxRateId: display.fxRateId, capturedAt },
    };
}

/**
 * Keeps the source price and, only beside a readable valuation, the backend's converted value.
 * An unreadable source price drops the rate: its price is unknown, never zero.
 */
function mapRate(
    rate: ListingShippingRateData | undefined,
    display: DisplayState,
): ShippingRate | undefined {
    if (rate == null) return undefined;
    const price = mapShippingPrice(rate.price);
    if (!price) return undefined;
    const components = parseShippingRateComponents(rate.components);
    return compact<ShippingRate>({
        price,
        displayPrice: display.status === "valid" ? mapShippingPrice(rate.display_price) : undefined,
        basis: parseEnumValue(SHIPPING_CHARGE_BASES, rate.basis),
        qualifyingScope: parseEnumValue(SHIPPING_AMOUNT_SCOPES, rate.qualifying_scope),
        components: components && Object.keys(components).length > 0 ? components : undefined,
    });
}

function mapConditions(
    value: ListingShippingApplicabilityData | undefined,
): ShippingConditions | undefined {
    if (value == null) return undefined;
    const quantity = parseShippingQuantity(value.quantity);
    const threshold = parseShippingThreshold(value.threshold);
    const classCode = typeof value.class === "string" ? value.class : undefined;
    const variants =
        Array.isArray(value.variants) &&
        value.variants.every((variant) => typeof variant === "string")
            ? value.variants
            : undefined;
    const unsupported =
        (value.class != null && classCode === undefined) ||
        (value.variants != null && variants === undefined) ||
        (value.quantity != null && !quantity) ||
        (value.threshold != null && !threshold);
    return compact<ShippingConditions>({
        class: classCode,
        variants,
        quantity,
        threshold,
        hasUnsupportedConditions: unsupported ? true : undefined,
    });
}

function mapDuration(value: ListingShippingTimeData | undefined): ShippingDuration | undefined {
    if (value == null) return undefined;
    const unit = parseEnumValue(SHIPPING_TIME_UNITS, value.unit);
    if (
        !unit ||
        !Number.isSafeInteger(value.minimum) ||
        !Number.isSafeInteger(value.maximum) ||
        value.minimum < 0 ||
        value.minimum > value.maximum
    ) {
        return undefined;
    }
    return compact<ShippingDuration>({
        minimum: value.minimum,
        maximum: value.maximum,
        unit,
        basis: parseEnumValue(SHIPPING_TIME_BASES, value.basis),
        trigger: parseEnumValue(SHIPPING_TIME_TRIGGERS, value.trigger),
    });
}

function mapLeadTimes(value: ListingShippingLeadTimesData | undefined) {
    if (value == null) return undefined;
    return compact<ShippingLeadTimes>({
        handling: mapDuration(value.handling),
        transit: mapDuration(value.transit),
        total: mapDuration(value.total),
    });
}

function mapService(
    service: ListingShippingServiceData,
    display: DisplayState,
): ListingShippingService | undefined {
    if (typeof service.code !== "string") return undefined;
    return {
        code: service.code,
        ...compact({
            applicability: mapConditions(service.applicability),
            eligibility: parseEnumValue(SHIPPING_ELIGIBILITIES, service.eligibility),
            rate: mapRate(service.rate, display),
            leadTimes: mapLeadTimes(service.lead_times),
            features: nonEmpty(parseKnownValues(SHIPPING_FEATURES, service.features)),
            arranger: parseShippingActor(service.arranger),
            performer: parseShippingActor(service.performer),
        }),
    };
}

function mapArea(area: Parameters<typeof parseShippingArea>[0]): ListingShippingArea {
    return parseShippingArea(area) ?? { kind: "UNSUPPORTED" };
}

function mapZone(zone: ListingShippingZoneData, display: DisplayState): ListingShippingZone {
    return {
        areas: (zone.areas ?? []).map(mapArea),
        ...compact({ applicability: mapConditions(zone.applicability) }),
        services: (zone.services ?? []).flatMap((service) => {
            const mapped = mapService(service, display);
            return mapped ? [mapped] : [];
        }),
    };
}

function mapCoverage(
    coverage: ListingShippingCoverageData,
    display: DisplayState,
): ListingShippingCoverage | undefined {
    const referenceRelease = parseGeographicReferenceRelease(coverage.reference_release);
    const completeness = parseEnumValue(SHIPPING_COVERAGE_COMPLETENESS, coverage.completeness);
    if (!referenceRelease || !completeness || !Array.isArray(coverage.zones)) return undefined;
    return {
        referenceRelease,
        completeness,
        ...compact({
            applicability: mapConditions(coverage.applicability),
            exclusions: nonEmpty((coverage.exclusions ?? []).map(mapArea)),
        }),
        zones: coverage.zones.map((zone) => mapZone(zone, display)),
    };
}

function mapPolicy(
    policy: ListingShippingPolicyData | undefined,
    display: DisplayState,
): ListingShippingPolicy | undefined {
    if (policy == null) return undefined;
    if (policy.kind === "PROHIBITED") return { kind: "PROHIBITED" };
    if (policy.kind === "COVERAGE") {
        const coverage = mapCoverage(policy.coverage, display);
        return coverage ? { kind: "COVERAGE", coverage } : { kind: "UNSUPPORTED" };
    }
    return { kind: "UNSUPPORTED" };
}

function mapArrangement(
    arrangement: ListingShippingCollectionData["arrangement"],
): ShippingCollectionArrangement | undefined {
    if (arrangement == null) return undefined;
    switch (arrangement.kind) {
        case "BY_APPOINTMENT":
        case "CONTACT_TO_ARRANGE":
            return { kind: arrangement.kind };
        case "WINDOW": {
            const duration = mapDuration(arrangement.duration);
            return duration ? { kind: "WINDOW", duration } : undefined;
        }
        default:
            return undefined;
    }
}

function mapCollectionTerms(
    collection: ListingShippingCollectionData | undefined,
): ListingShippingCollectionTerms | undefined {
    if (collection == null) return undefined;
    const dependency = parseEnumValue(SHIPPING_COLLECTION_DEPENDENCIES, collection.dependency);
    if (!dependency) return undefined;
    return {
        dependency,
        ...compact({
            applicability: mapConditions(collection.applicability),
            eligibility: parseEnumValue(SHIPPING_ELIGIBILITIES, collection.eligibility),
            arrangement: mapArrangement(collection.arrangement),
        }),
    };
}

function mapTerms(
    terms: ListingShippingTermsData | undefined,
    display: DisplayState,
): ListingShippingTerms | undefined {
    if (terms == null) return undefined;
    return compact<ListingShippingTerms>({
        shipping: mapPolicy(terms.shipping, display),
        collection: mapCollectionTerms(terms.collection),
    });
}

/** Public collection summary; `undefined` when the backend asserts nothing. */
export function mapToListingShippingSummary(
    data: ListingShippingSummaryData | undefined,
): ListingShippingSummary | undefined {
    if (data == null) return undefined;
    return compact<ListingShippingSummary>({
        ...mapOutcome(data),
        collection: mapCollectionOutcome(data.collection),
    });
}

/** Public single-listing shipping with its effective terms; `undefined` when nothing is asserted. */
export function mapToListingShippingDetail(
    data: ListingShippingDetailData | undefined,
): ListingShippingDetail | undefined {
    if (data == null) return undefined;
    const display = mapDisplay(data.display);
    const terms = mapTerms(data.terms, display);
    const hasConvertedValue =
        terms?.shipping?.kind === "COVERAGE" &&
        terms.shipping.coverage.zones.some((zone) =>
            zone.services.some((service) => service.rate?.displayPrice !== undefined),
        );
    return compact<ListingShippingDetail>({
        ...mapOutcome(data),
        terms,
        display: display.status === "valid" && hasConvertedValue ? display.display : undefined,
    });
}

function mapPricePreview(
    preview: ShippingPricePreviewData | undefined,
    display: DisplayState,
): ShippingPricePreview | undefined {
    // Without its valuation a converted preview cannot be told from a source price.
    if (preview == null || display.status === "invalid" || typeof preview.service !== "string") {
        return undefined;
    }
    const basis = parseEnumValue(SHIPPING_CHARGE_BASES, preview.basis);
    const price = mapShippingPrice(preview.price);
    return basis && price ? { service: preview.service, basis, price } : undefined;
}

/**
 * Required attribution that cannot be read withholds the whole assessment: it may only be shown
 * with its attribution.
 */
function mapRequiredAttribution(attribution: DeliveryAssessmentAttribution | undefined): {
    readonly ok: boolean;
    readonly attribution?: GeographyAttribution;
} {
    if (attribution == null) return { ok: true };
    const mapped = mapToGeographyAttribution(attribution);
    return mapped ? { ok: true, attribution: mapped } : { ok: false };
}

/** Private collection assessment; `undefined` when nothing is assessed or disclosed. */
export function mapToPersonalizedShippingSummary(
    data: PersonalizedShippingSummaryData | undefined,
): PersonalizedShippingSummary | undefined {
    if (data == null) return undefined;
    const { ok, attribution } = mapRequiredAttribution(data.attribution);
    if (!ok) return undefined;
    const display = mapDisplay(data.display);
    const pricePreview = mapPricePreview(data.pricePreview, display);
    return compact<PersonalizedShippingSummary>({
        ...mapOutcome(data),
        pricePreview,
        collection: mapCollectionOutcome(data.collection),
        attribution,
        display: display.status === "valid" && pricePreview ? display.display : undefined,
    });
}

function mapDestination(destination: DeliveryAssessmentGeography): ShippingDestination | undefined {
    const referenceRelease = parseGeographicReferenceRelease(destination?.referenceRelease);
    if (!referenceRelease) return undefined;
    return {
        referenceRelease,
        ...compact({
            country: parseCountryCode(destination.country),
            subdivision: parseSubdivisionCode(destination.subdivision),
            postalCode:
                typeof destination.postalCode === "string" && destination.postalCode !== ""
                    ? destination.postalCode
                    : undefined,
        }),
    };
}

function mapOption(
    option: DeliveryAssessmentOption,
    display: DisplayState,
): ShippingOption | undefined {
    if (typeof option.service !== "string") return undefined;
    return {
        service: option.service,
        ...mapOutcome(option),
        ...compact({ rate: mapRate(option.rate, display), charge: mapCharge(option.charge) }),
    };
}

/**
 * Private single-listing assessment. A destination on an unknown reference release cannot be
 * interpreted, so the assessment is withheld rather than shown against other facts.
 */
export function mapToPersonalizedShippingDetail(
    data: PersonalizedShippingDetailData | undefined,
): PersonalizedShippingDetail | undefined {
    if (data == null) return undefined;
    const destination = mapDestination(data.destination);
    const { ok, attribution } = mapRequiredAttribution(data.attribution);
    if (!destination || !ok) return undefined;
    const display = mapDisplay(data.display);
    const options = nonEmpty(
        (data.options ?? []).flatMap((option) => {
            const mapped = mapOption(option, display);
            return mapped ? [mapped] : [];
        }),
    );
    const hasConvertedValue = options?.some((option) => option.rate?.displayPrice) ?? false;
    return {
        destination,
        ...compact({
            ...mapOutcome(data),
            attribution,
            options,
            collection: mapCollectionOutcome(data.collection),
            display: display.status === "valid" && hasConvertedValue ? display.display : undefined,
        }),
    };
}

/**
 * Removes the private `userState.shipping` from a listing response. Used for responses fetched
 * during server rendering, so the viewer's destination and assessment never enter the SSR
 * payload; the browser fetches its own assessment after hydration.
 */
export function withoutPrivateShipping<T extends object>(data: T): T {
    const userState = (data as { userState?: unknown }).userState;
    if (typeof userState !== "object" || userState === null || !("shipping" in userState)) {
        return data;
    }
    const { shipping: _shipping, ...rest } = userState as { shipping?: unknown };
    return { ...data, userState: rest };
}
