import type { ShopType } from "@/data/internal/shop/ShopType.ts";
import type { ShopPartnerStatus } from "@/data/internal/shop/ShopPartnerStatus.ts";
import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";

export type ShopSearchFilterArguments = {
    q: string;
    shopType?: ShopType[];
    partnerStatus?: ShopPartnerStatus[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    sortField?: ShopSortMode["field"];
    sortOrder?: ShopSortMode["order"];
};
