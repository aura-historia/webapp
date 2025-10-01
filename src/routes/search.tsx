import { SearchFilters } from "@/components/search/SearchFilters.tsx";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import { H1 } from "@/components/typography/H1";
import { createFileRoute } from "@tanstack/react-router";
import type { SearchSchemaInput } from "@tanstack/router-core";
import type { ItemState } from "@/data/internal/ItemState.ts";

type SearchParams = {
    readonly q: string;
    readonly priceFrom: number | undefined;
    readonly priceTo: number | undefined;
    readonly allowedStates: string[] | undefined;
    readonly creationDateFrom: string | undefined;
    readonly creationDateTo: string | undefined;
    readonly merchant: string | undefined;
};

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
    ): SearchParams => {
        return {
            q: (search.q as string) || "",
            priceFrom: search.priceFrom ? Number(search.priceFrom) : undefined,
            priceTo: search.priceTo ? Number(search.priceTo) : undefined,
            allowedStates: Array.isArray(search.allowedStates)
                ? (search.allowedStates as string[])
                : search.allowedStates
                  ? [search.allowedStates as string]
                  : undefined,
            creationDateFrom: (search.creationDateFrom as string) || undefined,
            creationDateTo: (search.creationDateTo as string) || undefined,
            merchant: (search.merchant as string) || undefined,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { q } = Route.useSearch();

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 sm:ml-auto sm:mr-auto">
            <div className={"flex flex-row items-end gap-8"}>
                <div className={"flex-col hidden sm:block sm:w-[30%] min-w-0"}>
                    <H1>Filter</H1>
                </div>
                <div className={"flex-col sm:w-[70%] min-w-0"}>
                    <H1>Suchergebnisse für:</H1>
                    <H1 className={"text-ellipsis overflow-hidden line-clamp-1"}>"{q}"</H1>
                </div>
            </div>

            <div className={"flex flex-row items-start gap-8"}>
                <div className={"flex-col hidden sm:block sm:w-[30%] min-w-0"}>
                    <SearchFilters query={q} />
                </div>
                <div className={"flex-col sm:w-[70%] min-w-0"}>
                    <SearchResults query={q} />
                </div>
            </div>
        </div>
    );
}
