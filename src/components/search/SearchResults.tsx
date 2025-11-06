import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import Lottie from "lottie-react";
import tick from "@/assets/lottie/tick.json";
import { Spinner } from "@/components/ui/spinner.tsx";

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
        console.error(error);

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
            <Card className={"h-16 px-2 flex justify-center items-center shadow-md"} ref={ref}>
                <CardContent className="flex justify-center items-center w-full">
                    {isFetchingNextPage ? (
                        <div className={"flex flex-row items-center gap-2"}>
                            <Spinner />
                            <SectionInfoText>Lade neue Ergebnisse...</SectionInfoText>
                        </div>
                    ) : hasNextPage ? (
                        ""
                    ) : (
                        <div className={"flex flex-row items-center gap-2"}>
                            <div className={"h-12 w-12 shrink-0"}>
                                <Lottie className={"h-12 w-12"} animationData={tick} loop={false} />
                            </div>
                            <SectionInfoText>Alle Ergebnisse geladen</SectionInfoText>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
