import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";

export const SHOP_FILTER_DEFAULTS: ShopFilterSchema = {
    partnerStatus: [...SHOP_PARTNER_STATUSES],
};
