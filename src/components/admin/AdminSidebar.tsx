import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FileText, KeyRound, LayoutDashboard, Store, Users } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { ReactNode } from "react";

type AdminSidebarItem = {
    readonly to:
        | "/$lng/admin/overview"
        | "/$lng/admin/shops"
        | "/$lng/admin/partner-applications"
        | "/$lng/admin/oauth-clients"
        | "/$lng/admin/users";
    readonly labelKey: string;
    readonly icon: ReactNode;
    readonly exact?: boolean;
};

const SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
    {
        to: "/$lng/admin/overview",
        labelKey: "adminDashboard.nav.overview",
        icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
        exact: true,
    },
    {
        to: "/$lng/admin/shops",
        labelKey: "adminDashboard.nav.shops",
        icon: <Store className="h-4 w-4" aria-hidden="true" />,
    },
    {
        to: "/$lng/admin/partner-applications",
        labelKey: "adminDashboard.nav.partnerApplications",
        icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    },
    {
        to: "/$lng/admin/oauth-clients",
        labelKey: "adminDashboard.nav.oauthClients",
        icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
    },
    {
        to: "/$lng/admin/users",
        labelKey: "adminDashboard.nav.users",
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
    },
];

export function AdminSidebar() {
    const { t } = useTranslation();
    const pathname = useRouterState({ select: (s) => s.location.pathname });

    return (
        <nav
            aria-label={t("adminDashboard.sidebarLabel")}
            className="flex flex-row gap-1 overflow-x-auto border-b lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:pr-4"
        >
            <h2 className="hidden px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:block">
                {t("adminDashboard.sidebarLabel")}
            </h2>
            {SIDEBAR_ITEMS.map((item) => {
                const concretePath = item.to.replace("$lng", pathname.split("/")[1] ?? "");
                const isActive = item.exact
                    ? pathname === concretePath
                    : pathname === concretePath || pathname.startsWith(`${concretePath}/`);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                            "hover:bg-muted hover:text-foreground",
                            isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                        )}
                        aria-current={isActive ? "page" : undefined}
                        params={true}
                        from="/$lng"
                    >
                        {item.icon}
                        {t(item.labelKey)}
                    </Link>
                );
            })}
        </nav>
    );
}
