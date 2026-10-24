import { Link, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/features/notification-center/components/NotificationBell.tsx";
import { cn } from "@/lib/utils.ts";
import { MemberAvatar } from "./MemberAvatar.tsx";
import { MobileMenu } from "./MobileMenu.tsx";
import { NAV_FOCUS_CLASS, type SiteSectionId } from "./navigationConfig.ts";
import type { NavigationViewer } from "./useNavigationViewer.ts";
import { Wordmark } from "./Wordmark.tsx";

const ICON_BUTTON_CLASS = cn(
    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink",
    NAV_FOCUS_CLASS,
);

interface MobileHeaderProps {
    /** `dark` on the landing page and ink pages, `light` on parchment pages. */
    readonly tone: "dark" | "light";
    readonly viewer: NavigationViewer;
    readonly activeSection?: SiteSectionId;
    readonly showSearch: boolean;
    readonly showAccountActions: boolean;
    readonly className?: string;
}

/** The 60px phone header: wordmark, search, alerts, avatar and the menu button. */
export function MobileHeader({
    tone,
    viewer,
    activeSection,
    showSearch,
    showAccountActions,
    className,
}: MobileHeaderProps) {
    const { t } = useTranslation();
    const [menu, setMenu] = useState({ open: false, focusSearch: false });

    const pathname = useLocation({ select: (location) => location.pathname });
    const previousPathnameRef = useRef(pathname);
    if (previousPathnameRef.current !== pathname) {
        previousPathnameRef.current = pathname;
        if (menu.open) {
            setMenu({ open: false, focusSearch: false });
        }
    }

    return (
        <div data-theme={tone} className={cn("relative z-30 bg-surface text-ink", className)}>
            <nav
                aria-label={t("header.mainNavigation")}
                className="flex h-15 items-center gap-0.5 border-b border-line-subtle pr-2 pl-5"
            >
                <Link
                    to="/$lng"
                    params={true}
                    from="/$lng"
                    aria-label={t("header.home")}
                    className={cn(
                        "mr-auto inline-flex min-h-11 items-center rounded-xs",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <Wordmark label={t("header.wordmark")} className="h-[33px]" />
                </Link>

                {showSearch && (
                    <button
                        type="button"
                        aria-label={t("header.searchLabel")}
                        onClick={() => setMenu({ open: true, focusSearch: true })}
                        className={ICON_BUTTON_CLASS}
                    >
                        <Search aria-hidden="true" className="size-5" strokeWidth={1.7} />
                    </button>
                )}

                {showAccountActions && viewer.isAuthenticated && (
                    <>
                        <NotificationBell
                            badge="dot"
                            triggerClassName="size-11 rounded-pill text-ink hover:text-ink"
                        />
                        <Link
                            to="/$lng/me/account"
                            params={true}
                            from="/$lng"
                            aria-label={t("header.accountSettings")}
                            className={ICON_BUTTON_CLASS}
                        >
                            <MemberAvatar initials={viewer.initials} ring className="size-[30px]" />
                        </Link>
                    </>
                )}

                <button
                    type="button"
                    aria-label={t("header.openMenu")}
                    aria-expanded={menu.open}
                    aria-haspopup="dialog"
                    onClick={() => setMenu({ open: true, focusSearch: false })}
                    className={ICON_BUTTON_CLASS}
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        className="size-[22px]"
                    >
                        <path d="M4 9h16M4 15h16" />
                    </svg>
                </button>
            </nav>

            <MobileMenu
                open={menu.open}
                onOpenChange={(open) => setMenu({ open, focusSearch: false })}
                viewer={viewer}
                activeSection={activeSection}
                showSearch={showSearch}
                showAccountActions={showAccountActions}
                focusSearch={menu.focusSearch}
            />
        </div>
    );
}
