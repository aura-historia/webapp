import type { ReactNode } from "react";
import {
    PartnerDashboardMenu,
    PartnerDashboardRail,
} from "@/features/partner/common/components/PartnerDashboardNav.tsx";
import { PAGE_COLUMN_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

interface PartnerLayoutProps {
    readonly children: ReactNode;
}

/** The dashboard frame: a section rail beside the page from 1024px, a section menu above it below. */
export function PartnerLayout({ children }: PartnerLayoutProps) {
    return (
        <div className="bg-surface text-ink">
            <div className="sticky top-15 z-40 sm:top-16 lg:hidden">
                <PartnerDashboardMenu />
            </div>
            <div
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "grid items-start gap-16 pt-8 pb-24 sm:pt-14 sm:pb-36 lg:grid-cols-[240px_minmax(0,1fr)]",
                )}
            >
                <div className="sticky top-28 hidden lg:block">
                    <PartnerDashboardRail />
                </div>
                <main className="flex min-w-0 flex-col gap-10 sm:gap-14">{children}</main>
            </div>
        </div>
    );
}
