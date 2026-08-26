import { z } from "zod";

import { SHOP_PARTNER_STATUSES } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

export const shopFilterSchema = z.object({
    shopType: z.array(z.enum(SHOP_TYPES)),
    partnerStatus: z.array(z.enum(SHOP_PARTNER_STATUSES)),
});

export type ShopFilterSchema = z.infer<typeof shopFilterSchema>;
