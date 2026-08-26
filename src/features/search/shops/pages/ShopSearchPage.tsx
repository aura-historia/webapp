import { Button } from "@/components/ui/button.tsx";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { ShopSearchFilters } from "@/features/search/shops/components/ShopSearchFilters.tsx";
import { ShopSearchResults } from "@/features/search/shops/components/ShopSearchResults.tsx";
import { ShopSortModeSelection } from "@/features/search/shops/components/ShopSortModeSelection.tsx";
import { ScrollToTopButton } from "@/features/search/common/components/ScrollToTopButton.tsx";
import { serializeShopSearchParams } from "@/features/search/shops/lib/shopSearchValidation.ts";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";
import { useNavigate } from "@tanstack/react-router";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ShopSearchPageProps = {
    readonly searchArgs: ShopSearchFilterArguments;
};

export function ShopSearchPage({ searchArgs }: ShopSearchPageProps) {
    const navigate = useNavigate({ from: "/$lng/search/shops" });
    const { t } = useTranslation();
    const [totalResults, setTotalResults] = useState<number | null>(null);

    const sortMode: ShopSortMode = {
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    };

    const updateSortMode = (newSortMode: ShopSortMode) => {
        navigate({
            search: (prev) => ({
                ...serializeShopSearchParams(prev as ShopSearchFilterArguments),
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
                        <ShopSearchFilters searchFilters={searchArgs} />
                    </aside>

                    <div className="bg-surface-container-low px-6 py-8 sm:px-8 lg:px-10">
                        <div className="min-w-0">
                            <div className="flex flex-col gap-4 pb-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-end gap-3">
                                        <H1 className="wrap-break-word text-4xl sm:text-5xl">
                                            {t("search.shopResultsFor")} "{searchArgs.q}"
                                        </H1>
                                        {totalResults !== null && (
                                            <span className="hidden pb-1 text-sm text-on-surface-variant/70 sm:inline">
                                                (
                                                {t("search.totalShopResults", {
                                                    count: totalResults,
                                                })}
                                                )
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {totalResults !== null && (
                                    <span className="text-sm text-on-surface-variant/70 sm:hidden">
                                        {t("search.totalShopResults", { count: totalResults })}
                                    </span>
                                )}

                                <div className="hidden justify-start border-b border-primary/20 pb-4 lg:flex">
                                    <ShopSortModeSelection
                                        sortMode={sortMode}
                                        updateSortMode={updateSortMode}
                                    />
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
                                                <ShopSearchFilters searchFilters={searchArgs} />
                                            </div>
                                        </DrawerContent>
                                    </Drawer>

                                    <ShopSortModeSelection
                                        sortMode={sortMode}
                                        updateSortMode={updateSortMode}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 min-w-0">
                                <ShopSearchResults
                                    searchFilters={searchArgs}
                                    onTotalChange={setTotalResults}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ScrollToTopButton />
        </>
    );
}
