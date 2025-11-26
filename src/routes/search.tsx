import { SearchFilters } from "@/components/search/SearchFilters.tsx";
import { H1 } from "@/components/typography/H1";
import { createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { mapFiltersToUrlParams } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import { type ItemState, parseItemState } from "@/data/internal/ItemState.ts";
import { ScrollToTopButton } from "@/components/search/ScrollToTopButton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Filter } from "lucide-react";
import { useState } from "react";

import { SEARCH_RESULT_SORT_FIELDS, type SortMode } from "@/data/internal/SortMode.ts";
import { SortModeSelection } from "@/components/search/SortModeSelection.tsx";
import { SearchResults } from "@/components/search/SearchResults.tsx";

export const Route = createFileRoute("/search")({
    validateSearch: (
        search: {
            q: string;
            priceFrom?: number;
            priceTo?: number;
            allowedStates?: ItemState[];
            creationDateFrom?: string;
            creationDateTo?: string;
            updateDateFrom?: string;
            updateDateTo?: string;
            merchant?: string;
            sortField?: string;
            sortOrder?: string;
        } & SearchSchemaInput,
    ): SearchFilterArguments => {
        const priceFrom = Number(search.priceFrom);
        const priceTo = Number(search.priceTo);

        const validPriceFrom = Number.isNaN(priceFrom) ? undefined : priceFrom;
        const validPriceTo = Number.isNaN(priceTo) ? undefined : priceTo;

        let fromCreationDate: Date | undefined;
        let toCreationDate: Date | undefined;

        let fromUpdateDate: Date | undefined;
        let toUpdateDate: Date | undefined;

        if (search.creationDateFrom) {
            const parsed = new Date(search.creationDateFrom);
            fromCreationDate = Number.isNaN(parsed.getTime()) ? undefined : parsed;
        }

        if (search.creationDateTo) {
            const parsed = new Date(search.creationDateTo);
            toCreationDate = Number.isNaN(parsed.getTime()) ? undefined : parsed;
        }

        if (search.updateDateFrom) {
            const parsed = new Date(search.updateDateFrom);
            fromUpdateDate = Number.isNaN(parsed.getTime()) ? undefined : parsed;
        }

        if (search.updateDateTo) {
            const parsed = new Date(search.updateDateTo);
            toUpdateDate = Number.isNaN(parsed.getTime()) ? undefined : parsed;
        }

        const sortField = SEARCH_RESULT_SORT_FIELDS.includes(search.sortField as SortMode["field"])
            ? (search.sortField as SortMode["field"])
            : "RELEVANCE";

        const sortOrder =
            search.sortOrder === "ASC" || search.sortOrder === "DESC" ? search.sortOrder : "DESC";

        return {
            q: (search.q as string) || "",
            priceFrom: validPriceFrom,
            priceTo: validPriceTo,
            allowedStates: Array.isArray(search.allowedStates)
                ? search.allowedStates
                      .map((state) => parseItemState(state))
                      .filter((elem, index, self) => index === self.indexOf(elem))
                : undefined,
            creationDateFrom: fromCreationDate,
            creationDateTo: toCreationDate,
            updateDateFrom: fromUpdateDate,
            updateDateTo: toUpdateDate,
            merchant: (search.merchant?.trim() as string) || undefined,
            sortField: sortField,
            sortOrder: sortOrder,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const searchArgs = Route.useSearch();
    const navigate = Route.useNavigate();
    const { t } = useTranslation();
    const [totalResults, setTotalResults] = useState<number | null>(null);
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    const closeFilterSheet = () => {
        setIsFilterSheetOpen(false);
    };

    const sortMode = {
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    };

    const updateSortMode = (newSortMode: SortMode) => {
        navigate({
            search: (prev) => ({
                ...mapFiltersToUrlParams({
                    query: prev.q,
                    ...prev,
                }),
                sortField: newSortMode.field,
                sortOrder: newSortMode.order,
            }),
        });
    };

    return (
        <>
            <div className="max-w-6xl mx-auto flex flex-col gap-4 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
                <div className="flex flex-row items-end gap-8">
                    <div className="hidden lg:block lg:w-[30%] min-w-0">
                        <H2>{t("search.filters")}</H2>
                    </div>
                    <div className="lg:w-[70%] w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                            <div className="flex flex-col min-w-0">
                                <H1>{t("search.resultsFor")}</H1>
                                <div className="text-3xl sm:text-4xl font-bold text-ellipsis overflow-hidden break-words">
                                    "{searchArgs.q}"
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                {totalResults !== null && (
                                    <span className="text-2xl font-semibold whitespace-nowrap hidden md:block ">
                                        {t("search.totalResults", { count: totalResults })}
                                    </span>
                                )}
                                <div className="hidden lg:block">
                                    <SortModeSelection
                                        sortMode={sortMode}
                                        updateSortMode={updateSortMode}
                                    />
                                </div>
                            </div>
                        </div>

                        {totalResults !== null && (
                            <span className="block md:hidden text-2xl font-semibold mt-4">
                                {t("search.totalResults", { count: totalResults })}
                            </span>
                        )}

                        <div className="flex flex-row gap-2 mt-2 lg:hidden">
                            <Drawer
                                direction="left"
                                open={isFilterSheetOpen}
                                onOpenChange={setIsFilterSheetOpen}
                            >
                                <DrawerTrigger asChild>
                                    <Button variant="filter">
                                        <Filter className="h-4 w-4" />
                                        {t("search.filters")}
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent className="h-full flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <SearchFilters
                                            searchFilters={searchArgs}
                                            onFiltersApplied={closeFilterSheet}
                                        />
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
                </div>
                <div className="flex flex-col lg:flex-row items-start gap-8">
                    <div className="w-full lg:w-[30%] min-w-0 lg:pb-0 pb-8 border-b lg:border-b-0 border-gray-300 hidden lg:block">
                        <SearchFilters searchFilters={searchArgs} />
                    </div>
                    <div className={"flex-col w-full lg:w-[70%] min-w-0"}>
                        <SearchResults searchFilters={searchArgs} onTotalChange={setTotalResults} />
                    </div>
                </div>
            </div>
            <ScrollToTopButton />
        </>
    );
}
