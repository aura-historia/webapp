import type { GetItemData, GetItemEventData } from "@/client";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem";

export type ItemEvent = Omit<GetItemEventData, "timestamp"> & {
    readonly timestamp: Date;
};

export type ItemDetail = OverviewItem & {
    readonly history?: readonly ItemEvent[];
};

export function mapToDetailItem(apiData: GetItemData): ItemDetail {
    return {
        ...mapToInternalOverviewItem(apiData),
        history: apiData.history?.map((event) => ({
            ...event,
            timestamp: new Date(event.timestamp),
        })),
    };
}
