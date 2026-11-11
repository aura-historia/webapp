import type { ReactNode } from "react";
import { AdminNavMenu, AdminNavRail } from "@/features/admin/common/components/AdminNav.tsx";
import { PAGE_COLUMN_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

/** The admin frame: a grouped section rail beside the page from 1024px, a section menu above it below. */
export function AdminLayout({ children }: { readonly children: ReactNode }) {
    return (
        <div className="bg-surface text-ink">
            <div className="sticky top-15 z-40 sm:top-16 lg:hidden">
                <AdminNavMenu />
            </div>
            <div
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "grid items-start gap-16 pt-7 pb-24 sm:pt-14 sm:pb-36 lg:grid-cols-[240px_minmax(0,1fr)]",
                )}
            >
                <div className="sticky top-28 hidden lg:block">
                    <AdminNavRail />
                </div>
                <main className="flex min-w-0 flex-col">{children}</main>
            </div>
        </div>
    );
}
