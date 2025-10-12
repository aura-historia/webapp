import type { ItemEventTypeData } from "@/client";

/**
 * Event type filters extracted from ItemEventTypeData.
 *
 * The generated client (types.gen.ts) only provides ItemEventTypeData with ALL event types mixed.
 * We need specific types for type guards and component props.
 *
 * - PriceEventTypeData: only PRICE_* events
 * - StateEventTypeData: only STATE_* events
 */
export type PriceEventTypeData = Extract<ItemEventTypeData, `PRICE_${string}`>;
export type StateEventTypeData = Extract<ItemEventTypeData, `STATE_${string}`>;
