import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

const SIDEBAR_ITEMS = [
    {
        to: "/partners/applications",
        labelKey: "partnerDashboard.nav.applications",
        icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    },
    {
        to: "/partners/access-tokens",
        labelKey: "partnerDashboard.nav.accessTokens",
        icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
    },
] as const;

export function PartnerSidebar() {
    const { t } = useTranslation();
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    return (
        <nav
            aria-label={t("partnerDashboard.sidebarLabel")}
            className="flex flex-row gap-1 overflow-x-auto border-b lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:pr-4"
        >
            <h2 className="hidden px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:block">
                {t("partnerDashboard.sidebarLabel")}
            </h2>
            {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);

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
