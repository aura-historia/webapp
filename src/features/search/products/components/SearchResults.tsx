import { Check, Info, Loader2, SearchX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { SaveSearchButton } from "@/features/saved-searches/components/SaveSearchButton.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    SearchHiddenMatchCard,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";
import { cn } from "@/lib/utils.ts";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total?: number) => void;
    readonly onResetFilters: () => void;
};

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

/** Two columns on phones and tablets, three once the results column is wide enough. */
export const RESULT_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 min-[1180px]:grid-cols-3";

const SECONDARY_BUTTON_CLASS =
    "inline-flex h-11 cursor-pointer items-center justify-center rounded-pill px-5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

function StatePanel({
    icon,
    title,
    description,
    alert = false,
    children,
}: {
    readonly icon: ReactNode;
    readonly title: ReactNode;
    readonly description: string;
    readonly alert?: boolean;
    readonly children?: ReactNode;
}) {
    return (
        <div
            role={alert ? "alert" : undefined}
            className="flex flex-col items-center gap-4 px-4 py-16 text-center sm:py-24"
        >
            {icon}
            <h2 className="font-serif text-[30px] leading-[1.15] font-normal [&_em]:italic">
                {title}
            </h2>
            <p className="max-w-[400px] text-body text-ink-secondary">{description}</p>
            {children && (
                <div className="mt-2 flex flex-wrap justify-center gap-2.5">{children}</div>
            )}
        </div>
    );
}

function ListStatusRow({
    allLoaded,
    loaded,
    total,
}: {
    readonly allLoaded: boolean;
    readonly loaded: number;
    readonly total?: number;
}) {
    const { t, i18n } = useTranslation();
    const formatCount = (count: number) => count.toLocaleString(i18n.language);

    return (
        <div
            role="status"
            className={cn(
                "mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-line-subtle py-6 text-center text-body-sm",
                allLoaded ? "text-ink-secondary" : "text-ink-muted",
            )}
        >
            {allLoaded ? (
                <>
                    <span
                        aria-hidden="true"
                        className="inline-flex size-6 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <Check className="size-3" strokeWidth={3} />
                    </span>
                    {total
                        ? t("search.messages.allLoaded", { count: total })
                        : t("search.messages.allLoadedFallback")}
                </>
            ) : (
                <>
                    <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                    />
                    {t("search.messages.loadingMore")}
                    {total != null && (
                        <span className="font-mono text-tag tracking-[0.14em] uppercase">
                            {t("search.messages.loadedOf", {
                                loaded: formatCount(loaded),
                                total: formatCount(total),
                            })}
                        </span>
                    )}
                </>
            )}
        </div>
    );
}

export function SearchResults({
    searchFilters,
    onTotalChange,
    onResetFilters,
}: SearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useSearch(searchFilters);
    const isQueryTooShort = searchFilters.q.length < MIN_SEARCH_QUERY_LENGTH;

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];
    const totalProducts = data?.pages[0]?.total;
    const allLoaded = allProducts.length > 0 && !hasNextPage;

    useEffect(() => {
        onTotalChange?.(isQueryTooShort ? undefined : totalProducts);
    }, [totalProducts, onTotalChange, isQueryTooShort]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isQueryTooShort) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isQueryTooShort]);

    if (isQueryTooShort) {
        return (
            <div
                role="status"
                className="flex items-start gap-3 rounded-lg bg-surface-raised px-[18px] py-4 text-body text-ink-secondary shadow-field"
            >
                <Info
                    aria-hidden="true"
                    className="mt-[3px] size-[18px] shrink-0 text-ink-muted"
                    strokeWidth={1.8}
                />
                {t("search.messages.minQueryLength")}
            </div>
        );
    }

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

    if (error) {
        console.error(error);
        return (
            <StatePanel
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
                <button type="button" onClick={() => refetch()} className={SECONDARY_BUTTON_CLASS}>
                    {t("search.messages.error.retry")}
                </button>
            </StatePanel>
        );
    }

    if (allProducts.length === 0 && hasNextPage) {
        return <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    }

    if (allProducts.length === 0) {
        return (
            <StatePanel
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
                <button type="button" onClick={onResetFilters} className={SECONDARY_BUTTON_CLASS}>
                    {t("search.resetAllFilters")}
                </button>
                <SaveSearchButton searchArgs={searchFilters} size="md" />
            </StatePanel>
        );
    }

    return (
        <div>
            <div className={RESULT_GRID_CLASS}>
                {allProducts.map((product) =>
                    product.userState?.searchFilter.hidden === true ? (
                        <SearchHiddenMatchCard key={product.productListingId} />
                    ) : (
                        <SearchResultCard key={product.productListingId} product={product} />
                    ),
                )}
            </div>

            {(isFetchingNextPage || allLoaded) && (
                <ListStatusRow
                    allLoaded={allLoaded}
                    loaded={allProducts.length}
                    total={totalProducts}
                />
            )}

            {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
