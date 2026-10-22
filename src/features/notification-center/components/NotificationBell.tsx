import { useMarkAllNotificationsSeen } from "@/features/notification-center/api/useMarkAllNotificationsSeen.ts";
import { useDeleteAllNotifications } from "@/features/notification-center/api/useDeleteAllNotifications.ts";
import { useNotifications } from "@/features/notification-center/api/useNotifications.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ArrowRight, Bell, CheckCheck, Trash2, TriangleAlert } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { NotificationItem } from "./NotificationItem.tsx";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;
const POPOVER_LIMIT = 5;
const MAX_BADGE_COUNT = 9;

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const HEADER_ICON_CLASS = cn(
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-35",
    FOCUS_CLASS,
);

const SMALL_PILL_CLASS = cn(
    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-pill px-3.5 text-meta font-medium disabled:cursor-not-allowed disabled:opacity-35",
    FOCUS_CLASS,
);

/** Scrollbar thumb on a transparent track, so row tints run to the panel edge. */
const LIST_SCROLLBAR_CLASS =
    "[scrollbar-color:var(--line-strong)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-pill [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-line-strong [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-track]:bg-transparent";

function NotificationItemSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="grid animate-pulse grid-cols-[56px_minmax(0,1fr)] gap-3.5 border-b border-line-subtle py-3.5 pr-5 pl-7 motion-reduce:animate-none"
        >
            <div className="size-14 rounded-md bg-image-ground" />
            <div className="flex flex-col gap-2 pt-0.5">
                <div className="flex justify-between">
                    <div className="h-[9px] w-[30%] rounded-xs bg-surface-sunken" />
                    <div className="h-[9px] w-[16%] rounded-xs bg-surface-sunken" />
                </div>
                <div className="h-[13px] w-[88%] rounded-xs bg-surface-sunken" />
                <div className="h-[11px] w-[42%] rounded-xs bg-surface-sunken" />
                <div className="h-[11px] w-[55%] rounded-xs bg-surface-sunken" />
            </div>
        </div>
    );
}

function PopoverState({
    icon,
    title,
    description,
    alert = false,
    children,
}: {
    readonly icon: ReactNode;
    readonly title: ReactNode;
    readonly description: string;
    readonly alert?: boolean;
    readonly children?: ReactNode;
}) {
    return (
        <div
            role={alert ? "alert" : undefined}
            className="flex flex-col items-center gap-3 px-8 pt-10 pb-11 text-center"
        >
            {icon}
            <h3 className="font-serif text-[22px] leading-[1.2] font-normal [&_em]:italic">
                {title}
            </h3>
            <p className="max-w-[300px] text-body-sm leading-[1.55] text-ink-secondary">
                {description}
            </p>
            {children}
        </div>
    );
}

interface NotificationBellProps {
    readonly triggerClassName?: string;
    /** `count` shows the unseen number on a pill; `dot` shows a small dot (compact phone bars). */
    readonly badge?: "count" | "dot";
    readonly badgeClassName?: string;
}

/** The header bell and its popover with the five newest notifications (design "Nav · Notification popover"). */
export function NotificationBell({
    triggerClassName,
    badge = "count",
    badgeClassName,
}: NotificationBellProps = {}) {
    const { t } = useTranslation();
    const { data, isLoading, error, refetch, hasNextPage } = useNotifications();
    const markAllAsSeen = useMarkAllNotificationsSeen();
    const deleteAllNotifications = useDeleteAllNotifications();
    const [open, setOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const allNotifications = data?.pages.flatMap((page) => page.items) ?? [];
    const notifications = allNotifications.slice(0, POPOVER_LIMIT);
    const unseenCount = allNotifications.filter((n) => !n.seen).length;
    const hasUnseenNotifications = unseenCount > 0;
    const hasNotifications = allNotifications.length > 0;
    const showError = !isLoading && Boolean(error) && !hasNotifications;
    const showEmpty = !isLoading && !showError && !hasNotifications;

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) setConfirmingDelete(false);
    };

    const deleteAll = () =>
        deleteAllNotifications.mutate(undefined, {
            onSettled: () => setConfirmingDelete(false),
        });

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass data-[state=open]:bg-surface-sunken data-[state=open]:text-ink",
                        triggerClassName,
                    )}
                    aria-label={
                        hasUnseenNotifications
                            ? t("header.alertsUnseen", { count: unseenCount })
                            : t("notifications.ariaLabel")
                    }
                >
                    <Bell aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    {hasUnseenNotifications && badge === "count" && (
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute top-1.5 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-oxblood px-1 font-mono text-[10px] font-medium text-on-oxblood",
                                badgeClassName,
                            )}
                        >
                            {unseenCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unseenCount}
                        </span>
                    )}
                    {hasUnseenNotifications && badge === "dot" && (
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute top-2.5 right-2.5 size-2 rounded-full bg-brass shadow-[0_0_0_2px_var(--surface)]",
                                badgeClassName,
                            )}
                        />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={10}
                collisionPadding={8}
                aria-label={t("notifications.title")}
                data-theme="light"
                className="flex w-[min(400px,calc(100vw-16px))] flex-col overflow-hidden rounded-panel border-0 bg-surface-raised p-0 text-ink shadow-menu"
            >
                <header className="flex items-center gap-2.5 border-b border-line-subtle py-3.5 pr-3 pl-5">
                    <div className="flex min-w-0 items-baseline gap-2.5">
                        <h2 className="font-serif text-[22px] leading-[1.15] font-normal whitespace-nowrap">
                            {t("notifications.title")}
                        </h2>
                        {hasUnseenNotifications && (
                            <span className="relative -top-0.5 shrink-0 rounded-pill bg-oxblood px-[7px] py-[3px] font-mono text-tag leading-[1.2] tracking-[0.08em] whitespace-nowrap text-on-oxblood uppercase">
                                {t("notifications.newCount", { count: unseenCount })}
                            </span>
                        )}
                    </div>
                    {hasNotifications && (
                        <div className="ml-auto flex shrink-0 items-center gap-1">
                            {hasUnseenNotifications && (
                                <button
                                    type="button"
                                    aria-label={t("notifications.markAllRead")}
                                    title={t("notifications.markAllRead")}
                                    onClick={() => markAllAsSeen.mutate()}
                                    disabled={markAllAsSeen.isPending}
                                    className={HEADER_ICON_CLASS}
                                >
                                    <CheckCheck
                                        aria-hidden="true"
                                        className="size-4"
                                        strokeWidth={1.8}
                                    />
                                </button>
                            )}
                            <button
                                type="button"
                                aria-label={t("notifications.deleteAll")}
                                title={t("notifications.deleteAll")}
                                aria-expanded={confirmingDelete}
                                onClick={() => setConfirmingDelete(true)}
                                disabled={deleteAllNotifications.isPending}
                                className={HEADER_ICON_CLASS}
                            >
                                <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.8} />
                            </button>
                        </div>
                    )}
                </header>

                {confirmingDelete && hasNotifications && (
                    <div
                        role="alertdialog"
                        aria-label={t("notifications.deleteAll")}
                        className="m-3 flex flex-col gap-3 rounded-lg bg-surface-sunken px-4 py-3.5"
                    >
                        <p className="text-body-sm leading-normal text-ink">
                            {t("notifications.deleteAllConfirm.short")}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(false)}
                                disabled={deleteAllNotifications.isPending}
                                className={cn(
                                    SMALL_PILL_CLASS,
                                    "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                )}
                            >
                                {t("notifications.deleteAllConfirm.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={deleteAll}
                                disabled={deleteAllNotifications.isPending}
                                className={cn(SMALL_PILL_CLASS, "bg-oxblood text-on-oxblood")}
                            >
                                {deleteAllNotifications.isPending && <Spinner aria-hidden="true" />}
                                {t("notifications.deleteAll")}
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div role="status" aria-busy="true">
                        <span className="sr-only">{t("notifications.loading")}</span>
                        {SKELETON_IDS.map((id) => (
                            <NotificationItemSkeleton key={id} />
                        ))}
                    </div>
                )}

                {showEmpty && (
                    <PopoverState
                        icon={
                            <span
                                aria-hidden="true"
                                className="inline-flex size-12 items-center justify-center rounded-pill bg-surface text-ink-muted shadow-ring"
                            >
                                <Bell className="size-5" strokeWidth={1.7} />
                            </span>
                        }
                        title={
                            <Trans
                                i18nKey="notifications.noResults.headline"
                                components={HEADLINE_COMPONENTS}
                            />
                        }
                        description={t("notifications.noResults.popoverDescription")}
                    />
                )}

                {showError && (
                    <PopoverState
                        alert
                        icon={
                            <span
                                aria-hidden="true"
                                className="inline-flex size-12 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                            >
                                <TriangleAlert className="size-5" strokeWidth={1.8} />
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
                            className={cn(
                                SMALL_PILL_CLASS,
                                "mt-1 h-10 px-[18px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                            )}
                        >
                            {t("notifications.loadingError.retry")}
                        </button>
                    </PopoverState>
                )}

                {!isLoading && hasNotifications && (
                    <ul
                        aria-label={t("notifications.latest")}
                        className={cn("max-h-[470px] overflow-y-auto", LIST_SCROLLBAR_CLASS)}
                    >
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.notificationId}
                                notification={notification}
                                onNavigate={() => handleOpenChange(false)}
                            />
                        ))}
                    </ul>
                )}

                {!isLoading && hasNotifications && (
                    <Link
                        to="/$lng/me/notifications"
                        onClick={() => handleOpenChange(false)}
                        params={true}
                        from="/$lng"
                        className={cn(
                            "flex min-h-[52px] items-center justify-between bg-surface px-5 text-meta font-medium text-ink hover:text-brass-ink",
                            "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass",
                        )}
                    >
                        {t("notifications.showAll")}
                        <span className="inline-flex items-center gap-2">
                            {!hasNextPage && (
                                <span className="font-mono text-tag tracking-[0.08em] text-ink-muted uppercase">
                                    {t("notifications.inTotal", {
                                        count: allNotifications.length,
                                    })}
                                </span>
                            )}
                            <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                        </span>
                    </Link>
                )}
            </PopoverContent>
        </Popover>
    );
}
