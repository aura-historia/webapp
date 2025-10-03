import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useInView } from "react-intersection-observer";
import { v4 as uuidv4 } from "uuid";
import { useFilteredSearch } from "@/hooks/useFilteredSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";

type FilteredSearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
};

export function FilteredSearchResults({ searchFilters }: FilteredSearchResultsProps) {
    const { ref, inView } = useInView();

    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useFilteredSearch(searchFilters);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (searchFilters.q.length < 3) {
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

    const allItems = data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

    if (allItems.length === 0) {
        return <SectionInfoText>Keine Artikel gefunden!</SectionInfoText>;
    }

    return (
        <div className="flex flex-col gap-4">
            {allItems.map((item) => (
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
