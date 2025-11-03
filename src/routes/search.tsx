import { SearchFilters } from "@/components/search/SearchFilters.tsx";
import { SimpleSearchResults } from "@/components/search/SimpleSearchResults.tsx";
import { H1 } from "@/components/typography/H1";
import { createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { FilteredSearchResults } from "@/components/search/FilteredSearchResults.tsx";
import { isSimpleSearch, mapFiltersToUrlParams } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import { type ItemState, parseItemState } from "@/data/internal/ItemState.ts";
import { ScrollToTopButton } from "@/components/search/ScrollToTopButton.tsx";

import { SEARCH_RESULT_SORT_FIELDS, type SortMode } from "@/data/internal/SortMode.ts";
import { SortModeSelection } from "@/components/search/SortModeSelection.tsx";

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
                      .filter((s) => s)
                      .filter((elem, index, self) => index === self.indexOf(elem))
                : undefined,
            creationDateFrom: fromCreationDate,
            creationDateTo: toCreationDate,
            updateDateFrom: fromUpdateDate,
            updateDateTo: toUpdateDate,
            merchant: (search.merchant?.trim() as string) || undefined,
            sortMode: { field: sortField, order: sortOrder },
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const searchArgs = Route.useSearch();
    const navigate = Route.useNavigate();
    const { t } = useTranslation();

    const sortMode = searchArgs.sortMode || { field: "RELEVANCE", order: "DESC" };

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
                <div className={"flex flex-row items-end gap-8"}>
                    <div className={"flex-col hidden lg:block lg:w-[30%] min-w-0"}>
                        <H1>{t("search.filters")}</H1>
                    </div>
                    <div className={"flex flex-col lg:w-[70%] min-w-0"}>
                        <H1>{t("search.resultsFor")}</H1>
                        <div className="flex flex-row items-end justify-between">
                            <H1 className={"text-ellipsis overflow-hidden line-clamp-1"}>
                                "{searchArgs.q}"
                            </H1>
                            <SortModeSelection
                                sortMode={sortMode}
                                updateSortMode={updateSortMode}
                                className={"hidden lg:flex"}
                            />
                        </div>
                        <SortModeSelection
                            sortMode={sortMode}
                            updateSortMode={updateSortMode}
                            className={"w-full mt-4 lg:hidden"}
                        />
                    </div>
                </div>

                <div className={"flex flex-col lg:flex-row items-start gap-8"}>
                    <div
                        className={
                            "flex-col w-full lg:w-[30%] min-w-0 lg:pb-0 pb-8 border-b lg:border-b-0 border-gray-300"
                        }
                    >
                        <SearchFilters searchFilters={searchArgs} />
                    </div>
                    <div className={"flex-col lg:w-[70%] min-w-0"}>
                        {isSimpleSearch(searchArgs) ? (
                            <SimpleSearchResults query={searchArgs.q} sortMode={sortMode} />
                        ) : (
                            <FilteredSearchResults searchFilters={searchArgs} />
                        )}
                    </div>
                </div>
            </div>
            <ScrollToTopButton />
        </>
    );
}
