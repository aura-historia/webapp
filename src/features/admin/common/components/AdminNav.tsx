import { Link, useRouterState } from "@tanstack/react-router";
import {
    Building2,
    Check,
    ChevronDown,
    FileText,
    Gavel,
    Handshake,
    KeyRound,
    LayoutGrid,
    Package,
    Store,
    Users,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { FOCUS_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

export type AdminSectionRoute =
    | "/$lng/admin/overview"
    | "/$lng/admin/users"
    | "/$lng/admin/partnership-applications"
    | "/$lng/admin/partnerships"
    | "/$lng/admin/parties"
    | "/$lng/admin/listing-sources"
    | "/$lng/admin/auctions"
    | "/$lng/admin/product-listings"
    | "/$lng/admin/oauth-clients";

type AdminNavItem = {
    readonly to: AdminSectionRoute;
    readonly labelKey: string;
    readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type AdminNavGroup = {
    readonly id: string;
    readonly labelKey: string;
    readonly items: readonly AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
    {
        id: "general",
        labelKey: "adminNavigation.groups.general",
        items: [
            {
                to: "/$lng/admin/overview",
                labelKey: "adminNavigation.items.overview",
                icon: LayoutGrid,
            },
            { to: "/$lng/admin/users", labelKey: "adminNavigation.items.users", icon: Users },
        ],
    },
    {
        id: "partners",
        labelKey: "adminNavigation.groups.partners",
        items: [
            {
                to: "/$lng/admin/partnership-applications",
                labelKey: "adminNavigation.items.applications",
                icon: FileText,
            },
            {
                to: "/$lng/admin/partnerships",
                labelKey: "adminNavigation.items.partnerships",
                icon: Handshake,
            },
            {
                to: "/$lng/admin/parties",
                labelKey: "adminNavigation.items.organizations",
                icon: Building2,
            },
        ],
    },
    {
        id: "catalogue",
        labelKey: "adminNavigation.groups.catalogue",
        items: [
            {
                to: "/$lng/admin/listing-sources",
                labelKey: "adminNavigation.items.listingSources",
                icon: Store,
            },
            { to: "/$lng/admin/auctions", labelKey: "adminNavigation.items.auctions", icon: Gavel },
            {
                to: "/$lng/admin/product-listings",
                labelKey: "adminNavigation.items.productListings",
                icon: Package,
            },
        ],
    },
    {
        id: "integrations",
        labelKey: "adminNavigation.groups.integrations",
        items: [
            {
                to: "/$lng/admin/oauth-clients",
                labelKey: "adminNavigation.items.oauthClients",
                icon: KeyRound,
            },
        ],
    },
];

const ALL_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items.map((item) => ({ item, group })));

/** The section whose path is the current path or a parent of it (detail pages keep their section). */
function useActiveItem() {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const lng = pathname.split("/")[1] ?? "";
    const normalized = pathname.replace(/\/$/, "");
    return (
        ALL_ITEMS.find(({ item }) => {
            const path = item.to.replace("$lng", lng);
            return normalized === path || normalized.startsWith(`${path}/`);
        }) ?? ALL_ITEMS[0]
    );
}

/** The sticky section rail beside the admin pages, from 1024px (board "Admin · Section navigation"). */
export function AdminNavRail() {
    const { t } = useTranslation();
    const active = useActiveItem();

    return (
        <nav aria-label={t("adminNavigation.label")} className="flex w-60 flex-col gap-6">
            <p className="px-3 font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase">
                {t("adminNavigation.title")}
            </p>
            {ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.id} className="flex flex-col gap-1.5">
                    <p
                        id={`admin-nav-${group.id}`}
                        className="px-3 font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase"
                    >
                        {t(group.labelKey)}
                    </p>
                    <ul aria-labelledby={`admin-nav-${group.id}`} className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive = item === active.item;
                            const Icon = item.icon;
                            return (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        params={true}
                                        from="/$lng"
                                        aria-current={isActive ? "page" : undefined}
                                        activeProps={{}}
                                        className={cn(
                                            "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm",
                                            FOCUS_CLASS,
                                            isActive
                                                ? "bg-surface-raised font-medium text-ink shadow-ring"
                                                : "text-ink-secondary hover:bg-surface-sunken hover:text-ink",
                                        )}
                                    >
                                        <Icon
                                            aria-hidden="true"
                                            className={cn(
                                                "size-[17px] shrink-0",
                                                isActive ? "text-oxblood" : "text-ink-muted",
                                            )}
                                            strokeWidth={1.7}
                                        />
                                        {t(item.labelKey)}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

/** The section menu under the header below 1024px: names the group and the current section. */
export function AdminNavMenu() {
    const { t } = useTranslation();
    const active = useActiveItem();
    const ActiveIcon = active.item.icon;

    return (
        <nav
            aria-label={t("adminNavigation.label")}
            className="bg-surface px-(--page-gutter) shadow-[inset_0_-1px_0_var(--line-subtle)]"
        >
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                    className={cn(
                        "group flex h-16 w-full cursor-pointer items-center gap-3 text-left",
                        FOCUS_CLASS,
                    )}
                >
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase">
                            {t("adminNavigation.title")} · {t(active.group.labelKey)}
                        </span>
                        <span className="flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink">
                            <ActiveIcon
                                aria-hidden="true"
                                className="size-[17px] shrink-0 text-oxblood"
                                strokeWidth={1.7}
                            />
                            <span className="truncate">{t(active.item.labelKey)}</span>
                        </span>
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-ink-secondary transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                        strokeWidth={1.8}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    sideOffset={0}
                    className="max-h-[calc(100dvh-8rem)] w-[calc(var(--radix-dropdown-menu-trigger-width)+8px)] -translate-x-1 overflow-y-auto rounded-lg border-0 bg-surface-raised p-1.5 text-ink shadow-menu"
                >
                    {ADMIN_NAV_GROUPS.map((group) => (
                        <DropdownMenuGroup key={group.id}>
                            <DropdownMenuLabel className="px-3 pt-2 pb-1 font-mono text-[10px] font-normal tracking-[0.14em] text-ink-muted uppercase">
                                {t(group.labelKey)}
                            </DropdownMenuLabel>
                            {group.items.map((item) => {
                                const isActive = item === active.item;
                                const Icon = item.icon;
                                return (
                                    <DropdownMenuItem key={item.to} asChild>
                                        <Link
                                            to={item.to}
                                            params={true}
                                            from="/$lng"
                                            aria-current={isActive ? "page" : undefined}
                                            activeProps={{}}
                                            className={cn(
                                                "flex min-h-[46px] cursor-pointer items-center gap-3 rounded-md px-3 text-[15px] focus:bg-surface-sunken data-highlighted:bg-surface-sunken",
                                                isActive
                                                    ? "bg-surface-sunken font-medium text-ink"
                                                    : "text-ink-secondary",
                                            )}
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className={cn(
                                                    "size-[17px] shrink-0",
                                                    isActive ? "text-oxblood" : "text-ink-muted",
                                                )}
                                                strokeWidth={1.7}
                                            />
                                            <span className="flex-1">{t(item.labelKey)}</span>
                                            {isActive && (
                                                <Check
                                                    aria-hidden="true"
                                                    className="size-[15px] text-oxblood"
                                                    strokeWidth={2.2}
                                                />
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
}
