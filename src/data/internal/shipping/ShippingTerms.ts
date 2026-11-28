import type {
    AdvertisedDeliveryTermsData,
    ShippingApplicabilityData,
    ShippingCollectionArrangementData,
    ShippingCollectionData,
    ShippingCoverageData,
    ShippingLeadTimesData,
    ShippingPolicyData,
    ShippingPriceData,
    ShippingRateData,
    ShippingServiceData,
    ShippingSiteData,
    ShippingTimeData,
    ShippingZoneData,
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
    type GeographicPrecision,
    parseGeographicPrecision,
} from "@/data/internal/geography/GeographicPosition.ts";
import {
    parseAll,
    parseEnumValue,
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
    toBackendShippingActor,
    toBackendShippingArea,
    toBackendShippingMoney,
} from "@/data/internal/shipping/ShippingValues.ts";

/*
 * The strict advertised terms protocol (`SHIP_TERMS_V1`) of protected shipping management
 * (profiles, inline listing selections, overrides). Unlike the consumer projections in
 * `ListingShipping.ts`, every member is present and `null` is an explicit "not asserted": these
 * models round-trip exactly to the write DTOs. Zones, services and areas keep their order;
 * profile, Party and PartyLocation IDs are opaque.
 *
 * A read with any value this app does not recognize is not modeled at all (`undefined`): the
 * caller marks the view `hasUnsupportedValues`, so a replacing write can never silently drop
 * a seller's assertion.
 */

export type ShippingApplicability = {
    readonly class: string | null;
    readonly variants: readonly string[] | null;
    readonly quantity: ShippingQuantity | null;
    readonly threshold: ShippingThreshold | null;
};

export const UNCONDITIONAL_SHIPPING_APPLICABILITY: ShippingApplicability = {
    class: null,
    variants: null,
    quantity: null,
    threshold: null,
};

export type ShippingTime = {
    readonly minimum: number;
    readonly maximum: number;
    readonly unit: ShippingTimeUnit;
    readonly basis: ShippingTimeBasis | null;
    readonly trigger: ShippingTimeTrigger | null;
};

export type ShippingLeadTimeTerms = {
    readonly handling: ShippingTime | null;
    readonly transit: ShippingTime | null;
    readonly total: ShippingTime | null;
};

export type ShippingPriceTerms =
    | { readonly kind: "FREE"; readonly currency: Currency | null }
    | { readonly kind: "FIXED"; readonly amount: ShippingMoney }
    | { readonly kind: "FROM"; readonly amount: ShippingMoney }
    | {
          readonly kind: "ESTIMATED_RANGE";
          readonly minimum: ShippingMoney;
          readonly maximum: ShippingMoney;
      }
    | { readonly kind: "EXTERNALLY_CALCULATED"; readonly currency: Currency | null }
    | { readonly kind: "ON_REQUEST"; readonly currency: Currency | null };

export type ShippingRateTerms = {
    readonly price: ShippingPriceTerms;
    readonly basis: ShippingChargeBasis | null;
    readonly qualifyingScope: ShippingAmountScope | null;
    readonly components: ShippingRateComponents;
};

export type ShippingServiceTerms = {
    readonly code: string;
    readonly applicability: ShippingApplicability;
    readonly eligibility: ShippingEligibility | null;
    readonly rate: ShippingRateTerms | null;
    readonly leadTimes: ShippingLeadTimeTerms;
    readonly features: readonly ShippingFeature[];
    readonly arranger: ShippingActor | null;
    readonly performer: ShippingActor | null;
};

/** A protected dispatch or collection site; never published with listing reads. */
export type ShippingSite =
    | { readonly kind: "PARTY_LOCATION"; readonly partyLocationId: string }
    | {
          readonly kind: "ASSERTED";
          readonly geography: {
              readonly referenceRelease: GeographicReferenceRelease;
              readonly addressText: string | null;
              readonly country: CountryCode | null;
              readonly subdivision: SubdivisionCode | null;
              readonly postalCode: string | null;
          } | null;
          readonly position: {
              readonly point: {
                  readonly latitudeDegrees: number;
                  readonly longitudeDegrees: number;
              };
              readonly precision: GeographicPrecision;
              readonly accuracyMetres: number | null;
          } | null;
      };

export type ShippingZoneTerms = {
    readonly areas: readonly ShippingArea[];
    readonly applicability: ShippingApplicability;
    readonly services: readonly ShippingServiceTerms[];
};

export type ShippingCoverageTerms = {
    readonly referenceRelease: GeographicReferenceRelease;
    readonly completeness: ShippingCoverageCompleteness;
    readonly applicability: ShippingApplicability;
    readonly exclusions: readonly ShippingArea[];
    readonly zones: readonly ShippingZoneTerms[];
    readonly dispatchOrigin: ShippingSite | null;
};

export type ShippingPolicyTerms =
    | { readonly kind: "PROHIBITED" }
    | { readonly kind: "COVERAGE"; readonly coverage: ShippingCoverageTerms };

export type ShippingCollectionArrangementTerms =
    | { readonly kind: "BY_APPOINTMENT" }
    | { readonly kind: "CONTACT_TO_ARRANGE" }
    | { readonly kind: "WINDOW"; readonly duration: ShippingTime };

export type ShippingCollectionPolicy = {
    readonly applicability: ShippingApplicability;
    readonly dependency: ShippingCollectionDependency;
    readonly eligibility: ShippingEligibility | null;
    readonly site: ShippingSite | null;
    readonly arrangement: ShippingCollectionArrangementTerms | null;
};

/**
 * `null` shipping or collection asserts nothing; `PROHIBITED` asserts `NOT_OFFERED`. Retiring a
 * profile is neither.
 */
export type AdvertisedDeliveryTerms = {
    readonly shipping: ShippingPolicyTerms | null;
    readonly collection: ShippingCollectionPolicy | null;
};

/** Maps a nullable member: `null` stays `null`, an unreadable value is `undefined`. */
function nullable<TInput, TOutput>(
    value: TInput | null | undefined,
    parse: (value: TInput) => TOutput | undefined,
): TOutput | null | undefined {
    return value == null ? null : parse(value);
}

function optionalEnum<const T extends readonly string[]>(
    values: T,
    value: unknown,
): T[number] | null | undefined {
    return value == null ? null : parseEnumValue(values, value);
}

function parseApplicability(
    value: ShippingApplicabilityData | null | undefined,
): ShippingApplicability | undefined {
    if (value == null) return undefined;
    const classCode = nullable(value.class, (code) =>
        typeof code === "string" ? code : undefined,
    );
    const variants = nullable(value.variants, (codes) =>
        Array.isArray(codes) && codes.every((code) => typeof code === "string") ? codes : undefined,
    );
    const quantity = nullable(value.quantity, parseShippingQuantity);
    const threshold = nullable(value.threshold, parseShippingThreshold);
    if (
        classCode === undefined ||
        variants === undefined ||
        quantity === undefined ||
        threshold === undefined
    ) {
        return undefined;
    }
    return { class: classCode, variants, quantity, threshold };
}

function parseTime(value: ShippingTimeData | null | undefined): ShippingTime | undefined {
    if (value == null) return undefined;
    const unit = parseEnumValue(SHIPPING_TIME_UNITS, value.unit);
    const basis = optionalEnum(SHIPPING_TIME_BASES, value.basis);
    const trigger = optionalEnum(SHIPPING_TIME_TRIGGERS, value.trigger);
    if (
        !unit ||
        basis === undefined ||
        trigger === undefined ||
        !Number.isSafeInteger(value.minimum) ||
        !Number.isSafeInteger(value.maximum) ||
        value.minimum < 0 ||
        value.minimum > value.maximum
    ) {
        return undefined;
    }
    return { minimum: value.minimum, maximum: value.maximum, unit, basis, trigger };
}

function parseLeadTimes(
    value: ShippingLeadTimesData | null | undefined,
): ShippingLeadTimeTerms | undefined {
    if (value == null) return undefined;
    const handling = nullable(value.handling, parseTime);
    const transit = nullable(value.transit, parseTime);
    const total = nullable(value.total, parseTime);
    if (handling === undefined || transit === undefined || total === undefined) return undefined;
    return { handling, transit, total };
}

function parseCurrencyOrNull(value: unknown): Currency | null | undefined {
    if (value == null) return null;
    return isCurrency(value) ? value : undefined;
}

export function parseShippingPriceTerms(
    price: ShippingPriceData | null | undefined,
): ShippingPriceTerms | undefined {
    if (price == null) return undefined;
    switch (price.kind) {
        case "FREE":
        case "EXTERNALLY_CALCULATED":
        case "ON_REQUEST": {
            const currency = parseCurrencyOrNull(price.currency);
            return currency === undefined ? undefined : { kind: price.kind, currency };
        }
        case "FIXED":
        case "FROM": {
            const amount = parseShippingMoney(price.amount);
            return amount ? { kind: price.kind, amount } : undefined;
        }
        case "ESTIMATED_RANGE": {
            const minimum = parseShippingMoney(price.minimum);
            const maximum = parseShippingMoney(price.maximum);
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

function parseRate(rate: ShippingRateData | null | undefined): ShippingRateTerms | undefined {
    if (rate == null) return undefined;
    const price = parseShippingPriceTerms(rate.price);
    const basis = optionalEnum(SHIPPING_CHARGE_BASES, rate.basis);
    const qualifyingScope = optionalEnum(SHIPPING_AMOUNT_SCOPES, rate.qualifying_scope);
    const components = parseShippingRateComponents(rate.components);
    if (!price || basis === undefined || qualifyingScope === undefined || !components) {
        return undefined;
    }
    return { price, basis, qualifyingScope, components };
}

function parseService(service: ShippingServiceData): ShippingServiceTerms | undefined {
    const applicability = parseApplicability(service.applicability);
    const eligibility = optionalEnum(SHIPPING_ELIGIBILITIES, service.eligibility);
    const rate = nullable(service.rate, parseRate);
    const leadTimes = parseLeadTimes(service.lead_times);
    const features = Array.isArray(service.features)
        ? parseAll(service.features, (feature) => parseEnumValue(SHIPPING_FEATURES, feature))
        : undefined;
    const arranger = nullable(service.arranger, parseShippingActor);
    const performer = nullable(service.performer, parseShippingActor);
    if (
        typeof service.code !== "string" ||
        !applicability ||
        eligibility === undefined ||
        rate === undefined ||
        !leadTimes ||
        !features ||
        arranger === undefined ||
        performer === undefined
    ) {
        return undefined;
    }
    return {
        code: service.code,
        applicability,
        eligibility,
        rate,
        leadTimes,
        features,
        arranger,
        performer,
    };
}

function isCoordinate(value: unknown, limit: number): value is number {
    return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
}

function parseSite(site: ShippingSiteData): ShippingSite | undefined {
    if (site.kind === "PARTY_LOCATION") {
        return typeof site.party_location_id === "string"
            ? { kind: "PARTY_LOCATION", partyLocationId: site.party_location_id }
            : undefined;
    }
    if (site.kind !== "ASSERTED") return undefined;
    const geography = nullable(site.geography, (value) => {
        const referenceRelease = parseGeographicReferenceRelease(value.reference_release);
        const country = nullable(value.country, parseCountryCode);
        const subdivision = nullable(value.subdivision, parseSubdivisionCode);
        if (!referenceRelease || country === undefined || subdivision === undefined) {
            return undefined;
        }
        return {
            referenceRelease,
            addressText: value.address_text ?? null,
            country,
            subdivision,
            postalCode: value.postal_code ?? null,
        };
    });
    const position = nullable(site.position, (value) => {
        const precision = parseGeographicPrecision(value.precision);
        const accuracy = value.accuracy_metres;
        if (
            !precision ||
            !isCoordinate(value.point?.latitude_degrees, 90) ||
            !isCoordinate(value.point?.longitude_degrees, 180) ||
            (accuracy != null && !(Number.isFinite(accuracy) && accuracy >= 0))
        ) {
            return undefined;
        }
        return {
            point: {
                latitudeDegrees: value.point.latitude_degrees,
                longitudeDegrees: value.point.longitude_degrees,
            },
            precision,
            accuracyMetres: accuracy ?? null,
        };
    });
    if (geography === undefined || position === undefined) return undefined;
    return { kind: "ASSERTED", geography, position };
}

function parseZone(zone: ShippingZoneData): ShippingZoneTerms | undefined {
    const areas = Array.isArray(zone.areas) ? parseAll(zone.areas, parseShippingArea) : undefined;
    const applicability = parseApplicability(zone.applicability);
    const services = Array.isArray(zone.services)
        ? parseAll(zone.services, parseService)
        : undefined;
    return areas && applicability && services ? { areas, applicability, services } : undefined;
}

function parseCoverage(coverage: ShippingCoverageData): ShippingCoverageTerms | undefined {
    const referenceRelease = parseGeographicReferenceRelease(coverage.reference_release);
    const completeness = parseEnumValue(SHIPPING_COVERAGE_COMPLETENESS, coverage.completeness);
    const applicability = parseApplicability(coverage.applicability);
    const exclusions = Array.isArray(coverage.exclusions)
        ? parseAll(coverage.exclusions, parseShippingArea)
        : undefined;
    const zones = Array.isArray(coverage.zones) ? parseAll(coverage.zones, parseZone) : undefined;
    const dispatchOrigin = nullable(coverage.dispatch_origin, parseSite);
    if (
        !referenceRelease ||
        !completeness ||
        !applicability ||
        !exclusions ||
        !zones ||
        dispatchOrigin === undefined
    ) {
        return undefined;
    }
    return { referenceRelease, completeness, applicability, exclusions, zones, dispatchOrigin };
}

export function parseShippingPolicyTerms(
    policy: ShippingPolicyData | null | undefined,
): ShippingPolicyTerms | undefined {
    if (policy == null) return undefined;
    if (policy.kind === "PROHIBITED") return { kind: "PROHIBITED" };
    if (policy.kind !== "COVERAGE") return undefined;
    const coverage = parseCoverage(policy.coverage);
    return coverage ? { kind: "COVERAGE", coverage } : undefined;
}

function parseArrangement(
    arrangement: ShippingCollectionArrangementData,
): ShippingCollectionArrangementTerms | undefined {
    switch (arrangement.kind) {
        case "BY_APPOINTMENT":
        case "CONTACT_TO_ARRANGE":
            return { kind: arrangement.kind };
        case "WINDOW": {
            const duration = parseTime(arrangement.duration);
            return duration ? { kind: "WINDOW", duration } : undefined;
        }
        default:
            return undefined;
    }
}

export function parseShippingCollectionPolicy(
    collection: ShippingCollectionData | null | undefined,
): ShippingCollectionPolicy | undefined {
    if (collection == null) return undefined;
    const applicability = parseApplicability(collection.applicability);
    const dependency = parseEnumValue(SHIPPING_COLLECTION_DEPENDENCIES, collection.dependency);
    const eligibility = optionalEnum(SHIPPING_ELIGIBILITIES, collection.eligibility);
    const site = nullable(collection.site, parseSite);
    const arrangement = nullable(collection.arrangement, parseArrangement);
    if (
        !applicability ||
        !dependency ||
        eligibility === undefined ||
        site === undefined ||
        arrangement === undefined
    ) {
        return undefined;
    }
    return { applicability, dependency, eligibility, site, arrangement };
}

/** `undefined` when the terms carry another schema or any value this app cannot read. */
export function mapToAdvertisedDeliveryTerms(
    terms: AdvertisedDeliveryTermsData | null | undefined,
): AdvertisedDeliveryTerms | undefined {
    if (terms == null || terms.schema !== "SHIP_TERMS_V1") return undefined;
    const shipping = nullable(terms.shipping, parseShippingPolicyTerms);
    const collection = nullable(terms.collection, parseShippingCollectionPolicy);
    if (shipping === undefined || collection === undefined) return undefined;
    return { shipping, collection };
}

function toBackendApplicability(value: ShippingApplicability): ShippingApplicabilityData {
    return {
        class: value.class,
        variants: value.variants && [...value.variants],
        quantity: value.quantity && { ...value.quantity },
        threshold: value.threshold && {
            minimum: toBackendShippingMoney(value.threshold.minimum),
            scope: value.threshold.scope,
        },
    };
}

function toBackendTime(value: ShippingTime): ShippingTimeData {
    return {
        minimum: value.minimum,
        maximum: value.maximum,
        unit: value.unit,
        basis: value.basis,
        trigger: value.trigger,
    };
}

function toBackendLeadTimes(value: ShippingLeadTimeTerms): ShippingLeadTimesData {
    return {
        handling: value.handling && toBackendTime(value.handling),
        transit: value.transit && toBackendTime(value.transit),
        total: value.total && toBackendTime(value.total),
    };
}

export function toBackendShippingPrice(price: ShippingPriceTerms): ShippingPriceData {
    switch (price.kind) {
        case "FREE":
        case "EXTERNALLY_CALCULATED":
        case "ON_REQUEST":
            return { kind: price.kind, currency: price.currency };
        case "FIXED":
        case "FROM":
            return { kind: price.kind, amount: toBackendShippingMoney(price.amount) };
        case "ESTIMATED_RANGE":
            return {
                kind: "ESTIMATED_RANGE",
                minimum: toBackendShippingMoney(price.minimum),
                maximum: toBackendShippingMoney(price.maximum),
            };
    }
}

function toBackendRate(rate: ShippingRateTerms): ShippingRateData {
    return {
        price: toBackendShippingPrice(rate.price),
        basis: rate.basis,
        qualifying_scope: rate.qualifyingScope,
        components: { ...rate.components },
    };
}

function toBackendService(service: ShippingServiceTerms): ShippingServiceData {
    return {
        code: service.code,
        applicability: toBackendApplicability(service.applicability),
        eligibility: service.eligibility,
        rate: service.rate && toBackendRate(service.rate),
        lead_times: toBackendLeadTimes(service.leadTimes),
        features: [...service.features],
        arranger: service.arranger && toBackendShippingActor(service.arranger),
        performer: service.performer && toBackendShippingActor(service.performer),
    };
}

function toBackendSite(site: ShippingSite): ShippingSiteData {
    if (site.kind === "PARTY_LOCATION") {
        return { kind: "PARTY_LOCATION", party_location_id: site.partyLocationId };
    }
    return {
        kind: "ASSERTED",
        geography: site.geography && {
            reference_release: site.geography.referenceRelease,
            address_text: site.geography.addressText,
            country: site.geography.country,
            subdivision: site.geography.subdivision,
            postal_code: site.geography.postalCode,
        },
        position: site.position && {
            point: {
                latitude_degrees: site.position.point.latitudeDegrees,
                longitude_degrees: site.position.point.longitudeDegrees,
            },
            precision: site.position.precision,
            accuracy_metres: site.position.accuracyMetres,
        },
    };
}

function toBackendZone(zone: ShippingZoneTerms): ShippingZoneData {
    return {
        areas: zone.areas.map(toBackendShippingArea) as ShippingZoneData["areas"],
        applicability: toBackendApplicability(zone.applicability),
        services: zone.services.map(toBackendService),
    };
}

export function toBackendShippingPolicy(policy: ShippingPolicyTerms): ShippingPolicyData {
    if (policy.kind === "PROHIBITED") return { kind: "PROHIBITED" };
    const { coverage } = policy;
    return {
        kind: "COVERAGE",
        coverage: {
            reference_release: coverage.referenceRelease,
            completeness: coverage.completeness,
            applicability: toBackendApplicability(coverage.applicability),
            exclusions: coverage.exclusions.map(
                toBackendShippingArea,
            ) as ShippingCoverageData["exclusions"],
            zones: coverage.zones.map(toBackendZone),
            dispatch_origin: coverage.dispatchOrigin && toBackendSite(coverage.dispatchOrigin),
        },
    };
}

export function toBackendShippingCollection(
    collection: ShippingCollectionPolicy,
): ShippingCollectionData {
    const { arrangement } = collection;
    return {
        applicability: toBackendApplicability(collection.applicability),
        dependency: collection.dependency,
        eligibility: collection.eligibility,
        site: collection.site && toBackendSite(collection.site),
        arrangement:
            arrangement &&
            (arrangement.kind === "WINDOW"
                ? { kind: "WINDOW", duration: toBackendTime(arrangement.duration) }
                : { kind: arrangement.kind }),
    };
}

/** Writes every member, including each `null`, as the strict protocol requires. */
export function mapToBackendAdvertisedDeliveryTerms(
    terms: AdvertisedDeliveryTerms,
): AdvertisedDeliveryTermsData {
    return {
        schema: "SHIP_TERMS_V1",
        shipping: terms.shipping && toBackendShippingPolicy(terms.shipping),
        collection: terms.collection && toBackendShippingCollection(terms.collection),
    };
}
