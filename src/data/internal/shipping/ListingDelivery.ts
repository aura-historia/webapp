import type {
    ListingDeliveryCollectionOverrideData,
    ListingDeliveryConfigurationData,
    ListingDeliveryIntegrationData,
    ListingDeliveryPatchData,
    ListingDeliveryRateInputsData,
    ListingDeliverySelectionData,
    ListingDeliveryShippingOverrideData,
    ProductListingDeliveryCommandData,
    ProductListingDeliveryResultData,
    ProductListingDeliveryViewData,
} from "@/client";
import {
    type AdvertisedDeliveryTerms,
    mapToAdvertisedDeliveryTerms,
    mapToBackendAdvertisedDeliveryTerms,
    parseShippingCollectionPolicy,
    parseShippingPolicyTerms,
    type ShippingCollectionPolicy,
    type ShippingPolicyTerms,
    toBackendShippingCollection,
    toBackendShippingPolicy,
} from "@/data/internal/shipping/ShippingTerms.ts";
import type { ShippingCoverageCompleteness } from "@/data/internal/shipping/ShippingValues.ts";

/*
 * Protected listing delivery configuration (`LISTING_DELIVERY_V1`) and its revision-checked
 * command. Reads need `product-listings:read`, commands `product-listings:write`, plus current
 * administrator or operator Partnership authority; responses and errors are `no-store`. The
 * configuration is the listing's own assertions, never its effective terms: those are only in
 * consumer listing reads. Public history reports a change as `DELIVERY_CHANGED` only.
 */

export type ListingDeliveryIntegration =
    | { readonly kind: "SOURCE" }
    | { readonly kind: "PROVIDER"; readonly method: "SHOPIFY" | "WOOCOMMERCE" };

export type ListingDeliverySelection =
    | { readonly kind: "INHERIT_SOURCE_DEFAULT" | "SUPPRESS_INHERITANCE" }
    | { readonly kind: "EXPLICIT"; readonly profileId: string }
    | { readonly kind: "INLINE"; readonly terms: AdvertisedDeliveryTerms };

/** Source-scoped codes; a `PARTIAL` class set cannot prove non-membership. */
export type ListingDeliveryRateInputs = {
    readonly classes: {
        readonly codes: readonly string[];
        readonly completeness: ShippingCoverageCompleteness;
    } | null;
    readonly variants: readonly string[] | null;
};

/** `INHERIT` removes an override, `CLEAR` removes the assertion, `REPLACE` sets a whole policy. */
export type ListingDeliveryOverride<T> =
    | { readonly kind: "INHERIT" | "CLEAR" }
    | { readonly kind: "REPLACE"; readonly value: T };

export type ListingDeliveryConfiguration = {
    readonly sourceId: string;
    readonly integration: ListingDeliveryIntegration;
    /** `null`: no selection (for example a provider listing without an assignment). */
    readonly selection: ListingDeliverySelection | null;
    readonly rateInputs: ListingDeliveryRateInputs;
    readonly shipping: ListingDeliveryOverride<ShippingPolicyTerms>;
    readonly collection: ListingDeliveryOverride<ShippingCollectionPolicy>;
};

export type ListingDeliveryView = {
    readonly productListingId: string;
    /** The listing revision; send it back as `expectedVersion`. */
    readonly expectedVersion: number;
    /** Absent when the listing has no delivery configuration or `hasUnsupportedValues`. */
    readonly delivery?: ListingDeliveryConfiguration;
    /** The stored configuration holds values this app cannot read; only `CLEAR` is safe. */
    readonly hasUnsupportedValues: boolean;
};

function parseIntegration(
    integration: ListingDeliveryIntegrationData,
): ListingDeliveryIntegration | undefined {
    if (integration?.kind === "SOURCE") return { kind: "SOURCE" };
    if (
        integration?.kind === "PROVIDER" &&
        (integration.method === "SHOPIFY" || integration.method === "WOOCOMMERCE")
    ) {
        return { kind: "PROVIDER", method: integration.method };
    }
    return undefined;
}

function parseSelection(
    selection: ListingDeliverySelectionData,
): ListingDeliverySelection | undefined {
    switch (selection.kind) {
        case "INHERIT_SOURCE_DEFAULT":
        case "SUPPRESS_INHERITANCE":
            return { kind: selection.kind };
        case "EXPLICIT":
            return typeof selection.profile_id === "string"
                ? { kind: "EXPLICIT", profileId: selection.profile_id }
                : undefined;
        case "INLINE": {
            const terms = mapToAdvertisedDeliveryTerms(selection.terms);
            return terms ? { kind: "INLINE", terms } : undefined;
        }
        default:
            return undefined;
    }
}

function isCodeList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((code) => typeof code === "string");
}

function parseRateInputs(
    inputs: ListingDeliveryRateInputsData,
): ListingDeliveryRateInputs | undefined {
    if (inputs == null) return undefined;
    const { classes, variants } = inputs;
    if (
        classes != null &&
        (!isCodeList(classes.codes) ||
            (classes.completeness !== "PARTIAL" && classes.completeness !== "COMPLETE"))
    ) {
        return undefined;
    }
    if (variants != null && !isCodeList(variants)) return undefined;
    return {
        classes:
            classes == null ? null : { codes: classes.codes, completeness: classes.completeness },
        variants: variants ?? null,
    };
}

function parseOverride<TData, T>(
    override: { kind: string; value?: TData },
    parseValue: (value: TData) => T | undefined,
): ListingDeliveryOverride<T> | undefined {
    if (override?.kind === "INHERIT" || override?.kind === "CLEAR") return { kind: override.kind };
    if (override?.kind !== "REPLACE" || override.value == null) return undefined;
    const value = parseValue(override.value);
    return value === undefined ? undefined : { kind: "REPLACE", value };
}

function parseConfiguration(
    data: ListingDeliveryConfigurationData,
): ListingDeliveryConfiguration | undefined {
    if (data.schema !== "LISTING_DELIVERY_V1" || typeof data.source_id !== "string") {
        return undefined;
    }
    const integration = parseIntegration(data.integration);
    const selection = data.selection == null ? null : parseSelection(data.selection);
    const rateInputs = parseRateInputs(data.rate_inputs);
    const shipping = parseOverride(data.shipping, parseShippingPolicyTerms);
    const collection = parseOverride(data.collection, parseShippingCollectionPolicy);
    if (!integration || selection === undefined || !rateInputs || !shipping || !collection) {
        return undefined;
    }
    return { sourceId: data.source_id, integration, selection, rateInputs, shipping, collection };
}

export function mapToListingDeliveryView(
    data: ProductListingDeliveryViewData,
): ListingDeliveryView {
    const delivery = data.delivery == null ? undefined : parseConfiguration(data.delivery);
    return {
        productListingId: data.productListingId,
        expectedVersion: data.expectedVersion,
        ...(delivery ? { delivery } : {}),
        hasUnsupportedValues: data.delivery != null && delivery === undefined,
    };
}

/** One member of a delivery patch: keep it, clear it, or set it as a whole. */
export type ListingDeliveryPatchField<T> =
    | { readonly state: "UNCHANGED" | "CLEAR" }
    | { readonly state: "SET"; readonly value: T };

export type ListingDeliveryPatch = {
    readonly integration: ListingDeliveryIntegration;
    readonly selection: ListingDeliveryPatchField<ListingDeliverySelection>;
    readonly rateInputs: ListingDeliveryPatchField<ListingDeliveryRateInputs>;
    readonly shipping: ListingDeliveryPatchField<ListingDeliveryOverride<ShippingPolicyTerms>>;
    readonly collection: ListingDeliveryPatchField<
        ListingDeliveryOverride<ShippingCollectionPolicy>
    >;
};

/**
 * The whole delivery command at the listing revision that was read. `CLEAR` removes the
 * configuration (a source listing returns to default inheritance); `UNCHANGED` changes nothing.
 */
export type ListingDeliveryCommand = {
    readonly expectedVersion: number;
    readonly delivery: ListingDeliveryPatchField<ListingDeliveryPatch>;
};

function toBackendIntegration(
    integration: ListingDeliveryIntegration,
): ListingDeliveryIntegrationData {
    return integration.kind === "SOURCE"
        ? { kind: "SOURCE" }
        : { kind: "PROVIDER", method: integration.method };
}

function toBackendSelection(selection: ListingDeliverySelection): ListingDeliverySelectionData {
    switch (selection.kind) {
        case "INHERIT_SOURCE_DEFAULT":
        case "SUPPRESS_INHERITANCE":
            return { kind: selection.kind };
        case "EXPLICIT":
            return { kind: "EXPLICIT", profile_id: selection.profileId };
        case "INLINE":
            return { kind: "INLINE", terms: mapToBackendAdvertisedDeliveryTerms(selection.terms) };
    }
}

function toBackendRateInputs(inputs: ListingDeliveryRateInputs): ListingDeliveryRateInputsData {
    return {
        classes: inputs.classes && {
            codes: [...inputs.classes.codes],
            completeness: inputs.classes.completeness,
        },
        variants: inputs.variants && [...inputs.variants],
    };
}

function toBackendField<T, TData>(
    field: ListingDeliveryPatchField<T>,
    toBackend: (value: T) => TData,
): { state: "UNCHANGED" | "CLEAR" } | { state: "SET"; value: TData } {
    return field.state === "SET"
        ? { state: "SET", value: toBackend(field.value) }
        : { state: field.state };
}

function toBackendShippingOverride(
    override: ListingDeliveryOverride<ShippingPolicyTerms>,
): ListingDeliveryShippingOverrideData {
    return override.kind === "REPLACE"
        ? { kind: "REPLACE", value: toBackendShippingPolicy(override.value) }
        : { kind: override.kind };
}

function toBackendCollectionOverride(
    override: ListingDeliveryOverride<ShippingCollectionPolicy>,
): ListingDeliveryCollectionOverrideData {
    return override.kind === "REPLACE"
        ? { kind: "REPLACE", value: toBackendShippingCollection(override.value) }
        : { kind: override.kind };
}

function toBackendPatch(patch: ListingDeliveryPatch): ListingDeliveryPatchData {
    return {
        integration: toBackendIntegration(patch.integration),
        selection: toBackendField(patch.selection, toBackendSelection),
        rateInputs: toBackendField(patch.rateInputs, toBackendRateInputs),
        shipping: toBackendField(patch.shipping, toBackendShippingOverride),
        collection: toBackendField(patch.collection, toBackendCollectionOverride),
    };
}

/** The browser never sends the producer-only `import` envelope. */
export function mapToBackendListingDeliveryCommand(
    command: ListingDeliveryCommand,
): ProductListingDeliveryCommandData {
    return {
        expectedVersion: command.expectedVersion,
        delivery: toBackendField(command.delivery, toBackendPatch),
    };
}

export type ListingDeliveryResult = {
    readonly productListingId: string;
    readonly expectedVersion: number;
    /** `UNCHANGED` can still have committed an observation or ownership handoff. */
    readonly outcome: "CHANGED" | "UNCHANGED" | "UNKNOWN";
};

export function mapToListingDeliveryResult(
    data: ProductListingDeliveryResultData,
): ListingDeliveryResult {
    return {
        productListingId: data.productListingId,
        expectedVersion: data.expectedVersion,
        outcome:
            data.outcome === "CHANGED" || data.outcome === "UNCHANGED" ? data.outcome : "UNKNOWN",
    };
}
