import type { WatchlistItemData } from "@/client";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem.ts";

export type WatchlistItem = {
    readonly item: OverviewItem;
    readonly notificationsEnabled: boolean;
    readonly created: Date;
    readonly updated: Date;
};

export function mapToInternalWatchlistItem(apiData: WatchlistItemData): WatchlistItem {
    return {
        item: mapToInternalOverviewItem(apiData.item),
        notificationsEnabled: apiData.notifications ?? false,
        created: new Date(apiData.created),
        updated: new Date(apiData.updated),
    };
}
