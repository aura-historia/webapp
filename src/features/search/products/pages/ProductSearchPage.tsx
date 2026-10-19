import { Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import { MobileAppBar } from "@/features/app-shell/components/navigation/MobileAppBar.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { SaveSearchButton } from "@/features/saved-searches/components/SaveSearchButton.tsx";
import { ScrollToTopButton } from "@/features/search/common/components/ScrollToTopButton.tsx";
import { ActiveFilterChips } from "@/features/search/products/components/ActiveFilterChips.tsx";
import { SearchFilterDrawer } from "@/features/search/products/components/SearchFilterDrawer.tsx";
import { SearchFilters } from "@/features/search/products/components/SearchFilters.tsx";
import { SearchResults } from "@/features/search/products/components/SearchResults.tsx";
import { SearchSortControls } from "@/features/search/products/components/SearchSortControls.tsx";
import { getActiveFilters } from "@/features/search/products/lib/activeFilters.ts";
import { serializeSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type ProductSearchPageProps = {
    readonly searchArgs: SearchFilterArguments;
};

/**
 * Product search results: the filter sidebar from 1024px (a drawer below), the results
 * heading with sort and save, the applied filters as chips, and the infinite results grid.
 */
export function ProductSearchPage({ searchArgs }: ProductSearchPageProps) {
    const navigate = useNavigate({ from: "/$lng/search" });
    const { t, i18n } = useTranslation();
    const drawerId = useId();
    const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filterCount = getActiveFilters(searchArgs).length;
    const formattedTotal = totalResults?.toLocaleString(i18n.language);

    const sortMode = {
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    } satisfies SortMode;

    const updateSortMode = (next: SortMode) => {
        navigate({
            search: (prev) => ({
                ...serializeSearchParams(prev),
                sortField: next.field,
                sortOrder: next.order,
            }),
        });
    };

    const updateFilters = (next: SearchFilterArguments) => {
        navigate({ search: serializeSearchParams(next) });
    };

    const resetFilters = useCallback(() => {
        navigate({ search: { q: searchArgs.q } });
    }, [navigate, searchArgs.q]);

    const countLabel = totalResults
        ? t("search.totalObjects", { count: totalResults, formattedCount: formattedTotal })
        : undefined;

    return (
        <div className="bg-surface text-ink">
            <MobileAppBar
                filterCount={filterCount}
                filtersOpen={filtersOpen}
                onFilters={() => setFiltersOpen(true)}
                filtersId={drawerId}
                className="sticky top-15 z-40 sm:hidden"
            />

            <div className="mx-auto flex max-w-[1376px] items-start gap-14 px-[clamp(20px,4vw,48px)]">
                <aside
                    aria-label={t("search.filters")}
                    className="sticky top-16 hidden max-h-[calc(100dvh-64px)] w-[280px] shrink-0 overflow-y-auto py-10 pr-1 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] lg:block"
                >
                    <SearchFilters searchFilters={searchArgs} variant="sidebar" />
                </aside>

                <div className="min-w-0 flex-1 pt-0 pb-28 sm:pt-8 sm:pb-30">
                    <nav
                        aria-label={t("search.type.label")}
                        className="mb-6 flex gap-6 shadow-[inset_0_-1px_0_var(--line-subtle)] sm:mb-9 sm:gap-7"
                    >
                        <Link
                            to="/$lng/search"
                            params={true}
                            from="/$lng"
                            search={serializeSearchParams(searchArgs)}
                            aria-current="page"
                            className={cn(
                                "relative inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink",
                                FOCUS_CLASS,
                            )}
                        >
                            {t("search.type.objects")}
                            {formattedTotal && (
                                <span className="font-mono text-tag font-normal text-ink-muted">
                                    {formattedTotal}
                                </span>
                            )}
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 bottom-0 h-0.5 rounded-xs bg-oxblood"
                            />
                        </Link>
                        <Link
                            to="/$lng/search/shops"
                            params={true}
                            from="/$lng"
                            search={{ q: searchArgs.q }}
                            className={cn(
                                "inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-brass-ink",
                                FOCUS_CLASS,
                            )}
                        >
                            {t("search.type.providers")}
                        </Link>
                    </nav>

                    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-6">
                        <div className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
                            <p className="font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                                {t("search.eyebrow")}
                            </p>
                            <h1 className="font-serif text-[32px] leading-[1.08] font-normal tracking-[-0.02em] wrap-break-word sm:text-[clamp(34px,3.4vw,48px)] sm:leading-[1.06] [&_em]:italic">
                                <Trans
                                    i18nKey="search.resultsForQuery"
                                    values={{ query: searchArgs.q }}
                                    components={HEADLINE_COMPONENTS}
                                />
                            </h1>
                            {countLabel && (
                                <p className="text-body-sm text-ink-muted">
                                    <span className="font-mono text-label text-ink-muted uppercase sm:text-ink">
                                        {countLabel}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {" "}
                                        · {t("search.liveFiltersHint")}
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="hidden flex-wrap items-center gap-2 sm:flex">
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(true)}
                                aria-expanded={filtersOpen}
                                aria-controls={drawerId}
                                className={cn(
                                    "inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill px-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] lg:hidden",
                                    FOCUS_CLASS,
                                )}
                            >
                                <SlidersHorizontal
                                    aria-hidden="true"
                                    className="size-4"
                                    strokeWidth={1.8}
                                />
                                {t("search.filters")}
                                {filterCount > 0 && (
                                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-oxblood px-[5px] font-mono text-[10px] text-on-oxblood">
                                        {filterCount}
                                    </span>
                                )}
                            </button>
                            <SearchSortControls
                                sortMode={sortMode}
                                onChange={updateSortMode}
                                layout="toolbar"
                            />
                            <SaveSearchButton searchArgs={searchArgs} />
                        </div>
                    </header>

                    <div className="mb-3 flex gap-2 sm:hidden">
                        <SearchSortControls
                            sortMode={sortMode}
                            onChange={updateSortMode}
                            layout="compact"
                        />
                    </div>

                    <ActiveFilterChips
                        searchArgs={searchArgs}
                        onChange={updateFilters}
                        onResetAll={resetFilters}
                        layout="scroll"
                        className="mb-7 sm:hidden"
                    />
                    <ActiveFilterChips
                        searchArgs={searchArgs}
                        onChange={updateFilters}
                        onResetAll={resetFilters}
                        layout="wrap"
                        className="mb-9 hidden sm:flex"
                    />

                    <SearchResults
                        searchFilters={searchArgs}
                        onTotalChange={setTotalResults}
                        onResetFilters={resetFilters}
                    />
                </div>
            </div>

            <div className="fixed right-5 bottom-6 z-30 flex flex-col items-end gap-3 sm:right-8 sm:bottom-8">
                <SaveSearchButton
                    searchArgs={searchArgs}
                    variant="floating"
                    className="sm:hidden"
                />
                <ScrollToTopButton />
            </div>

            <SearchFilterDrawer
                id={drawerId}
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                searchArgs={searchArgs}
                totalResults={totalResults}
            />
        </div>
    );
}
