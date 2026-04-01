import type {
    GetProductEventData,
    ProductEventPayloadData,
    ProductCreatedEventPayloadData,
    ProductEventStateChangedPayloadData,
    ProductEventPriceChangedPayloadData,
    ProductEventEstimatePriceChangedPayloadData,
    ProductEventUrlChangedPayloadData,
    ProductEventImagesChangedPayloadData,
    ProductEventAuctionTimeChangedPayloadData,
    ProductEventOriginYearChangedPayloadData,
    ProductEventAuthenticityChangedPayloadData,
    ProductEventConditionChangedPayloadData,
    ProductEventProvenanceChangedPayloadData,
    ProductEventRestorationChangedPayloadData,
    PriceData,
    PersonalizedGetProductData,
} from "@/client";
import {
    mapPersonalizedGetProductDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";
import { parseProductState, type ProductState } from "@/data/internal/product/ProductState.ts";
import { parsePrice, type Price } from "@/data/internal/price/Price.ts";
import {
    parseAuthenticity,
    type Authenticity,
} from "@/data/internal/quality-indicators/Authenticity.ts";
import { parseCondition, type Condition } from "@/data/internal/quality-indicators/Condition.ts";
import { parseProvenance, type Provenance } from "@/data/internal/quality-indicators/Provenance.ts";
import {
    parseRestoration,
    type Restoration,
} from "@/data/internal/quality-indicators/Restoration.ts";

export type ProductCreatedPayload = {
    readonly state: ProductState;
    readonly price?: Price;
};

export type ProductStateChangedPayload = {
    readonly oldState: ProductState;
    readonly newState: ProductState;
};

export type ProductPriceChangedPayload = {
    readonly oldPrice: Price;
    readonly newPrice: Price;
};

export type ProductPriceDiscoveredPayload = {
    readonly newPrice: Price;
};

export type ProductPriceRemovedPayload = {
    readonly oldPrice: Price;
};

export type ProductEstimatePriceChangedPayload = {
    readonly priceEstimateMin?: Price;
    readonly priceEstimateMax?: Price;
};

export type ProductUrlChangedPayload = {
    readonly url: string;
};

export type ProductImagesChangedPayload = {
    readonly imageCount: number;
};

export type ProductAuctionTimeChangedPayload = {
    readonly auctionStart?: Date;
    readonly auctionEnd?: Date;
};

export type ProductOriginYearChangedPayload = {
    readonly originYear?: number;
    readonly originYearMin?: number;
    readonly originYearMax?: number;
};

export type ProductAuthenticityChangedPayload = {
    readonly authenticity: Authenticity;
};

export type ProductConditionChangedPayload = {
    readonly condition: Condition;
};

export type ProductProvenanceChangedPayload = {
    readonly provenance: Provenance;
};

export type ProductRestorationChangedPayload = {
    readonly restoration: Restoration;
};

export type ProductEvent = {
    readonly eventType: string;
    readonly productId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly payload:
        | ProductCreatedPayload
        | ProductStateChangedPayload
        | ProductPriceChangedPayload
        | ProductPriceDiscoveredPayload
        | ProductPriceRemovedPayload
        | ProductEstimatePriceChangedPayload
        | ProductUrlChangedPayload
        | ProductImagesChangedPayload
        | ProductAuctionTimeChangedPayload
        | ProductOriginYearChangedPayload
        | ProductAuthenticityChangedPayload
        | ProductConditionChangedPayload
        | ProductProvenanceChangedPayload
        | ProductRestorationChangedPayload;
    readonly timestamp: Date;
};

export type ProductDetail = OverviewProduct & {
    readonly history?: readonly ProductEvent[];
};

/**
 *  Checks if payload is a STATE CHANGED event (has oldState + newState)
 */
function isStateChangedPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventStateChangedPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldState" in payload &&
        "newState" in payload
    );
}

/**
 * Checks if payload is a CREATED event (has state field and no old/new state)
 */
function isCreatedPayload(
    payload: ProductEventPayloadData,
): payload is ProductCreatedEventPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "state" in payload &&
        !("oldState" in payload) &&
        !("newState" in payload)
    );
}

/**
 * Checks if payload is a PRICE CHANGED event (has oldPrice + newPrice)
 */
function isPriceChangedPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventPriceChangedPayloadData & { oldPrice: PriceData; newPrice: PriceData } {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldPrice" in payload &&
        payload.oldPrice != null &&
        "newPrice" in payload &&
        payload.newPrice != null
    );
}

/**
 * Checks if payload is a PRICE DISCOVERED event (has only newPrice)
 */
function isPriceDiscoveredPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventPriceChangedPayloadData & { newPrice: PriceData } {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "newPrice" in payload &&
        payload.newPrice != null &&
        !("oldPrice" in payload && payload.oldPrice != null)
    );
}

function isPriceRemovedPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventPriceChangedPayloadData & { oldPrice: PriceData } {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldPrice" in payload &&
        payload.oldPrice != null &&
        !("newPrice" in payload && payload.newPrice != null)
    );
}

/**
 * Converts a state string from the API to our internal ProductState type
 */
function mapStateChangedPayload(
    apiPayload: ProductEventStateChangedPayloadData,
): ProductStateChangedPayload {
    return {
        oldState: parseProductState(apiPayload.oldState),
        newState: parseProductState(apiPayload.newState),
    };
}

/**
 * Converts price data from the API to our internal Price type
 */
function mapPriceChangedPayload(
    apiPayload: ProductEventPriceChangedPayloadData & { oldPrice: PriceData; newPrice: PriceData },
): ProductPriceChangedPayload {
    return {
        oldPrice: parsePrice(apiPayload.oldPrice),
        newPrice: parsePrice(apiPayload.newPrice),
    };
}

function mapPriceDiscoveredPayload(
    apiPayload: ProductEventPriceChangedPayloadData & { newPrice: PriceData },
): ProductPriceDiscoveredPayload {
    return {
        newPrice: parsePrice(apiPayload.newPrice),
    };
}

function mapPriceRemovedPayload(
    apiPayload: ProductEventPriceChangedPayloadData & { oldPrice: PriceData },
): ProductPriceRemovedPayload {
    return {
        oldPrice: parsePrice(apiPayload.oldPrice),
    };
}

/**
 * Converts a created event from the API to our internal ProductCreatedPayload type
 */
function mapCreatedPayload(apiPayload: ProductCreatedEventPayloadData): ProductCreatedPayload {
    return {
        state: parseProductState(apiPayload.state),
        price: apiPayload.price ? parsePrice(apiPayload.price) : undefined,
    };
}

function mapEstimatePriceChangedPayload(
    apiPayload: ProductEventEstimatePriceChangedPayloadData,
): ProductEstimatePriceChangedPayload {
    return {
        priceEstimateMin: apiPayload.priceEstimateMin
            ? parsePrice(apiPayload.priceEstimateMin)
            : undefined,
        priceEstimateMax: apiPayload.priceEstimateMax
            ? parsePrice(apiPayload.priceEstimateMax)
            : undefined,
    };
}

function mapUrlChangedPayload(
    apiPayload: ProductEventUrlChangedPayloadData,
): ProductUrlChangedPayload {
    return { url: apiPayload.url };
}

function mapImagesChangedPayload(
    apiPayload: ProductEventImagesChangedPayloadData,
): ProductImagesChangedPayload {
    return { imageCount: apiPayload.images.length };
}

function mapAuctionTimeChangedPayload(
    apiPayload: ProductEventAuctionTimeChangedPayloadData,
): ProductAuctionTimeChangedPayload {
    return {
        auctionStart: apiPayload.auctionStart ? new Date(apiPayload.auctionStart) : undefined,
        auctionEnd: apiPayload.auctionEnd ? new Date(apiPayload.auctionEnd) : undefined,
    };
}

function mapOriginYearChangedPayload(
    apiPayload: ProductEventOriginYearChangedPayloadData,
): ProductOriginYearChangedPayload {
    return {
        originYear: apiPayload.originYear.year != null ? apiPayload.originYear.year : undefined,
        originYearMin: apiPayload.originYear.min != null ? apiPayload.originYear.min : undefined,
        originYearMax: apiPayload.originYear.max != null ? apiPayload.originYear.max : undefined,
    };
}

function mapAuthenticityChangedPayload(
    apiPayload: ProductEventAuthenticityChangedPayloadData,
): ProductAuthenticityChangedPayload {
    return { authenticity: parseAuthenticity(apiPayload.authenticity) };
}

function mapConditionChangedPayload(
    apiPayload: ProductEventConditionChangedPayloadData,
): ProductConditionChangedPayload {
    return { condition: parseCondition(apiPayload.condition) };
}

function mapProvenanceChangedPayload(
    apiPayload: ProductEventProvenanceChangedPayloadData,
): ProductProvenanceChangedPayload {
    return { provenance: parseProvenance(apiPayload.provenance) };
}

function mapRestorationChangedPayload(
    apiPayload: ProductEventRestorationChangedPayloadData,
): ProductRestorationChangedPayload {
    return { restoration: parseRestoration(apiPayload.restoration) };
}

/**
 * Converts any event payload from the API to our internal types
 * Uses event type for new events and structural checks for existing event types
 * (for backward compatibility with the existing discrimination strategy).
 */
function mapEventPayload(
    eventType: string,
    apiPayload: ProductEventPayloadData,
):
    | ProductCreatedPayload
    | ProductStateChangedPayload
    | ProductPriceChangedPayload
    | ProductPriceDiscoveredPayload
    | ProductPriceRemovedPayload
    | ProductEstimatePriceChangedPayload
    | ProductUrlChangedPayload
    | ProductImagesChangedPayload
    | ProductAuctionTimeChangedPayload
    | ProductOriginYearChangedPayload
    | ProductAuthenticityChangedPayload
    | ProductConditionChangedPayload
    | ProductProvenanceChangedPayload
    | ProductRestorationChangedPayload {
    switch (eventType) {
        case "ESTIMATE_PRICE_CHANGED":
            return mapEstimatePriceChangedPayload(
                apiPayload as ProductEventEstimatePriceChangedPayloadData,
            );
        case "URL_CHANGED":
            return mapUrlChangedPayload(apiPayload as ProductEventUrlChangedPayloadData);
        case "IMAGES_CHANGED":
            return mapImagesChangedPayload(apiPayload as ProductEventImagesChangedPayloadData);
        case "AUCTION_TIME_CHANGED":
            return mapAuctionTimeChangedPayload(
                apiPayload as ProductEventAuctionTimeChangedPayloadData,
            );
        case "ORIGIN_YEAR_CHANGED":
            return mapOriginYearChangedPayload(
                apiPayload as ProductEventOriginYearChangedPayloadData,
            );
        case "AUTHENTICITY_CHANGED":
            return mapAuthenticityChangedPayload(
                apiPayload as ProductEventAuthenticityChangedPayloadData,
            );
        case "CONDITION_CHANGED":
            return mapConditionChangedPayload(
                apiPayload as ProductEventConditionChangedPayloadData,
            );
        case "PROVENANCE_CHANGED":
            return mapProvenanceChangedPayload(
                apiPayload as ProductEventProvenanceChangedPayloadData,
            );
        case "RESTORATION_CHANGED":
            return mapRestorationChangedPayload(
                apiPayload as ProductEventRestorationChangedPayloadData,
            );
    }

    if (isCreatedPayload(apiPayload)) {
        return mapCreatedPayload(apiPayload);
    }

    if (isStateChangedPayload(apiPayload)) {
        return mapStateChangedPayload(apiPayload);
    }

    if (isPriceChangedPayload(apiPayload)) {
        return mapPriceChangedPayload(apiPayload);
    }

    if (isPriceDiscoveredPayload(apiPayload)) {
        return mapPriceDiscoveredPayload(apiPayload);
    }

    if (isPriceRemovedPayload(apiPayload)) {
        return mapPriceRemovedPayload(apiPayload);
    }

    return {
        state: parseProductState("UNKNOWN"),
        price: undefined,
    };
}

/**
 * Converts complete product data from the API to our internal ProductDetail type
 * Includes all product information and the full event history
 */
export function mapToDetailProduct(
    apiData: PersonalizedGetProductData,
    historyData: GetProductEventData[] | undefined,
    locale: string,
): ProductDetail {
    return {
        ...mapPersonalizedGetProductDataToOverviewProduct(apiData, locale),
        history: historyData?.map(
            (apiEvent: GetProductEventData): ProductEvent => ({
                eventType: apiEvent.eventType,
                productId: apiEvent.productId,
                eventId: apiEvent.eventId,
                shopId: apiEvent.shopId,
                shopsProductId: apiEvent.shopsProductId,
                payload: mapEventPayload(apiEvent.eventType, apiEvent.payload),
                timestamp: new Date(apiEvent.timestamp),
            }),
        ),
    };
}
