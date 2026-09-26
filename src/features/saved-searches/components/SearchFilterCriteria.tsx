import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import { FilterDetailRow } from "@/features/saved-searches/components/FilterDetailRow.tsx";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

type Props = { readonly search: SearchFilterArguments };

/** Search criteria as compact badges and date/source detail rows. */
export function SearchFilterCriteriaBadges({ search }: Props) {
    const { t } = useTranslation();
    const availability = search.availability ?? [...LISTING_AVAILABILITIES];

    return (
        <div className="flex flex-wrap items-center gap-y-2 [&>span]:after:content-['·'] [&>span]:after:mx-2 [&>span]:after:text-muted-foreground/40 [&>span:last-child]:after:hidden">
            {(search.priceFrom != null || search.priceTo != null) && (
                <span className="inline-flex flex-wrap gap-1.5">
                    <Badge variant="outline">
                        {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                    </Badge>
                </span>
            )}
            {availability.length > 0 && (
                <span className="inline-flex flex-wrap gap-1.5">
                    {availability.length === LISTING_AVAILABILITIES.length ? (
                        <Badge variant="outline">{t("search.filter.all")}</Badge>
                    ) : (
                        availability.map((value) => (
                            <Badge key={value} variant="outline">
                                {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value])}
                            </Badge>
                        ))
                    )}
                </span>
            )}
        </div>
    );
}

export function SearchFilterCriteriaDetails({ search }: Props) {
    const { t, i18n } = useTranslation();
    return (
        <div className="flex flex-col gap-3">
            {!!search.listingSourceId?.length && (
                <FilterDetailRow
                    variant="text"
                    label={t("search.filter.listingSource")}
                    values={[
                        t("search.filter.sourceCount", { count: search.listingSourceId.length }),
                    ]}
                />
            )}
            {!!search.excludeListingSourceId?.length && (
                <FilterDetailRow
                    variant="text"
                    label={t("search.filter.excludeListingSource")}
                    values={[
                        t("search.filter.sourceCount", {
                            count: search.excludeListingSourceId.length,
                        }),
                    ]}
                />
            )}
            {(search.creationDateFrom != null || search.creationDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.creationDate")}
                    values={[
                        `${search.creationDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.creationDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
            {(search.updateDateFrom != null || search.updateDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.updateDate")}
                    values={[
                        `${search.updateDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.updateDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
            {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.auctionDate")}
                    values={[
                        `${search.auctionDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.auctionDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
        </div>
    );
}
