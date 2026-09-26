import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import {
    FilterDetailRow,
    FilterDetailRowBadges,
} from "@/features/saved-searches/components/FilterDetailRow.tsx";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { ReactNode } from "react";
import { hasActiveFilters } from "@/data/internal/search/SearchFilterArguments.ts";

type ConfirmSectionProps = {
    readonly label: string;
    readonly show: boolean;
    readonly children: ReactNode;
};

function ConfirmSection({ label, show, children }: ConfirmSectionProps) {
    if (!show) return null;
    return (
        <div className="px-5 py-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                {label}
            </span>
            {children}
        </div>
    );
}

type Props = {
    readonly name: string;
    readonly search: SearchFilterArguments;
    readonly availability: (typeof LISTING_AVAILABILITIES)[number][];
    /** Hide the name row when the caller already shows it elsewhere. */
    readonly showName?: boolean;
};

export function SearchFilterSummary({ name, search, availability, showName = true }: Props) {
    const { t, i18n } = useTranslation();
    const hasSources = !!search.listingSourceId?.length || !!search.excludeListingSourceId?.length;
    const hasDate =
        search.auctionDateFrom != null ||
        search.auctionDateTo != null ||
        search.creationDateFrom != null ||
        search.creationDateTo != null ||
        search.updateDateFrom != null ||
        search.updateDateTo != null;

    return (
        <div className="border bg-muted/30 divide-y overflow-hidden">
            {showName && (
                <div className="px-5 py-4 flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                        {t("searchFilter.saveDialog.nameLabel")}
                    </span>
                    <span className="font-semibold text-base">{name}</span>
                </div>
            )}

            {!!search.queryTerms?.length && (
                <div className="px-5 py-4 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                        {t("searchFilter.saveDialog.queryLabel", {
                            count: search.queryTerms.length,
                        })}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {search.queryTerms.map((term) => (
                            <Badge key={term} variant="outline">
                                {term}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmSection
                label={t("searchFilter.wizard.step.priceStatus")}
                show={search.priceFrom != null || search.priceTo != null || availability.length > 0}
            >
                {(search.priceFrom != null || search.priceTo != null) && (
                    <FilterDetailRowBadges label={t("search.filter.priceSpan")}>
                        <Badge variant="outline">
                            {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                        </Badge>
                    </FilterDetailRowBadges>
                )}
                {availability.length > 0 && (
                    <FilterDetailRowBadges label={t("search.filter.availability")}>
                        {availability.length === LISTING_AVAILABILITIES.length ? (
                            <Badge variant="outline">{t("search.filter.all")}</Badge>
                        ) : (
                            availability.map((value) => (
                                <Badge key={value} variant="outline">
                                    {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value])}
                                </Badge>
                            ))
                        )}
                    </FilterDetailRowBadges>
                )}
            </ConfirmSection>

            <ConfirmSection label={t("search.filter.listingSources")} show={hasSources}>
                <FilterDetailRowBadges label={t("search.filter.listingSource")}>
                    {search.listingSourceId?.length ? (
                        <Badge variant="outline">
                            {t("search.filter.sourceCount", {
                                count: search.listingSourceId.length,
                            })}
                        </Badge>
                    ) : null}
                </FilterDetailRowBadges>
                <FilterDetailRowBadges label={t("search.filter.excludeListingSource")}>
                    {search.excludeListingSourceId?.length ? (
                        <Badge variant="destructive">
                            {t("search.filter.sourceCount", {
                                count: search.excludeListingSourceId.length,
                            })}
                        </Badge>
                    ) : null}
                </FilterDetailRowBadges>
            </ConfirmSection>

            <ConfirmSection label={t("searchFilter.wizard.step.date")} show={hasDate}>
                {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.auctionDate")}
                        values={[
                            `${search.auctionDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.auctionDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                        ]}
                    />
                )}
                {(search.creationDateFrom != null || search.creationDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.creationDate")}
                        values={[
                            `${search.creationDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.creationDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                        ]}
                    />
                )}
                {(search.updateDateFrom != null || search.updateDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.updateDate")}
                        values={[
                            `${search.updateDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.updateDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                        ]}
                    />
                )}
            </ConfirmSection>

            {!hasActiveFilters(search) && (
                <div className="px-5 py-4">
                    <span className="text-sm text-muted-foreground italic">
                        {t("searchFilter.wizard.noFiltersConfigured")}
                    </span>
                </div>
            )}
        </div>
    );
}
