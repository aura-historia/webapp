import { SearchFilters } from "@/components/search/SearchFilters.tsx";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import { H1 } from "@/components/typography/H1";
import { createFileRoute } from "@tanstack/react-router";

type SearchParams = {
    readonly q: string;
};

export const Route = createFileRoute("/search")({
    validateSearch: (search: Record<string, unknown>): SearchParams => {
        return {
            q: (search.q as string) || "",
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
                    <SearchFilters />
                </div>
                <div className={"flex-col sm:w-[70%] min-w-0"}>
                    <SearchResults query={q} />
                </div>
            </div>
        </div>
    );
}
