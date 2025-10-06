import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/query-core";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import type { OverviewItem } from "@/data/internal/OverviewItem.ts";

type SearchResultsProps = {
    readonly query: string;
    readonly searchQueryHook: UseInfiniteQueryResult<InfiniteData<SearchResultData>>;
};

export function SearchResults({ query, searchQueryHook }: SearchResultsProps) {
    const { ref, inView } = useInView();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        searchQueryHook;

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && query.length >= 3) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, query.length]);

    if (query.length < 3) {
        return (
            <SectionInfoText>
                Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten.
            </SectionInfoText>
        );
    }

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }, () => (
                    <ItemCardSkeleton key={uuidv4()} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <SectionInfoText>
                Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!
            </SectionInfoText>
        );
    }

    const allItems: OverviewItem[] =
        data?.pages.flatMap((page: SearchResultData) => page.items) ?? [];

    if (allItems.length === 0) {
        return <SectionInfoText>Keine Artikel gefunden!</SectionInfoText>;
    }

    return (
        <div className="flex flex-col gap-4">
            {allItems.map((item: OverviewItem) => (
                <ItemCard key={item.itemId} item={item} />
            ))}
            <Card className={"h-8 px-2 justify-center items-center shadow-md"} ref={ref}>
                <CardContent>
                    <SectionInfoText>
                        {isFetchingNextPage
                            ? "Lade neue Ergebnisse..."
                            : hasNextPage
                              ? ""
                              : "Alle Ergebnisse geladen"}
                    </SectionInfoText>
                </CardContent>
            </Card>
        </div>
    );
}
