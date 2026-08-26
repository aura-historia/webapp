import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import type { ProductState } from "@/data/internal/product/ProductState.ts";
import type { TFunction } from "i18next";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
} from "./eventFilters.ts";

/**
 * Extracts the price amount from a price event in minor currency units.
 */
export function getPriceAmount(event: ProductEvent): number | undefined {
    if (isCreatedEvent(event)) {
        return event.payload.price?.amount;
    }
    if (isPriceDiscoveredEvent(event)) {
        return event.payload.newPrice.amount;
    }
    if (isPriceChangedEvent(event)) {
        return event.payload.newPrice.amount;
    }
    if (isPriceRemovedEvent(event)) {
        return event.payload.oldPrice.amount;
    }
    return 0;
}

export function formatStateName(state: ProductState, t: TFunction): string {
    switch (state) {
        case "LISTED":
            return `'${t("productState.listed")}'`;
        case "AVAILABLE":
            return `'${t("productState.available")}'`;
        case "RESERVED":
            return `'${t("productState.reserved")}'`;
        case "SOLD":
            return `'${t("productState.sold")}'`;
        case "REMOVED":
            return `'${t("productState.removed")}'`;
        case "UNKNOWN":
            return `'${t("productState.unknown")}'`;
    }
}
