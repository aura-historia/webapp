import { SearchFilters } from "@/components/search/SearchFilters.tsx";
import { SimpleSearchResults } from "@/components/search/SimpleSearchResults.tsx";
import { H1 } from "@/components/typography/H1";
import { createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";
import type { ItemState } from "@/data/internal/ItemState.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { FilteredSearchResults } from "@/components/search/FilteredSearchResults.tsx";

export const Route = createFileRoute("/search")({
    validateSearch: (
        search: {
            q: string;
            priceFrom?: number;
            priceTo?: number;
            allowedStates?: ItemState[];
            creationDateFrom?: string;
            creationDateTo?: string;
            merchant?: string;
        } & SearchSchemaInput,
    ): SearchFilterArguments => {
        return {
            q: (search.q as string) || "",
            priceFrom: search.priceFrom ? Number(search.priceFrom) : undefined,
            priceTo: search.priceTo ? Number(search.priceTo) : undefined,
            allowedStates: Array.isArray(search.allowedStates)
                ? (search.allowedStates as ItemState[])
                : search.allowedStates
                  ? [search.allowedStates as ItemState]
                  : undefined,
            creationDateFrom: (search.creationDateFrom as string) || undefined,
            creationDateTo: (search.creationDateTo as string) || undefined,
            merchant: (search.merchant?.trim() as string) || undefined,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const searchArgs = Route.useSearch();

    function isSimpleSearch(searchArgs: SearchFilterArguments): boolean {
        return !(
            searchArgs.priceFrom ||
            searchArgs.priceTo ||
            (searchArgs.allowedStates && searchArgs.allowedStates.length > 0) ||
            searchArgs.creationDateFrom ||
            searchArgs.creationDateTo ||
            searchArgs.merchant
        );
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 sm:ml-auto sm:mr-auto">
            <div className={"flex flex-row items-end gap-8"}>
                <div className={"flex-col hidden sm:block sm:w-[30%] min-w-0"}>
                    <H1>Filter</H1>
                </div>
                <div className={"flex-col sm:w-[70%] min-w-0"}>
                    <H1>Suchergebnisse für:</H1>
                    <H1 className={"text-ellipsis overflow-hidden line-clamp-1"}>
                        "{searchArgs.q}"
                    </H1>
                </div>
            </div>

            <div className={"flex flex-row items-start gap-8"}>
                <div className={"flex-col hidden sm:block sm:w-[30%] min-w-0"}>
                    <SearchFilters query={searchArgs.q} />
                </div>
                <div className={"flex-col sm:w-[70%] min-w-0"}>
                    {isSimpleSearch(searchArgs) ? (
                        <SimpleSearchResults query={searchArgs.q} />
                    ) : (
                        <FilteredSearchResults searchFilters={searchArgs} />
                    )}
                </div>
            </div>
        </div>
    );
}
