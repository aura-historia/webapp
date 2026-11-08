import { Link } from "@tanstack/react-router";
import { ImageIcon, Loader2, Search, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import {
    serializeSearchParams,
    validateSearchParams,
} from "@/features/search/products/lib/searchValidation.ts";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { ShopListingSearch } from "@/features/shop/profile/components/ShopListingSearch.tsx";
import { useShopProducts } from "@/features/shop/profile/hooks/useShopProducts.ts";
import {
    SHOP_GRID_CLASS,
    SHOP_MONO_LABEL_CLASS,
    SHOP_PRIMARY_BUTTON_CLASS,
    SHOP_TEXT_LINK_CLASS,
} from "@/features/shop/profile/lib/shopStyles.ts";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;
const HEADING_ID = "shop-listings-heading";
const RESULTS_ID = "shop-listings-results";

type ShopListingsProps = {
    readonly source: PublicListingSource;
    /** The active in-page search; empty for the full list. */
    readonly query: string;
    readonly onQueryChange: (query: string) => void;
};

function StateIcon({
    alert = false,
    children,
}: {
    readonly alert?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <span
            aria-hidden="true"
            className={
                alert
                    ? "inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    : "inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
            }
        >
            {children}
        </span>
    );
}

type SearchStatusLineProps = {
    readonly query: string;
    readonly isPending: boolean;
    /** Matches loaded without an error; the result line shows only then. */
    readonly hasResults: boolean;
    readonly total: number | undefined;
    readonly onShowAll: () => void;
};

/**
 * Ruled line under the heading. The `<output>` stays mounted so screen readers hear "Searching…"
 * and the result count as they change; it is empty while the full list shows.
 */
function SearchStatusLine({
    query,
    isPending,
    hasResults,
    total,
    onShowAll,
}: SearchStatusLineProps) {
    const { t } = useTranslation();
    const searching = query.length > 0;
    const loading = searching && isPending;
    const showResults = searching && !isPending && hasResults;

    let text: ReactNode = null;
    if (loading) {
        text = (
            <>
                <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                />
                {t("shop.search.searching", { query })}
            </>
        );
    } else if (showResults) {
        text =
            total === undefined
                ? t("shop.search.resultsFallback", { query })
                : t("shop.search.results", { count: total, query });
    }

    return (
        <div className="mb-5 flex min-h-11 items-center justify-between gap-3 border-b border-line-subtle md:mb-6 md:gap-4">
            <output
                className={
                    loading
                        ? "flex items-center gap-2.5 text-body-sm text-ink-muted"
                        : "min-w-0 text-meta leading-normal text-ink-secondary sm:text-body-sm"
                }
            >
                {text}
            </output>
            {showResults && (
                <button type="button" onClick={onShowAll} className={SHOP_TEXT_LINK_CLASS}>
                    {t("shop.search.showAll")}
                </button>
            )}
        </div>
    );
}

function ListingsLoading() {
    const { t } = useTranslation();

    return (
        <div className={SHOP_GRID_CLASS} aria-busy="true">
            <output className="sr-only">{t("shop.listings.loading")}</output>
            {SKELETON_IDS.map((id) => (
                <SearchResultCardSkeleton key={id} />
            ))}
        </div>
    );
}

function ListingsError({ onRetry }: { readonly onRetry: () => void }) {
    const { t } = useTranslation();

    return (
        <ResultStatePanel
            alert
            icon={
                <StateIcon alert>
                    <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                </StateIcon>
            }
            title={
                <Trans i18nKey="shop.listings.error.headline" components={HEADLINE_COMPONENTS} />
            }
            description={t("shop.listings.error.description")}
        >
            <button type="button" onClick={onRetry} className={RESULT_SECONDARY_BUTTON_CLASS}>
                {t("shop.listings.error.retry")}
            </button>
        </ResultStatePanel>
    );
}

function ListingsNoMatches({
    providerName,
    query,
    onShowAll,
}: {
    readonly providerName: string;
    readonly query: string;
    readonly onShowAll: () => void;
}) {
    const { t } = useTranslation();

    return (
        <ResultStatePanel
            icon={
                <StateIcon>
                    <Search className="size-[22px]" strokeWidth={1.7} />
                </StateIcon>
            }
            title={
                <Trans i18nKey="shop.search.noMatches.headline" components={HEADLINE_COMPONENTS} />
            }
            description={t("shop.search.noMatches.description", { provider: providerName, query })}
        >
            <Link
                to="/$lng/search"
                params={true}
                from="/$lng"
                search={serializeSearchParams(validateSearchParams({ q: query }))}
                className={SHOP_PRIMARY_BUTTON_CLASS}
            >
                {t("shop.search.noMatches.searchAll")}
            </Link>
            <button type="button" onClick={onShowAll} className={RESULT_SECONDARY_BUTTON_CLASS}>
                {t("shop.search.showAll")}
            </button>
        </ResultStatePanel>
    );
}

function ListingsEmpty({ providerName }: { readonly providerName: string }) {
    const { t } = useTranslation();

    return (
        <ResultStatePanel
            icon={
                <StateIcon>
                    <ImageIcon className="size-[22px]" strokeWidth={1.7} />
                </StateIcon>
            }
            title={
                <Trans i18nKey="shop.listings.empty.headline" components={HEADLINE_COMPONENTS} />
            }
            description={t("shop.listings.empty.description", { provider: providerName })}
        >
            <Link
                to="/$lng/search"
                params={true}
                from="/$lng"
                className={RESULT_SECONDARY_BUTTON_CLASS}
            >
                <Search aria-hidden="true" className="mr-2 size-[15px]" strokeWidth={1.8} />
                {t("shop.listings.empty.cta")}
            </Link>
        </ResultStatePanel>
    );
}

/**
 * The provider's indexed listings: newest update first, or the best matches for an in-page search
 * that runs on the server over all of the provider's listings. Loads more on scroll in both cases.
 */
export function ShopListings({ source, query, onQueryChange }: ShopListingsProps) {
    const { t } = useTranslation();
    const { ref: sentinelRef, inView } = useInView();
    const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useShopProducts(source.listingSourceId, query);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const products = data?.pages.flatMap((page) => page.products) ?? [];
    const searching = query.length > 0;
    const showAll = () => onQueryChange("");

    let content: ReactNode;
    if (isPending) {
        content = <ListingsLoading />;
    } else if (error) {
        console.error(error);
        content = <ListingsError onRetry={() => refetch()} />;
    } else if (products.length === 0 && hasNextPage) {
        // An empty page that still has a cursor: keep loading instead of claiming there is nothing.
        content = <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    } else if (products.length === 0 && searching) {
        content = (
            <ListingsNoMatches providerName={source.name} query={query} onShowAll={showAll} />
        );
    } else if (products.length === 0) {
        content = <ListingsEmpty providerName={source.name} />;
    } else {
        content = (
            <>
                <div className={SHOP_GRID_CLASS}>
                    {products.map((product) => (
                        <SearchResultCard key={product.productListingId} product={product} />
                    ))}
                </div>

                {(isFetchingNextPage || !hasNextPage) && (
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        loadingMoreKey="shop.listings.loadingMore"
                        allLoadedFallbackKey={
                            searching ? "shop.search.allLoaded" : "shop.listings.allLoaded"
                        }
                        allLoadedValues={searching ? { query } : { provider: source.name }}
                    />
                )}

                {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
            </>
        );
    }

    return (
        <section aria-labelledby={HEADING_ID} className="mt-9 sm:mt-14">
            <div className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-9 md:gap-y-5">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                    <h2
                        id={HEADING_ID}
                        className="font-serif text-[30px] leading-[1.1] font-normal tracking-[-0.01em] sm:text-[32px] [&_em]:italic"
                    >
                        <Trans i18nKey="shop.listings.heading" components={HEADLINE_COMPONENTS} />
                    </h2>
                    <span className={SHOP_MONO_LABEL_CLASS}>
                        {searching
                            ? t("shop.listings.sortRelevance")
                            : t("shop.listings.sortRecent")}
                    </span>
                </div>
                <ShopListingSearch
                    providerName={source.name}
                    query={query}
                    onSearch={onQueryChange}
                    resultsId={RESULTS_ID}
                />
            </div>

            <SearchStatusLine
                query={query}
                isPending={isPending}
                hasResults={!error && products.length > 0}
                total={data?.pages[0]?.total}
                onShowAll={showAll}
            />

            <div id={RESULTS_ID}>{content}</div>
        </section>
    );
}
