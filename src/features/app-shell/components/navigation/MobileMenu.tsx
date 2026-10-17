import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/env.ts";
import { useUnseenNotificationCount } from "@/features/notification-center/hooks/useUnseenNotificationCount.ts";
import { cn } from "@/lib/utils.ts";
import { LocaleSwitch } from "./LocaleSwitch.tsx";
import { MemberAvatar } from "./MemberAvatar.tsx";
import {
    CONTACT_EMAIL,
    NAV_FOCUS_CLASS,
    SITE_SECTION_LINKS,
    type SiteSectionId,
} from "./navigationConfig.ts";
import { NavSearchField } from "./NavSearchField.tsx";
import { SiteSectionLink } from "./SiteSectionLink.tsx";
import type { NavigationViewer } from "./useNavigationViewer.ts";
import { Wordmark } from "./Wordmark.tsx";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

const SHORTCUT_CLASS = cn(
    "flex min-h-11 items-center justify-between text-base text-ink transition-colors hover:text-brass",
    NAV_FOCUS_CLASS,
);

interface MobileMenuProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly viewer: NavigationViewer;
    readonly activeSection?: SiteSectionId;
    readonly showSearch: boolean;
    readonly showAccountActions: boolean;
    /** Focus the search field when the menu opens (opened from the search button). */
    readonly focusSearch: boolean;
}

function MenuSection({
    label,
    children,
}: {
    readonly label: string;
    readonly children: ReactNode;
}) {
    return (
        <nav aria-label={label} className="flex flex-col gap-1">
            {children}
        </nav>
    );
}

/** The full-screen phone menu on the ink ground. */
export function MobileMenu({
    open,
    onOpenChange,
    viewer,
    activeSection,
    showSearch,
    showAccountActions,
    focusSearch,
}: MobileMenuProps) {
    const { t } = useTranslation();
    const unseenCount = useUnseenNotificationCount();
    const close = () => onOpenChange(false);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Content
                    data-theme="dark"
                    aria-describedby={undefined}
                    onOpenAutoFocus={(event) => {
                        const searchInput =
                            event.currentTarget instanceof HTMLElement
                                ? event.currentTarget.querySelector<HTMLInputElement>(
                                      'input[type="search"]',
                                  )
                                : null;
                        if (focusSearch && searchInput) {
                            event.preventDefault();
                            searchInput.focus();
                        }
                    }}
                    className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-surface font-sans text-ink"
                >
                    <DialogPrimitive.Title className="sr-only">
                        {t("header.menu")}
                    </DialogPrimitive.Title>

                    {/* Mirrors the header bar so the wordmark never moves when the menu opens. */}
                    <div className="flex h-15 flex-none items-center border-b border-line-subtle pr-2 pl-5">
                        <Link
                            to="/$lng"
                            params={true}
                            from="/$lng"
                            aria-label={t("header.home")}
                            onClick={close}
                            className={cn(
                                "mr-auto inline-flex min-h-11 items-center rounded-xs",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            <Wordmark label={t("header.wordmark")} className="h-[33px]" />
                        </Link>
                        <DialogPrimitive.Close
                            aria-label={t("header.closeMenu")}
                            className={cn(
                                "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-ink",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            <X aria-hidden="true" className="size-[22px]" strokeWidth={1.7} />
                        </DialogPrimitive.Close>
                    </div>

                    <div className="flex flex-1 flex-col gap-7 px-5 pt-5 pb-7">
                        {showSearch && (
                            <div data-theme="light" className="rounded-panel">
                                <NavSearchField variant="menu" onSubmitted={close} />
                            </div>
                        )}

                        <nav aria-label={t("header.primaryNavigation")}>
                            <ul className="border-t border-line">
                                {SITE_SECTION_LINKS.map((link) => {
                                    const isActive = link.id === activeSection;
                                    return (
                                        <li key={link.id}>
                                            <SiteSectionLink
                                                link={link}
                                                isActive={isActive}
                                                onClick={close}
                                                className={cn(
                                                    "flex min-h-15 items-center gap-4 border-b border-line transition-colors hover:text-ink",
                                                    isActive ? "text-ink" : "text-ink-secondary",
                                                    NAV_FOCUS_CLASS,
                                                )}
                                            >
                                                <span className="flex-1 font-serif text-[28px] leading-[1.1]">
                                                    {t(link.translationKey)}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "size-[7px] rounded-full bg-brass",
                                                        !isActive && "opacity-0",
                                                    )}
                                                />
                                            </SiteSectionLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {showAccountActions && viewer.isAuthenticated && (
                            <MenuSection label={t("header.accountNavigation")}>
                                <span className="mb-1.5 font-mono text-kicker text-ink-muted uppercase">
                                    {t("header.yourAura")}
                                </span>
                                <Link
                                    to="/$lng/me/watchlist"
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={SHORTCUT_CLASS}
                                >
                                    {t("header.watchlist")}
                                </Link>
                                <Link
                                    to="/$lng/me/notifications"
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={SHORTCUT_CLASS}
                                >
                                    {t("header.alerts")}
                                    {unseenCount > 0 && (
                                        <span className="rounded-pill bg-brass px-2 py-0.5 font-mono text-[11px] text-surface uppercase">
                                            {t("header.newCount", { count: unseenCount })}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/$lng/me/search-filters"
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={SHORTCUT_CLASS}
                                >
                                    {t("header.searchAlerts")}
                                </Link>
                                <Link
                                    to="/$lng/partners/applications"
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={SHORTCUT_CLASS}
                                >
                                    {t("header.partnerDashboard")}
                                </Link>
                                {viewer.isAdmin && (
                                    <Link
                                        to="/$lng/admin/overview"
                                        params={true}
                                        from="/$lng"
                                        onClick={close}
                                        className={SHORTCUT_CLASS}
                                    >
                                        {t("header.admin")}
                                    </Link>
                                )}
                                <Link
                                    to="/$lng/me/account"
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={cn(
                                        SHORTCUT_CLASS,
                                        "mt-2 min-h-13 justify-start gap-3 border-t border-line pt-2",
                                    )}
                                >
                                    <MemberAvatar initials={viewer.initials} className="text-xs" />
                                    {t("header.accountSettings")}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        close();
                                        void viewer.signOut();
                                    }}
                                    className={cn(
                                        "flex min-h-11 cursor-pointer items-center text-[15px] text-ink-muted transition-colors hover:text-ink",
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t("header.signOut")}
                                </button>
                            </MenuSection>
                        )}

                        {showAccountActions && viewer.isResolved && !viewer.isAuthenticated && (
                            <div className="flex flex-col gap-2.5">
                                {isSearchEnabled && (
                                    <Link
                                        to="/$lng/search"
                                        params={true}
                                        from="/$lng"
                                        onClick={close}
                                        data-theme="light"
                                        className={cn(
                                            "flex h-13 items-center justify-center rounded-pill bg-surface text-base font-medium text-ink",
                                            NAV_FOCUS_CLASS,
                                        )}
                                    >
                                        {t("header.startSearching")}
                                    </Link>
                                )}
                                <Link
                                    to="/$lng/login"
                                    search={{ redirect: viewer.redirect, mode: "sign-in" }}
                                    params={true}
                                    from="/$lng"
                                    onClick={close}
                                    className={cn(
                                        "flex h-13 items-center justify-center rounded-pill text-base text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t("header.signIn")}
                                </Link>
                            </div>
                        )}

                        <div className="mt-auto flex flex-col gap-3.5 border-t border-line pt-[18px]">
                            <LocaleSwitch variant="pill" />
                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className={cn(
                                    "self-start text-body-sm text-ink-secondary transition-colors hover:text-brass",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {CONTACT_EMAIL}
                            </a>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
