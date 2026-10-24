import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

export type DateFilterKey = "auctionDate" | "creationDate" | "updateDate";

/** One applied filter as it appears in the chip row above the results. */
export type ActiveFilter =
    | { readonly kind: "availability"; readonly id: string; readonly selected: number }
    | { readonly kind: "price"; readonly id: string; readonly min?: number; readonly max?: number }
    | {
          readonly kind: "includeSource" | "excludeSource";
          readonly id: string;
          readonly sourceId: string;
          readonly label: string;
      }
    | {
          readonly kind: "date";
          readonly id: string;
          readonly field: DateFilterKey;
          readonly from?: Date;
          readonly to?: Date;
      };

const DATE_FIELDS = {
    auctionDate: ["auctionDateFrom", "auctionDateTo"],
    creationDate: ["creationDateFrom", "creationDateTo"],
    updateDate: ["updateDateFrom", "updateDateTo"],
} as const satisfies Record<
    DateFilterKey,
    readonly [keyof SearchFilterArguments, keyof SearchFilterArguments]
>;

function sourceFilters(
    kind: "includeSource" | "excludeSource",
    ids: readonly string[] | undefined,
    labels: readonly string[] | undefined,
): ActiveFilter[] {
    return (ids ?? []).map((sourceId, index) => ({
        kind,
        id: `${kind}:${sourceId}`,
        sourceId,
        label: labels?.[index] ?? sourceId,
    }));
}

/** Lists the filters that differ from their defaults, in the order of the filter panel. */
export function getActiveFilters(args: SearchFilterArguments): ActiveFilter[] {
    const filters: ActiveFilter[] = [];

    if (args.availability && args.availability.length < LISTING_AVAILABILITIES.length) {
        filters.push({
            kind: "availability",
            id: "availability",
            selected: args.availability.length,
        });
    }

    filters.push(
        ...sourceFilters("includeSource", args.listingSourceId, args.listingSourceLabels),
        ...sourceFilters(
            "excludeSource",
            args.excludeListingSourceId,
            args.excludeListingSourceLabels,
        ),
    );

    if (args.priceFrom != null || args.priceTo != null) {
        filters.push({ kind: "price", id: "price", min: args.priceFrom, max: args.priceTo });
    }

    for (const field of Object.keys(DATE_FIELDS) as DateFilterKey[]) {
        const [fromKey, toKey] = DATE_FIELDS[field];
        const from = args[fromKey] as Date | undefined;
        const to = args[toKey] as Date | undefined;
        if (from || to) {
            filters.push({ kind: "date", id: field, field, from, to });
        }
    }

    return filters;
}

function withoutSource(
    ids: readonly string[] | undefined,
    labels: readonly string[] | undefined,
    sourceId: string,
): { ids?: string[]; labels?: string[] } {
    const index = ids?.indexOf(sourceId) ?? -1;
    if (!ids || index < 0)
        return { ids: ids ? [...ids] : undefined, labels: labels ? [...labels] : undefined };

    const nextIds = ids.filter((_, i) => i !== index);
    const nextLabels = labels?.filter((_, i) => i !== index);
    return {
        ids: nextIds.length ? nextIds : undefined,
        labels: nextLabels?.length ? nextLabels : undefined,
    };
}

/** Returns the search arguments with one applied filter reset to its default. */
export function removeActiveFilter(
    args: SearchFilterArguments,
    filter: ActiveFilter,
): SearchFilterArguments {
    switch (filter.kind) {
        case "availability":
            return { ...args, availability: undefined };
        case "price":
            return { ...args, priceFrom: undefined, priceTo: undefined };
        case "includeSource": {
            const { ids, labels } = withoutSource(
                args.listingSourceId,
                args.listingSourceLabels,
                filter.sourceId,
            );
            return { ...args, listingSourceId: ids, listingSourceLabels: labels };
        }
        case "excludeSource": {
            const { ids, labels } = withoutSource(
                args.excludeListingSourceId,
                args.excludeListingSourceLabels,
                filter.sourceId,
            );
            return { ...args, excludeListingSourceId: ids, excludeListingSourceLabels: labels };
        }
        case "date": {
            const [fromKey, toKey] = DATE_FIELDS[filter.field];
            return { ...args, [fromKey]: undefined, [toKey]: undefined };
        }
    }
}
