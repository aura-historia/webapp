import type { ShopFilterSchema } from "@/features/search/shops/lib/filterForm.ts";
import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

export const SHOP_FILTER_DEFAULTS: ShopFilterSchema = {
    shopType: [...SHOP_TYPES],
    partnerStatus: [...SHOP_PARTNER_STATUSES],
};
