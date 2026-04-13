import { NotificationCard } from "@/components/notification/NotificationCard.tsx";
import { NotificationCardSkeleton } from "@/components/notification/NotificationCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { useNotifications } from "@/hooks/notification/useNotifications.ts";
import { useDeleteAllNotifications } from "@/hooks/notification/useDeleteAllNotifications.ts";
import { useMarkAllNotificationsSeen } from "@/hooks/notification/useMarkAllNotificationsSeen.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BellOff } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

export function NotificationResults() {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useNotifications();
    const deleteAll = useDeleteAllNotifications();
    const markAllSeen = useMarkAllNotificationsSeen();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
                {SKELETON_IDS.map((id) => (
                    <NotificationCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        console.error(error);
        return <SectionInfoText>{t("notifications.loadingError")}</SectionInfoText>;
    }

    const allNotifications = data?.pages.flatMap((p) => p.items) ?? [];
    const total = data?.pages[0]?.total ?? 0;
    const hasUnseen = allNotifications.some((n) => !n.seen);
    const allLoaded = allNotifications.length >= total && total > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    if (allNotifications.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <BellOff className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("notifications.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("notifications.noResults.description")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                    <H1>{t("notifications.title")}</H1>
                    <span className="text-base text-muted-foreground">
                        {t("notifications.totalElements", { count: total })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {hasUnseen && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllSeen.mutate()}
                            disabled={markAllSeen.isPending}
                        >
                            {t("notifications.markAllRead")}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAll.mutate()}
                        disabled={deleteAll.isPending}
                    >
                        {t("notifications.deleteAll")}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {allNotifications.map((n) => (
                    <NotificationCard key={n.notificationId} notification={n} />
                ))}
                {showLoaderRow && (
                    <div ref={ref}>
                        <ListLoaderRow
                            isFetchingNextPage={isFetchingNextPage}
                            totalCount={total}
                            loadingMoreKey="notifications.loadingMore"
                            allLoadedKey="notifications.allLoaded"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
