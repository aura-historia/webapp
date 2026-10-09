import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    Building2,
    FileText,
    Gavel,
    Handshake,
    KeyRound,
    LayoutDashboard,
    Store,
    Users,
} from "lucide-react";

export type AdminSectionRoute =
    | "/$lng/admin/overview"
    | "/$lng/admin/users"
    | "/$lng/admin/partnership-applications"
    | "/$lng/admin/partnerships"
    | "/$lng/admin/parties"
    | "/$lng/admin/listing-sources"
    | "/$lng/admin/auctions"
    | "/$lng/admin/oauth-clients";

type AdminNavItem = {
    readonly to: AdminSectionRoute;
    readonly labelKey: string;
    readonly icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

type AdminNavGroup = {
    readonly labelKey: string;
    readonly items: readonly AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
    {
        labelKey: "adminNavigation.groups.general",
        items: [
            {
                to: "/$lng/admin/overview",
                labelKey: "adminNavigation.items.overview",
                icon: LayoutDashboard,
            },
            { to: "/$lng/admin/users", labelKey: "adminNavigation.items.users", icon: Users },
        ],
    },
    {
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
        labelKey: "adminNavigation.groups.catalogue",
        items: [
            {
                to: "/$lng/admin/listing-sources",
                labelKey: "adminNavigation.items.listingSources",
                icon: Store,
            },
            { to: "/$lng/admin/auctions", labelKey: "adminNavigation.items.auctions", icon: Gavel },
        ],
    },
    {
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

const LINK_CLASS =
    "flex shrink-0 items-center gap-2.5 border-l-2 border-transparent px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:border-primary data-[status=active]:bg-surface-container data-[status=active]:font-medium data-[status=active]:text-foreground";

export function AdminSidebar({ language }: { readonly language: string }) {
    const { t } = useTranslation();

    return (
        <nav aria-label={t("adminNavigation.label")} className="lg:sticky lg:top-28">
            {/* Below lg the groups collapse into one horizontally scrollable row. */}
            <div className="relative flex gap-1 overflow-x-auto border-b border-border px-4 py-2 sm:px-6 lg:grid lg:gap-6 lg:overflow-visible lg:border-b-0 lg:px-0 lg:py-0">
                {ADMIN_NAV_GROUPS.map((group) => (
                    <div key={group.labelKey} className="flex gap-1 lg:grid lg:gap-0.5">
                        <p className="sr-only px-3 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase lg:not-sr-only">
                            {t(group.labelKey)}
                        </p>
                        <ul className="flex gap-1 lg:grid lg:gap-0.5">
                            {group.items.map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        params={{ lng: language }}
                                        className={LINK_CLASS}
                                    >
                                        <item.icon className="size-4 shrink-0" aria-hidden />
                                        {t(item.labelKey)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
