import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { FILTERABLE_SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

export const SHOP_FILTER_DEFAULTS: ShopFilterSchema = {
    shopType: [...FILTERABLE_SHOP_TYPES],
    partnerStatus: [...SHOP_PARTNER_STATUSES],
};
