import type { TFunction } from "i18next";
import { z } from "zod";

import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";

export const createFilterSchema = (t: TFunction) =>
    z
        .object({
            priceSpan: z
                .object({
                    min: z.number().min(0).optional().or(z.undefined()),
                    max: z.number().min(0).optional().or(z.undefined()),
                })
                .optional(),
            productState: z.array(z.enum(PRODUCT_STATES)),
            creationDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            updateDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            auctionDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            merchant: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            excludeMerchant: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            seller: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            excludeSeller: z.array(z.string()).optional().or(z.array(z.string()).max(0)),
            shopType: z.array(z.enum(SHOP_TYPES)),
        })
        .superRefine((data, ctx) => {
            if (
                data.creationDate.from &&
                data.creationDate.to &&
                data.creationDate.from > data.creationDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["creationDate", "to"],
                });
            }
            if (
                data.updateDate.from &&
                data.updateDate.to &&
                data.updateDate.from > data.updateDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["updateDate", "to"],
                });
            }
            if (
                data.auctionDate.from &&
                data.auctionDate.to &&
                data.auctionDate.from > data.auctionDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["auctionDate", "to"],
                });
            }
        });

export type FilterSchema = z.infer<ReturnType<typeof createFilterSchema>>;

export function mapSearchFiltersToFormValues(filters: SearchFilterArguments): FilterSchema {
    return {
        priceSpan: {
            min: filters.priceFrom,
            max: filters.priceTo,
        },
        productState: filters.allowedStates ?? FILTER_DEFAULTS.productState,
        creationDate: {
            from: filters.creationDateFrom,
            to: filters.creationDateTo,
        },
        updateDate: {
            from: filters.updateDateFrom,
            to: filters.updateDateTo,
        },
        auctionDate: {
            from: filters.auctionDateFrom,
            to: filters.auctionDateTo,
        },
        merchant: filters.merchant,
        excludeMerchant: filters.excludeMerchant,
        seller: filters.seller,
        excludeSeller: filters.excludeSeller,
        shopType: filters.shopType ?? FILTER_DEFAULTS.shopType,
    };
}

export function mapFormValuesToSearchFilterArguments(
    data: FilterSchema,
    q: string,
): SearchFilterArguments {
    return {
        q,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        allowedStates: data.productState,
        creationDateFrom: data.creationDate.from,
        creationDateTo: data.creationDate.to,
        updateDateFrom: data.updateDate.from,
        updateDateTo: data.updateDate.to,
        auctionDateFrom: data.auctionDate.from,
        auctionDateTo: data.auctionDate.to,
        merchant: data.merchant?.length ? data.merchant : undefined,
        excludeMerchant: data.excludeMerchant?.length ? data.excludeMerchant : undefined,
        shopType: data.shopType,
    };
}

export const DEBOUNCE_DELAY_MS = 500;

export const DEBOUNCED_FIELDS = new Set(["priceSpan.min", "priceSpan.max"]);
