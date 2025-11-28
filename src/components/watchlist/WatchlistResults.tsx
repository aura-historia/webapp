import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getWatchlistItems } from "@/client";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem.ts";

const PAGE_SIZE = 21;

export function WatchlistResults() {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ["watchlist"],
            queryFn: async ({ pageParam }) => {
                const result = await getWatchlistItems({
                    query: {
                        searchAfter: pageParam,
                        size: PAGE_SIZE,
                    },
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                return {
                    items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                    size: result.data?.size,
                    total: result.data?.total ?? undefined,
                    searchAfter: result.data?.searchAfter ?? undefined,
                };
            },
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (lastPage) => {
                return lastPage.searchAfter ?? undefined;
            },
        });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        return <SectionInfoText>{t("watchlist.loadingError")}</SectionInfoText>;
    }

    const allItems: OverviewItem[] =
        data?.pages.flatMap((page) =>
            page.items.map((item) => {
                return {
                    ...item,
                    userData: {
                        watchlistData: {
                            isWatching: true,
                            isNotificationEnabled:
                                item.userData?.watchlistData.isNotificationEnabled ?? false,
                        },
                    },
                };
            }),
        ) ?? [];

    if (allItems.length === 0) {
        return <SectionInfoText>{t("search.messages.noResults")}</SectionInfoText>;
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
                {allItems.map((watchlistItem: OverviewItem) => (
                    <ItemCard key={watchlistItem.itemId} item={watchlistItem} />
                ))}
                <Card className={"h-8 px-2 justify-center items-center shadow-md"} ref={ref}>
                    <CardContent>
                        <SectionInfoText>
                            {isFetchingNextPage
                                ? t("search.messages.loadingMore")
                                : hasNextPage
                                  ? ""
                                  : t("search.messages.allLoaded", {
                                        count: data?.pages[0]?.total,
                                    })}
                        </SectionInfoText>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
