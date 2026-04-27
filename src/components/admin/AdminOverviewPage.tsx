import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FileText, Store, Users } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";
import { useAdminPartnerApplications } from "@/hooks/admin/useAdminPartnerApplications.ts";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers.ts";

export function AdminOverviewPage() {
    const { t } = useTranslation();
    const { data: applications } = useAdminPartnerApplications();
    const { data: users } = useAdminUsers({ sort: "updated", order: "desc" });

    const pendingApplications =
        applications?.filter(
            (a) => a.businessState === "SUBMITTED" || a.businessState === "IN_REVIEW",
        ).length ?? 0;
    const totalUsers = users?.pages[0]?.total;

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-1">
                <H1>{t("adminDashboard.overview.title")}</H1>
                <p className="text-base text-muted-foreground">
                    {t("adminDashboard.overview.description")}
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Link
                    to="/admin/shops"
                    className="group flex flex-col gap-2 rounded-md border bg-surface-container-low p-5 transition-colors hover:border-primary"
                >
                    <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                        <h2 className="text-lg font-medium">
                            {t("adminDashboard.overview.shops.title")}
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.overview.shops.description")}
                    </p>
                </Link>

                <Link
                    to="/admin/partner-applications"
                    className="group flex flex-col gap-2 rounded-md border bg-surface-container-low p-5 transition-colors hover:border-primary"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                        <h2 className="text-lg font-medium">
                            {t("adminDashboard.overview.applications.title")}
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.overview.applications.description")}
                    </p>
                    {pendingApplications > 0 && (
                        <p className="text-sm font-medium text-primary">
                            {t("adminDashboard.overview.applications.pendingCount", {
                                count: pendingApplications,
                            })}
                        </p>
                    )}
                </Link>

                <Link
                    to="/admin/users"
                    className="group flex flex-col gap-2 rounded-md border bg-surface-container-low p-5 transition-colors hover:border-primary"
                >
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                        <h2 className="text-lg font-medium">
                            {t("adminDashboard.overview.users.title")}
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.overview.users.description")}
                    </p>
                    {totalUsers !== undefined && (
                        <p className="text-sm font-medium text-primary">
                            {t("adminDashboard.overview.users.totalCount", {
                                count: totalUsers,
                            })}
                        </p>
                    )}
                </Link>
            </div>
        </div>
    );
}
