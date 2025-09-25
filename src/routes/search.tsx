import { searchItems } from "@/client";
import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2.tsx";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

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
        queryFn: async () => {
            const result = await searchItems({
                query: {
                    q: q,
                },
            });
            return {
                ...result,
                data: {
                    ...result.data,
                    items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                },
                enabled: q.length > 0,
            };
        },
    });

    return (
        // Main Content
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8">
            <div className={"flex flex-row items-end gap-8"}>
                <div className={"flex-col w-[30%] min-w-0"}>
                    <H1>Filter</H1>
                </div>
                <div className={"flex-col w-[70%] min-w-0"}>
                    <H1>Suchergebnisse für:</H1>
                    <H1 className={"text-ellipsis overflow-hidden line-clamp-1"}>"{q}"</H1>
                </div>
            </div>

            <div className={"flex flex-row items-start gap-8"}>
                {/*Filter*/}
                <div className={"flex-col w-[30%] min-w-0"}>4 Filter options go here</div>
                <div className={"flex-col w-[70%] min-w-0"}>
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: 4 }, () => (
                                <ItemCardSkeleton key={uuidv4()} />
                            ))}
                        </div>
                    ) : error ? (
                        <H2>
                            Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später
                            erneut!
                        </H2>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {data?.data?.items.length === 0 && <H2>Keine Artikel gefunden!</H2>}
                            {data?.data?.items.map((item) => (
                                <ItemCard key={item.itemId} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
