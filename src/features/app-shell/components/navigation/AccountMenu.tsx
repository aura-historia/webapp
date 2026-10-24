import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useUnseenNotificationCount } from "@/features/notification-center/hooks/useUnseenNotificationCount.ts";
import { cn } from "@/lib/utils.ts";
import { MemberAvatar } from "./MemberAvatar.tsx";
import { NAV_FOCUS_CLASS } from "./navigationConfig.ts";
import type { NavigationViewer } from "./useNavigationViewer.ts";

const ITEM_CLASS =
    "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 text-sm text-ink focus:bg-surface-sunken focus:text-ink data-highlighted:bg-surface-sunken";

interface AccountMenuProps {
    readonly viewer: NavigationViewer;
    /** `lg` is the 44px chip of the marketing header; `md` the 40px chip of the app bar. */
    readonly size: "md" | "lg";
}

type AccountMenuRoute =
    | "/$lng/me/watchlist"
    | "/$lng/me/notifications"
    | "/$lng/me/search-filters"
    | "/$lng/partners/applications"
    | "/$lng/admin/overview"
    | "/$lng/me/account";

function MenuLink({
    to,
    children,
}: {
    readonly to: AccountMenuRoute;
    readonly children: ReactNode;
}) {
    return (
        <DropdownMenuItem asChild className={ITEM_CLASS}>
            <Link to={to} params={true} from="/$lng">
                {children}
            </Link>
        </DropdownMenuItem>
    );
}

/** The avatar chip and the signed-in member's popover: identity, shortcuts, sign out. */
export function AccountMenu({ viewer, size }: AccountMenuProps) {
    const { t } = useTranslation();
    const unseenCount = useUnseenNotificationCount();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                aria-label={t("header.accountMenu")}
                className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center rounded-pill bg-surface-sunken text-ink transition-colors hover:bg-line-subtle data-[state=open]:bg-line-subtle",
                    size === "lg" ? "h-11 gap-2 pr-2.5 pl-1" : "h-10 gap-1.5 pr-2 pl-1",
                    NAV_FOCUS_CLASS,
                )}
            >
                <MemberAvatar
                    initials={viewer.initials}
                    ring={size === "lg"}
                    className={size === "lg" ? "size-9 text-xs" : undefined}
                />
                <ChevronDown aria-hidden="true" className="size-3.5" strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                data-theme="light"
                align="end"
                sideOffset={10}
                className="w-72 rounded-panel border-0 bg-surface-raised p-2 text-ink shadow-menu"
            >
                <div className="mb-1.5 flex items-center gap-3 border-b border-line-subtle px-2.5 pt-3 pb-3.5">
                    <MemberAvatar initials={viewer.initials} className="size-10 text-[13px]" />
                    <div className="flex min-w-0 flex-col gap-0.5">
                        {viewer.name && (
                            <span className="truncate text-sm font-semibold">{viewer.name}</span>
                        )}
                        {viewer.email && (
                            <span className="truncate text-meta text-ink-muted">
                                {viewer.email}
                            </span>
                        )}
                    </div>
                </div>
                <MenuLink to="/$lng/me/watchlist">{t("header.watchlist")}</MenuLink>
                <MenuLink to="/$lng/me/notifications">
                    {t("header.alerts")}
                    {unseenCount > 0 && (
                        <span className="rounded-pill bg-oxblood px-[7px] py-0.5 font-mono text-[10px] text-on-oxblood uppercase">
                            {t("header.newCount", { count: unseenCount })}
                        </span>
                    )}
                </MenuLink>
                <MenuLink to="/$lng/me/search-filters">{t("header.searchAlerts")}</MenuLink>
                <MenuLink to="/$lng/partners/applications">{t("header.partnerDashboard")}</MenuLink>
                {viewer.isAdmin && (
                    <MenuLink to="/$lng/admin/overview">{t("header.admin")}</MenuLink>
                )}
                <MenuLink to="/$lng/me/account">{t("header.accountSettings")}</MenuLink>
                <DropdownMenuSeparator className="mx-0 my-1.5 bg-line-subtle" />
                <DropdownMenuItem
                    className={cn(ITEM_CLASS, "text-ink-secondary")}
                    onSelect={() => {
                        void viewer.signOut();
                    }}
                >
                    {t("header.signOut")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
