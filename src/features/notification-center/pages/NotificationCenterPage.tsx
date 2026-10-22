import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowRight, Bell, Bookmark, CheckCheck, Trash2, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useNotifications } from "@/features/notification-center/api/useNotifications.ts";
import { useMarkAllNotificationsSeen } from "@/features/notification-center/api/useMarkAllNotificationsSeen.ts";
import { DeleteAllNotificationsDialog } from "@/features/notification-center/components/DeleteAllNotificationsDialog.tsx";
import {
    NotificationRow,
    NotificationRowSkeleton,
} from "@/features/notification-center/components/NotificationRow.tsx";
import { groupNotificationsByDay } from "@/features/notification-center/lib/notificationUtils.ts";
import {
    PAGE_COLUMN_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

const PRIMARY_BUTTON_CLASS =
    "inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-surface outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const DELETE_BUTTON_CLASS = cn(
    SECONDARY_PILL_CLASS,
    "text-oxblood shadow-[inset_0_0_0_1px_var(--oxblood)]",
);

const SOURCE_LINK_CLASS =
    "flex min-h-11 items-center justify-between text-body-sm font-medium hover:text-brass-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

/** Grouped notifications sit in one card from 640px; on phones each is its own card. */
const GROUP_CLASS =
    "flex flex-col gap-2.5 sm:gap-0 sm:overflow-hidden sm:rounded-panel sm:bg-surface-raised sm:shadow-ring";
const GROUP_ROW_CLASS = "overflow-hidden rounded-panel shadow-ring sm:rounded-none sm:shadow-none";

function GroupLabel({ label, count }: { readonly label: string; readonly count: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-kicker font-normal tracking-[0.16em] text-ink uppercase">
                {label}
            </h2>
            <span className="font-mono text-tag tracking-[0.1em] text-ink-muted uppercase sm:text-kicker">
                {count}
            </span>
        </div>
    );
}

export function NotificationCenterPage() {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useNotifications();
    const markAllSeen = useMarkAllNotificationsSeen();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // Notifications load on the client only, so reading the clock here never reaches server markup.
    const [now] = useState(() => new Date());

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allNotifications = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
    const groups = useMemo(
        () => groupNotificationsByDay(allNotifications, now, timeZone),
        [allNotifications, now, timeZone],
    );
    const total = allNotifications.length;
    const unseenCount = allNotifications.filter((n) => !n.seen).length;
    const allLoaded = !hasNextPage && total > 0;
    const hasList = !isPending && !error && total > 0;

    let content: ReactNode;
    if (isPending) {
        content = (
            <div role="status" aria-busy="true" className="flex flex-col gap-3">
                <span className="sr-only">{t("notifications.loading")}</span>
                <div className="h-2.5 w-20 animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                <div className={GROUP_CLASS}>
                    {SKELETON_IDS.map((id, index) => (
                        <NotificationRowSkeleton
                            key={id}
                            className={cn(
                                GROUP_ROW_CLASS,
                                index > 0 && "sm:border-t sm:border-line-subtle",
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    } else if (error) {
        content = (
            <ResultStatePanel
                alert
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="notifications.loadingError.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("notifications.loadingError.description")}
            >
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("notifications.loadingError.retry")}
                </button>
            </ResultStatePanel>
        );
    } else if (total === 0) {
        content = (
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <Bell className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="notifications.noResults.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("notifications.noResults.description")}
            >
                <Link
                    to="/$lng/me/watchlist"
                    params={true}
                    from="/$lng"
                    className={PRIMARY_BUTTON_CLASS}
                >
                    <Bookmark aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    {t("notifications.overview.watchlistLink")}
                </Link>
                <Link
                    to="/$lng/me/search-filters"
                    params={true}
                    from="/$lng"
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("notifications.overview.searchFiltersLink")}
                </Link>
            </ResultStatePanel>
        );
    } else {
        content = (
            <div className="flex flex-col gap-7 sm:gap-9">
                {groups.map(({ group, items }) => (
                    <section
                        key={group}
                        aria-label={t(`notifications.groups.${group}`)}
                        className="flex flex-col gap-2.5 sm:gap-3"
                    >
                        <GroupLabel
                            label={t(`notifications.groups.${group}`)}
                            count={t("notifications.totalElements", { count: items.length })}
                        />
                        <div className={GROUP_CLASS}>
                            {items.map((notification, index) => (
                                <NotificationRow
                                    key={notification.notificationId}
                                    notification={notification}
                                    className={cn(
                                        GROUP_ROW_CLASS,
                                        index > 0 && "sm:border-t sm:border-line-subtle",
                                    )}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {(isFetchingNextPage || allLoaded) && (
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={total}
                        loadingMoreKey="notifications.loadingMore"
                        allLoadedKey="notifications.allLoaded"
                        className="mt-0"
                    />
                )}

                {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
            </div>
        );
    }

    return (
        <div className={cn(PAGE_COLUMN_CLASS, "pt-8 pb-24 sm:pt-14 sm:pb-36")}>
            <header className="mb-6 flex flex-col gap-3 border-b border-line-subtle pb-6 sm:mb-12 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pb-9">
                <div className="flex max-w-[720px] min-w-0 flex-col gap-3 sm:gap-4">
                    <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02] [&_em]:italic">
                        <Trans i18nKey="notifications.heading" components={HEADLINE_COMPONENTS} />
                    </h1>
                    <p className="text-body-sm text-ink-secondary sm:text-body">
                        {t("notifications.lead")}
                    </p>
                </div>
                {hasList && (
                    <>
                        <p className="mt-1 flex items-center gap-3 font-mono text-kicker tracking-[0.14em] text-ink-muted uppercase lg:hidden">
                            <span>
                                <Trans
                                    i18nKey="notifications.overview.unreadInline"
                                    count={unseenCount}
                                    values={{ count: unseenCount }}
                                    components={{ count: <span className="text-oxblood" /> }}
                                />
                            </span>
                            {allLoaded && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>{t("notifications.inTotal", { count: total })}</span>
                                </>
                            )}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-wrap sm:gap-2.5">
                            {unseenCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => markAllSeen.mutate()}
                                    disabled={markAllSeen.isPending}
                                    className={SECONDARY_PILL_CLASS}
                                >
                                    <CheckCheck
                                        aria-hidden="true"
                                        className="size-4"
                                        strokeWidth={1.8}
                                    />
                                    {t("notifications.markAllRead")}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDeleteDialogOpen(true)}
                                className={cn(
                                    DELETE_BUTTON_CLASS,
                                    unseenCount === 0 && "col-span-2",
                                )}
                            >
                                <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.8} />
                                {t("notifications.deleteAll")}
                            </button>
                        </div>
                    </>
                )}
            </header>

            <div className="flex flex-wrap items-start gap-12">
                {hasList && (
                    <aside
                        aria-label={t("notifications.overview.label")}
                        className="hidden max-w-[300px] flex-[1_1_260px] flex-col gap-7 lg:flex"
                    >
                        <dl className="grid grid-cols-2 border-t border-ink">
                            <div className="flex flex-col-reverse gap-1 pt-4 pr-4">
                                <dt className="font-mono text-kicker tracking-[0.14em] text-ink-muted uppercase">
                                    {t("notifications.overview.unread")}
                                </dt>
                                <dd className="m-0 font-serif text-stat text-oxblood">
                                    {unseenCount}
                                </dd>
                            </div>
                            {allLoaded && (
                                <div className="flex flex-col-reverse gap-1 border-l border-line-subtle pt-4 pl-4">
                                    <dt className="font-mono text-kicker tracking-[0.14em] text-ink-muted uppercase">
                                        {t("notifications.overview.total")}
                                    </dt>
                                    <dd className="m-0 font-serif text-stat">{total}</dd>
                                </div>
                            )}
                        </dl>
                        <div className="flex flex-col gap-3 rounded-panel bg-surface-raised p-5 shadow-ring">
                            <span className="font-mono text-kicker tracking-[0.16em] text-brass-ink uppercase">
                                {t("notifications.overview.sourcesTitle")}
                            </span>
                            <p className="text-body-sm text-ink-secondary">
                                {t("notifications.overview.sourcesText")}
                            </p>
                            <div className="flex flex-col border-t border-line-subtle">
                                <Link
                                    to="/$lng/me/watchlist"
                                    params={true}
                                    from="/$lng"
                                    className={cn(SOURCE_LINK_CLASS, "border-b border-line-subtle")}
                                >
                                    {t("notifications.overview.watchlistLink")}
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-3.5"
                                        strokeWidth={1.8}
                                    />
                                </Link>
                                <Link
                                    to="/$lng/me/search-filters"
                                    params={true}
                                    from="/$lng"
                                    className={SOURCE_LINK_CLASS}
                                >
                                    {t("notifications.overview.searchFiltersLink")}
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-3.5"
                                        strokeWidth={1.8}
                                    />
                                </Link>
                            </div>
                        </div>
                    </aside>
                )}
                <div className="min-w-0 flex-[999_1_560px]">{content}</div>
            </div>

            <DeleteAllNotificationsDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </div>
    );
}
