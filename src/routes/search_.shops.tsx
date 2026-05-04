import { ShopSearchFilters } from "@/components/search/ShopSearchFilters.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { serializeShopSearchParams, validateShopSearchParams } from "@/lib/shopSearchValidation.ts";
import { useTranslation } from "react-i18next";
import { ScrollToTopButton } from "@/components/search/ScrollToTopButton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Filter } from "lucide-react";
import { useState } from "react";

import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";
import { ShopSortModeSelection } from "@/components/search/ShopSortModeSelection.tsx";
import { ShopSearchResults } from "@/components/search/ShopSearchResults.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/search_/shops")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchShops",
            url: `${env.VITE_APP_URL}/search/shops`,
        }),
    validateSearch: validateShopSearchParams,
    component: RouteComponent,
});

function RouteComponent() {
    const searchArgs = Route.useSearch();
    const navigate = Route.useNavigate();
    const { t } = useTranslation();
    const [totalResults, setTotalResults] = useState<number | null>(null);

    const sortMode: ShopSortMode = {
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    };

    const updateSortMode = (newSortMode: ShopSortMode) => {
        navigate({
            search: (prev) => ({
                ...serializeShopSearchParams(prev),
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
