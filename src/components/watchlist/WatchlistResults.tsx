import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getWatchlistItems } from "@/client";
import { mapToInternalWatchlistItem, type WatchlistItem } from "@/data/internal/WatchlistItem.ts";
import { useAuthToken } from "@/hooks/useAuthToken.ts";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 21;

export function WatchlistResults() {
    const { ref, inView } = useInView();
    const { data: authToken, isPending: isAuthPending, error: authError } = useAuthToken();
    const { t } = useTranslation();

    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ["watchlist", authToken],
            queryFn: async ({ pageParam }) => {
                if (!authToken) {
                    throw new Error("Authentication token not available");
                }

                const result = await getWatchlistItems({
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    query: {
                        searchAfter: pageParam,
                        size: PAGE_SIZE,
                    },
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                return {
                    items: result.data?.items?.map(mapToInternalWatchlistItem) ?? [],
                    size: result.data?.size,
                    total: result.data?.total ?? undefined,
                    searchAfter: result.data?.searchAfter ?? undefined,
                };
            },
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (lastPage) => {
                return lastPage.searchAfter ?? undefined;
            },
            enabled: !!authToken,
        });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isAuthPending) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }, () => (
                    <ItemCardSkeleton key={uuidv4()} />
                ))}
            </div>
        );
    }

    if (authError) {
        console.error(authError);
        return (
            <SectionInfoText>Authentifizierungsfehler. Bitte melden Sie sich an!</SectionInfoText>
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

    const allItems: WatchlistItem[] = data?.pages.flatMap((page) => page.items) ?? [];

    if (allItems.length === 0) {
        return <SectionInfoText>Keine Artikel gefunden!</SectionInfoText>;
    }

    return (
        <div className={"flex flex-col w-full gap-8"}>
            <div className="flex flex-row items-center justify-between">
                <H1>{t("watchlist.title")}</H1>
                <SectionInfoText>
                    {t("watchlist.totalElements", {
                        count: data.pages[0].total ?? 0,
                    })}
                </SectionInfoText>
            </div>
            <div className="flex flex-col gap-4">
                {allItems.map((watchlistItem: WatchlistItem) => (
                    <ItemCard key={watchlistItem.item.itemId} item={watchlistItem.item} />
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
        </div>
    );
}
