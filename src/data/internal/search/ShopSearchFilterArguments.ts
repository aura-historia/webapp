import type { ShopPartnerStatus } from "@/data/internal/shop/ShopPartnerStatus.ts";
import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";
import type { FilterableShopType } from "@/data/internal/shop/ShopType.ts";

export type ShopSearchFilterArguments = {
    q: string;
    shopType?: FilterableShopType[];
    partnerStatus?: ShopPartnerStatus[];
    sortField?: ShopSortMode["field"];
    sortOrder?: ShopSortMode["order"];
};
