import type { ShopPartnerStatus } from "@/data/internal/shop/ShopPartnerStatus.ts";
import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";

export type ShopSearchFilterArguments = {
    q: string;
    partnerStatus?: ShopPartnerStatus[];
    sortField?: ShopSortMode["field"];
    sortOrder?: ShopSortMode["order"];
};
