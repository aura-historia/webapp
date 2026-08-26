import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookmarkPlus, Filter } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button.tsx";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { FloatingSaveSearchFilterButton } from "@/components/search/FloatingSaveSearchFilterButton.tsx";
import { SaveSearchFilterDialog } from "@/components/search/SaveSearchFilterDialog.tsx";
import { SEARCH_FILTER_QUOTA } from "@/data/internal/account/SubscriptionType.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { ScrollToTopButton } from "@/features/search/common/components/ScrollToTopButton.tsx";
import { SearchFilters } from "@/features/search/products/components/SearchFilters.tsx";
import { SearchResults } from "@/features/search/products/components/SearchResults.tsx";
import { SortModeSelection } from "@/features/search/products/components/SortModeSelection.tsx";
import { serializeSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { useUserSearchFilters } from "@/hooks/search-filters/useUserSearchFilters.ts";

type ProductSearchPageProps = {
    readonly searchArgs: SearchFilterArguments;
};

export function ProductSearchPage({ searchArgs }: ProductSearchPageProps) {
    const navigate = useNavigate({ from: "/$lng/search" });
    const { t } = useTranslation();
    const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
    const { isAuthenticated } = useResolvedAuth();
    const { data: account } = useUserAccount();
    const { data: savedFilters } = useUserSearchFilters(isAuthenticated);

    const saveDisabled =
        !isAuthenticated ||
        (savedFilters?.total ?? 0) >= SEARCH_FILTER_QUOTA[account?.subscriptionType ?? "free"];

    let saveTooltip: string | undefined;
    if (!isAuthenticated) {
        saveTooltip = t("searchFilter.loginRequired");
    } else if (saveDisabled) {
        saveTooltip = t("searchFilter.quotaReached");
    }

    const sortMode = {
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    } satisfies SortMode;

    const updateSortMode = (newSortMode: SortMode) => {
        navigate({
            search: (prev) => ({
                ...serializeSearchParams(prev),
                sortField: newSortMode.field,
                sortOrder: newSortMode.order,
            }),
        });
    };

    return (
        <>
            <div className="bg-background">
                <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]">
                    <aside className="hidden border-r border-outline-variant/20 h-full bg-surface-container-high p-6 lg:block lg:self-start">
                        <H2 className="text-3xl! text-primary-container">{t("search.filters")}</H2>
                        <SearchFilters searchFilters={searchArgs} />
                    </aside>

                    <div className="bg-surface-container-low px-6 py-8 sm:px-8 lg:px-10">
                        <div className="min-w-0">
                            <div className="flex flex-col gap-4 pb-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-end gap-3">
                                        <H1 className="wrap-break-word text-4xl sm:text-5xl">
                                            {t("search.resultsFor")} "{searchArgs.q}"
                                        </H1>
                                        {!!totalResults && (
                                            <span className="hidden pb-1 text-sm text-on-surface-variant/70 sm:inline">
                                                ({t("search.totalResults", { count: totalResults })}
                                                )
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!!totalResults && (
                                    <span className="text-sm text-on-surface-variant/70 sm:hidden">
                                        {t("search.totalResults", { count: totalResults })}
                                    </span>
                                )}

                                <div className="hidden justify-between items-center border-b border-primary/20 pb-4 lg:flex">
                                    <SortModeSelection
                                        sortMode={sortMode}
                                        updateSortMode={updateSortMode}
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <SaveSearchFilterDialog searchArgs={searchArgs}>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={saveDisabled}
                                                        className="border-outline-variant text-primary shadow-none hover:bg-primary/8"
                                                    >
                                                        <BookmarkPlus className="size-4" />
                                                        {t("searchFilter.saveButton")}
                                                    </Button>
                                                </SaveSearchFilterDialog>
                                            </span>
                                        </TooltipTrigger>
                                        {saveTooltip && (
                                            <TooltipContent>{saveTooltip}</TooltipContent>
                                        )}
                                    </Tooltip>
                                </div>

                                <div className="mt-2 flex flex-row justify-between w-full gap-2 lg:hidden">
                                    <Drawer direction="left">
                                        <DrawerTrigger asChild>
                                            <Button variant="filter">
                                                <Filter className="h-4 w-4" />
                                                {t("search.filters")}
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent
                                            aria-describedby={undefined}
                                            className="h-full flex flex-col"
                                        >
                                            <DrawerTitle className="sr-only">
                                                {t("search.filters")}
                                            </DrawerTitle>
                                            <div className="flex-1 overflow-y-auto p-4">
                                                <SearchFilters searchFilters={searchArgs} />
                                            </div>
                                        </DrawerContent>
                                    </Drawer>

                                    <SortModeSelection
                                        sortMode={sortMode}
                                        updateSortMode={updateSortMode}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 min-w-0">
                                <SearchResults
                                    searchFilters={searchArgs}
                                    onTotalChange={setTotalResults}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FloatingSaveSearchFilterButton
                searchArgs={searchArgs}
                disabled={saveDisabled}
                tooltip={saveTooltip}
            />
            <ScrollToTopButton />
        </>
    );
}
