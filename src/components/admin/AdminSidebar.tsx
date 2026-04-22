import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Store, FileText } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { ReactNode } from "react";

type AdminSidebarItem = {
    readonly to: "/admin" | "/admin/shops" | "/admin/partner-applications";
    readonly labelKey: string;
    readonly icon: ReactNode;
    readonly exact?: boolean;
};

const SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
    {
        to: "/admin",
        labelKey: "adminDashboard.nav.overview",
        icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
        exact: true,
    },
    {
        to: "/admin/shops",
        labelKey: "adminDashboard.nav.shops",
        icon: <Store className="h-4 w-4" aria-hidden="true" />,
    },
    {
        to: "/admin/partner-applications",
        labelKey: "adminDashboard.nav.partnerApplications",
        icon: <FileText className="h-4 w-4" aria-hidden="true" />,
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
                const isActive = item.exact
                    ? pathname === item.to
                    : pathname === item.to || pathname.startsWith(`${item.to}/`);
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
                    >
                        {item.icon}
                        {t(item.labelKey)}
                    </Link>
                );
            })}
        </nav>
    );
}
