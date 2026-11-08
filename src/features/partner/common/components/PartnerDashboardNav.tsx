import { Link, useRouterState } from "@tanstack/react-router";
import {
    ArrowRight,
    Check,
    ChevronDown,
    FileText,
    KeyRound,
    LayoutGrid,
    Store,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { FOCUS_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

type SectionPath =
    | "/$lng/partners"
    | "/$lng/partners/applications"
    | "/$lng/partners/listing-sources"
    | "/$lng/partners/access-tokens";

type Section = {
    readonly to: SectionPath;
    readonly labelKey: string;
    readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
    /** The overview is active only on its own path; the others also on deeper paths. */
    readonly exact?: boolean;
};

const SECTIONS: readonly Section[] = [
    {
        to: "/$lng/partners",
        labelKey: "partnerDashboard.nav.overview",
        icon: LayoutGrid,
        exact: true,
    },
    {
        to: "/$lng/partners/applications",
        labelKey: "partnerDashboard.nav.applications",
        icon: FileText,
    },
    {
        to: "/$lng/partners/listing-sources",
        labelKey: "partnerDashboard.nav.providers",
        icon: Store,
    },
    {
        to: "/$lng/partners/access-tokens",
        labelKey: "partnerDashboard.nav.accessTokens",
        icon: KeyRound,
    },
];

const GUIDES = [
    {
        to: "/$lng/partner-program/custom-integration",
        labelKey: "partnerDashboard.nav.customIntegration",
    },
    { to: "/$lng/partner-program", labelKey: "partnerDashboard.nav.partnerProgram" },
] as const;

function useActiveSection(): Section {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const lng = pathname.split("/")[1] ?? "";
    const normalized = pathname.replace(/\/$/, "");
    const active = [...SECTIONS].reverse().find((section) => {
        const path = section.to.replace("$lng", lng);
        return section.exact
            ? normalized === path
            : normalized === path || normalized.startsWith(`${path}/`);
    });
    return active ?? SECTIONS[0];
}

/** The sticky section rail beside the dashboard pages, from 1024px (board "Section navigation"). */
export function PartnerDashboardRail() {
    const { t } = useTranslation();
    const active = useActiveSection();

    return (
        <nav aria-label={t("partnerDashboard.navLabel")} className="flex w-60 flex-col gap-7">
            <div className="flex flex-col gap-3">
                <p className="px-3 font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase">
                    {t("partnerDashboard.navLabel")}
                </p>
                <ul className="flex flex-col gap-1">
                    {SECTIONS.map((section) => {
                        const isActive = section === active;
                        const Icon = section.icon;
                        return (
                            <li key={section.to}>
                                <Link
                                    to={section.to}
                                    params={true}
                                    from="/$lng"
                                    aria-current={isActive ? "page" : undefined}
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
                                    {t(section.labelKey)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="flex flex-col gap-2 border-t border-line pt-5">
                <p className="px-3 font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                    {t("partnerDashboard.nav.guides")}
                </p>
                <ul className="flex flex-col">
                    {GUIDES.map((guide) => (
                        <li key={guide.to}>
                            <Link
                                to={guide.to}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "flex min-h-10 items-center justify-between gap-2 px-3 text-meta text-ink-secondary hover:text-ink",
                                    FOCUS_CLASS,
                                )}
                            >
                                {t(guide.labelKey)}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-[13px]"
                                    strokeWidth={1.8}
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

/** The section menu under the header below 1024px: names the dashboard and the current section. */
export function PartnerDashboardMenu() {
    const { t } = useTranslation();
    const active = useActiveSection();
    const ActiveIcon = active.icon;

    return (
        <nav
            aria-label={t("partnerDashboard.navLabel")}
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
                            {t("partnerDashboard.navLabel")}
                        </span>
                        <span className="flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink">
                            <ActiveIcon
                                aria-hidden="true"
                                className="size-[17px] shrink-0 text-oxblood"
                                strokeWidth={1.7}
                            />
                            <span className="truncate">{t(active.labelKey)}</span>
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
                    className="w-[calc(var(--radix-dropdown-menu-trigger-width)+8px)] -translate-x-1 rounded-lg border-0 bg-surface-raised p-1.5 text-ink shadow-menu"
                >
                    {SECTIONS.map((section) => {
                        const isActive = section === active;
                        const Icon = section.icon;
                        return (
                            <DropdownMenuItem key={section.to} asChild>
                                <Link
                                    to={section.to}
                                    params={true}
                                    from="/$lng"
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-3 text-[15px] focus:bg-surface-sunken data-highlighted:bg-surface-sunken",
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
                                    <span className="flex-1">{t(section.labelKey)}</span>
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
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
}
