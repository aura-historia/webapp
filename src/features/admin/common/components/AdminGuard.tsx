import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import {
    ADMIN_SKELETON_CLASS,
    PAGE_COLUMN_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { AdminStatePanel } from "./AdminStatePanel.tsx";

/**
 * Client-side admin role guard. Renders children only when the signed-in account's role is ADMIN.
 * While the role is unknown it shows the shell's shape; for any other role, a failed request or no
 * account it shows the access panel and never renders the protected content.
 *
 * The backend secures every admin endpoint with the same role check; this guard is a UX layer.
 */
export function AdminGuard({ children }: { readonly children: ReactNode }) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useUserAccount();

    if (isLoading) {
        return (
            <div
                role="status"
                aria-label={t("adminDashboard.loading")}
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "grid items-start gap-16 pt-7 pb-24 sm:pt-14 lg:grid-cols-[240px_minmax(0,1fr)]",
                )}
            >
                <div className="hidden flex-col gap-2.5 lg:flex">
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-2.5 w-1/2")} />
                    {Array.from({ length: 9 }, (_, index) => (
                        <span
                            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
                            key={index}
                            className={cn(ADMIN_SKELETON_CLASS, "h-9 rounded-md")}
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-12 w-1/2 rounded-sm")} />
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-64 rounded-card")} />
                </div>
            </div>
        );
    }

    if (isError || data?.role !== "ADMIN") {
        return (
            <div className={cn(PAGE_COLUMN_CLASS, "py-14 sm:py-20")}>
                <AdminStatePanel
                    tone="error"
                    icon={ShieldAlert}
                    title={t("adminDashboard.accessDenied")}
                >
                    <Link to="/$lng" params={true} from="/$lng" className={SECONDARY_PILL_CLASS}>
                        {t("adminDashboard.goHome")}
                    </Link>
                </AdminStatePanel>
            </div>
        );
    }

    return <>{children}</>;
}
