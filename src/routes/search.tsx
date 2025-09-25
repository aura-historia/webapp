import { type GetItemData, searchItems } from "@/client";
import { useQuery } from "@tanstack/react-query";
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

    const { data, isLoading, error } = useQuery({
        queryKey: ["search", q],
        queryFn: () =>
            searchItems({
                query: {
                    q: q,
                },
            }),
        enabled: q.length >= 3,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;

    if (!q) return <div>Invalid Search!</div>;

    return (
        <div>
            <h1>Search Results</h1>
            <p>Showing results for: "{q}"</p>
            {data?.data ? (
                <ul>
                    {data.data.items.map((result: GetItemData) => (
                        <li key={result.itemId}>{result.title.text}</li>
                    ))}
                </ul>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}
