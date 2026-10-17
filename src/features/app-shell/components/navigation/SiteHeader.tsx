import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { env } from "@/env.ts";
import { NotificationBell } from "@/features/notification-center/components/NotificationBell.tsx";
import { cn } from "@/lib/utils.ts";
import { AccountMenu } from "./AccountMenu.tsx";
import { NAV_FOCUS_CLASS, SITE_SECTION_LINKS, type SiteSectionId } from "./navigationConfig.ts";
import { SiteSectionLink } from "./SiteSectionLink.tsx";
import type { NavigationViewer } from "./useNavigationViewer.ts";
import { Wordmark } from "./Wordmark.tsx";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export type SiteHeaderTone = "overlay" | "dark" | "light";

interface SiteHeaderProps {
    /** `overlay`: transparent on the ink hero · `dark`: ink bar · `light`: parchment bar. */
    readonly tone: SiteHeaderTone;
    readonly activeSection?: SiteSectionId;
    readonly viewer: NavigationViewer;
    readonly showAccountActions: boolean;
    readonly className?: string;
}

/** The 88px marketing header for desktop: wordmark, site sections and account actions. */
export function SiteHeader({
    tone,
    activeSection,
    viewer,
    showAccountActions,
    className,
}: SiteHeaderProps) {
    const { t } = useTranslation();
    const isLight = tone === "light";
    const linkHoverClass = isLight ? "hover:text-ink" : "hover:text-brass";

    return (
        <div
            data-theme={isLight ? "light" : "dark"}
            className={cn(
                "relative z-30 text-ink",
                tone === "overlay"
                    ? "bg-transparent"
                    : "bg-surface shadow-[inset_0_-1px_0_var(--line-subtle)]",
                className,
            )}
        >
            <nav
                aria-label={t("header.mainNavigation")}
                className="mx-auto flex min-h-22 max-w-content items-center justify-between gap-6 px-(--page-gutter)"
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
                    <Wordmark label={t("header.wordmark")} className="h-[38px]" />
                </Link>

                <ul className="flex items-center gap-x-6 text-body-sm xl:gap-x-9">
                    {SITE_SECTION_LINKS.map((link) => {
                        const isActive = link.id === activeSection;
                        return (
                            <li key={link.id}>
                                <SiteSectionLink
                                    link={link}
                                    isActive={isActive}
                                    className={cn(
                                        "inline-flex min-h-11 items-center whitespace-nowrap transition-colors",
                                        isActive
                                            ? "text-ink shadow-[inset_0_-1px_0_currentColor]"
                                            : "text-ink-secondary",
                                        linkHoverClass,
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t(link.translationKey)}
                                </SiteSectionLink>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex min-w-0 flex-none items-center justify-end">
                    {showAccountActions && viewer.isResolved && !viewer.isAuthenticated && (
                        <div className="flex items-center gap-5 text-body-sm">
                            <Link
                                to="/$lng/login"
                                search={{ redirect: viewer.redirect, mode: "sign-in" }}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "inline-flex min-h-11 items-center whitespace-nowrap text-ink-secondary transition-colors",
                                    linkHoverClass,
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("header.signIn")}
                            </Link>
                            {isSearchEnabled && (
                                <Link
                                    to="/$lng/search"
                                    params={true}
                                    from="/$lng"
                                    className={cn(
                                        "inline-flex h-11 items-center rounded-pill bg-ink px-5 font-medium whitespace-nowrap text-surface transition-opacity hover:opacity-90",
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t("header.startSearching")}
                                </Link>
                            )}
                        </div>
                    )}

                    {showAccountActions && viewer.isAuthenticated && (
                        <div className="flex items-center gap-1.5 text-body-sm">
                            <Link
                                to="/$lng/me/watchlist"
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "inline-flex h-11 items-center gap-2 rounded-pill px-3 whitespace-nowrap text-ink-secondary transition-colors",
                                    linkHoverClass,
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                <Bookmark
                                    aria-hidden="true"
                                    className="size-[18px]"
                                    strokeWidth={2}
                                />
                                {t("header.watchlist")}
                            </Link>
                            <NotificationBell
                                triggerClassName={cn("size-11 rounded-pill", linkHoverClass)}
                                badgeClassName={
                                    isLight
                                        ? undefined
                                        : "top-[9px] right-[9px] bg-brass text-surface"
                                }
                            />
                            <div className="ml-1.5">
                                <AccountMenu viewer={viewer} size="lg" />
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}
