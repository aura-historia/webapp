import type { TFunction } from "i18next";
import { z } from "zod";

import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    LISTING_AVAILABILITIES,
    parseListingAvailability,
} from "@/data/internal/product/ListingAvailability.ts";
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
            availability: z.array(z.enum(LISTING_AVAILABILITIES)),
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
            listingSourceId: z.array(z.string()),
            excludeListingSourceId: z.array(z.string()),
            listingSourceLabels: z.array(z.string()),
            excludeListingSourceLabels: z.array(z.string()),
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
        availability:
            parseListingAvailability(filters.availability) ?? FILTER_DEFAULTS.availability,
        listingSourceId: filters.listingSourceId ?? [],
        excludeListingSourceId: filters.excludeListingSourceId ?? [],
        listingSourceLabels: filters.listingSourceLabels ?? [],
        excludeListingSourceLabels: filters.excludeListingSourceLabels ?? [],
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
    };
}

export function mapFormValuesToSearchFilterArguments(
    data: FilterSchema,
    q: string,
    existing: SearchFilterArguments = { q },
): SearchFilterArguments {
    return {
        ...existing,
        q,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        availability:
            data.availability.length === LISTING_AVAILABILITIES.length
                ? undefined
                : data.availability,
        creationDateFrom: data.creationDate.from,
        creationDateTo: data.creationDate.to,
        updateDateFrom: data.updateDate.from,
        updateDateTo: data.updateDate.to,
        auctionDateFrom: data.auctionDate.from,
        auctionDateTo: data.auctionDate.to,
        listingSourceId: data.listingSourceId?.length ? data.listingSourceId : undefined,
        excludeListingSourceId: data.excludeListingSourceId?.length
            ? data.excludeListingSourceId
            : undefined,
        listingSourceLabels: data.listingSourceLabels?.length
            ? data.listingSourceLabels
            : undefined,
        excludeListingSourceLabels: data.excludeListingSourceLabels?.length
            ? data.excludeListingSourceLabels
            : undefined,
    };
}

export const DEBOUNCE_DELAY_MS = 500;

export const DEBOUNCED_FIELDS = new Set(["priceSpan.min", "priceSpan.max"]);
