import { SearchX, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { SaveSearchButton } from "@/features/saved-searches/components/SaveSearchButton.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
    SearchHiddenMatchCard,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { GeographySearchError } from "@/features/search/products/lib/searchErrors.ts";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import { formatGeographicDistance } from "@/features/geography/lib/formatGeography.ts";
import { parseSearchDistance, type SearchLocation } from "@/data/internal/search/SearchLocation.ts";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    /** The resolved starting point of a distance search. */
    readonly origin?: SearchOrigin;
    readonly onTotalChange?: (total?: number) => void;
    readonly onResetFilters: () => void;
    /** Applies a changed search, for the distance search's empty-state actions. */
    readonly onChangeFilters?: (next: SearchFilterArguments) => void;
};

const NO_ORIGIN: SearchOrigin = { status: "none" };
const PANEL_ICON_CLASS =
    "inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring";

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

/** Two columns on phones and tablets, three once the results column is wide enough. */
export const RESULT_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 min-[1180px]:grid-cols-3";

export function SearchResults({
    searchFilters,
    origin = NO_ORIGIN,
    onTotalChange,
    onResetFilters,
    onChangeFilters,
}: SearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t, i18n } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useSearch(searchFilters, origin);
    const distanceLocation =
        searchFilters.location?.kind === "DISTANCE" && origin.status === "ready"
            ? searchFilters.location
            : undefined;
    const changeLocation = (location: SearchLocation | undefined) =>
        onChangeFilters?.({ ...searchFilters, location });

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];
    const totalProducts = data?.pages[0]?.total;
    const allLoaded = allProducts.length > 0 && !hasNextPage;

    useEffect(() => {
        onTotalChange?.(totalProducts);
    }, [totalProducts, onTotalChange]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isPending) {
        return (
            <div className={RESULT_GRID_CLASS} role="status" aria-busy="true">
                <span className="sr-only">{t("search.messages.loading")}</span>
                {SKELETON_IDS.map((id) => (
                    <SearchResultCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error instanceof GeographySearchError) {
        return (
            <ResultStatePanel
                alert
                icon={
                    <span aria-hidden="true" className={PANEL_ICON_CLASS}>
                        <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="search.location.rejected.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("search.location.rejected.description")}
            >
                <button
                    type="button"
                    onClick={() => changeLocation(undefined)}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.location.reset")}
                </button>
            </ResultStatePanel>
        );
    }

    if (error) {
        console.error(error);
        return (
            <ResultStatePanel
                alert
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="search.messages.error.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("search.messages.error.description")}
            >
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.messages.error.retry")}
                </button>
            </ResultStatePanel>
        );
    }

    if (allProducts.length === 0 && hasNextPage) {
        return <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    }

    if (allProducts.length === 0 && distanceLocation && origin.status === "ready") {
        const distance = formatGeographicDistance(distanceLocation.radius, i18n.language, t);
        const wider = parseSearchDistance(
            distanceLocation.radius.amount * 2,
            distanceLocation.radius.unit,
        );
        return (
            <ResultStatePanel
                icon={
                    <span aria-hidden="true" className={PANEL_ICON_CLASS}>
                        <SearchX className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="search.location.noResults.headline"
                        values={{ distance }}
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("search.location.noResults.description", {
                    distance,
                    origin: origin.label,
                })}
            >
                {wider && (
                    <button
                        type="button"
                        onClick={() => changeLocation({ ...distanceLocation, radius: wider })}
                        className={RESULT_SECONDARY_BUTTON_CLASS}
                    >
                        {t("search.location.noResults.widen", {
                            distance: formatGeographicDistance(wider, i18n.language, t),
                        })}
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => changeLocation(undefined)}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.location.noResults.removeDistance")}
                </button>
            </ResultStatePanel>
        );
    }

    if (allProducts.length === 0) {
        return (
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <SearchX className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="search.messages.noResults.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={`${t("search.messages.noResults.description")} ${t("search.messages.noResults.saveHint")}`}
            >
                <button
                    type="button"
                    onClick={onResetFilters}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.resetAllFilters")}
                </button>
                <SaveSearchButton searchArgs={searchFilters} size="md" />
            </ResultStatePanel>
        );
    }

    return (
        <div>
            <div className={RESULT_GRID_CLASS}>
                {allProducts.map((product) =>
                    product.userState?.searchFilter?.hidden === true ? (
                        <SearchHiddenMatchCard key={product.productListingId} />
                    ) : (
                        <SearchResultCard
                            key={product.productListingId}
                            product={product}
                            distanceUnit={distanceLocation?.radius.unit}
                        />
                    ),
                )}
            </div>

            {(isFetchingNextPage || allLoaded) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    progress={
                        totalProducts == null
                            ? undefined
                            : t("search.messages.loadedOf", {
                                  loaded: allProducts.length.toLocaleString(i18n.language),
                                  total: totalProducts.toLocaleString(i18n.language),
                              })
                    }
                />
            )}

            {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
