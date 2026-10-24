import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/features/notification-center/components/NotificationBell.tsx";
import { cn } from "@/lib/utils.ts";
import { AccountMenu } from "./AccountMenu.tsx";
import { NAV_FOCUS_CLASS } from "./navigationConfig.ts";
import { NavSearchField } from "./NavSearchField.tsx";
import type { NavigationViewer } from "./useNavigationViewer.ts";
import { Wordmark } from "./Wordmark.tsx";

interface AppNavBarProps {
    readonly viewer: NavigationViewer;
    readonly showSearch: boolean;
    readonly showAccountActions: boolean;
    readonly className?: string;
}

/** The 64px bar of the product pages: wordmark, global search and account actions. */
export function AppNavBar({ viewer, showSearch, showAccountActions, className }: AppNavBarProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "relative z-30 bg-surface-bar text-ink shadow-[inset_0_-1px_0_var(--line-subtle)]",
                className,
            )}
        >
            <nav
                aria-label={t("header.mainNavigation")}
                className="flex h-16 items-center gap-6 px-6"
            >
                <Link
                    to="/$lng"
                    params={true}
                    from="/$lng"
                    aria-label={t("header.home")}
                    className={cn(
                        "inline-flex min-h-11 flex-none items-center rounded-xs text-ink-secondary",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <Wordmark label={t("header.wordmark")} className="h-[30px]" />
                </Link>

                {showSearch && (
                    <NavSearchField variant="compact" className="max-w-[680px] flex-auto" />
                )}

                <div className="ml-auto flex flex-none items-center">
                    {showAccountActions && viewer.isResolved && !viewer.isAuthenticated && (
                        <div className="flex items-center gap-3.5 text-meta">
                            <Link
                                to="/$lng/login"
                                search={{ redirect: viewer.redirect, mode: "sign-in" }}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "inline-flex min-h-10 items-center whitespace-nowrap text-ink-secondary transition-colors hover:text-ink",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("header.signIn")}
                            </Link>
                            <Link
                                to="/$lng/login"
                                search={{ redirect: viewer.redirect, mode: "sign-up" }}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "inline-flex h-10 items-center rounded-pill bg-ink px-4 font-medium whitespace-nowrap text-surface transition-opacity hover:opacity-90",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("header.createAccount")}
                            </Link>
                        </div>
                    )}

                    {showAccountActions && viewer.isAuthenticated && (
                        <div className="flex items-center gap-1 text-meta text-ink-secondary">
                            <Link
                                to="/$lng/me/watchlist"
                                params={true}
                                from="/$lng"
                                activeProps={{ className: "text-ink" }}
                                className={cn(
                                    "inline-flex h-10 items-center gap-[7px] rounded-md px-2.5 whitespace-nowrap transition-colors hover:text-ink",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                <Bookmark aria-hidden="true" className="size-4" strokeWidth={1.8} />
                                <span className="sr-only lg:not-sr-only">
                                    {t("header.watchlist")}
                                </span>
                            </Link>
                            <NotificationBell />
                            <div className="ml-1.5">
                                <AccountMenu viewer={viewer} size="md" />
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}
