import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";

export const SHOP_FILTER_DEFAULTS: ShopFilterSchema = {
    shopType: [...SHOP_TYPES],
    partnerStatus: [...SHOP_PARTNER_STATUSES],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
};
