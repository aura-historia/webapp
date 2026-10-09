import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    type AdminApplicationFilters,
    type AdminPartnershipApplicationSummary,
    adminApplicationName,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { useAdminPartnershipApplications } from "../api/useAdminPartnershipApplications.ts";
import {
    ADMIN_APPLICATION_STATE_TRANSLATION_KEY,
    adminApplicationStateVariant,
    PROPOSAL_TYPE_TRANSLATION_KEY,
} from "../lib/adminApplicationPresentation.ts";
import { AdminApplicationDetailDialog } from "./AdminApplicationDetailDialog.tsx";
import { AdminApplicationFiltersForm } from "./AdminApplicationFiltersForm.tsx";

function ApplicationRow({
    application,
    onOpen,
}: {
    readonly application: AdminPartnershipApplicationSummary;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    return (
        <li className="flex flex-wrap items-center justify-between gap-3 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all font-medium">{adminApplicationName(application)}</p>
                    <Badge variant={adminApplicationStateVariant(application.state)}>
                        {t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[application.state])}
                    </Badge>
                    <Badge variant="outline">
                        {t(PROPOSAL_TYPE_TRANSLATION_KEY[application.proposal.type])}
                    </Badge>
                </div>
                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span className="break-all font-mono">{application.id}</span>
                    <span>
                        {t("adminApplications.list.applicant", {
                            id: application.applicantUserId,
                        })}
                    </span>
                    <span>
                        {t("adminApplications.list.created", {
                            date: formatShortDate(application.created, i18n.language),
                        })}
                    </span>
                    <span>
                        {t("adminApplications.list.updated", {
                            date: formatShortDate(application.updated, i18n.language),
                        })}
                    </span>
                </p>
            </div>
            <Button variant="outline" onClick={onOpen}>
                {t("adminApplications.actions.details")}
            </Button>
        </li>
    );
}

export function AdminPartnershipApplicationsSection({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminApplicationFilters;
    readonly onFiltersChange: (filters: AdminApplicationFilters) => void;
}) {
    const { t } = useTranslation();
    const { data, isPending, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useAdminPartnershipApplications(filters);
    const [selectedId, setSelectedId] = useState<string>();
    const applications = data?.pages.flatMap((page) => page.items) ?? [];
    const selected = applications.find((application) => application.id === selectedId);
    const total = data?.pages[0]?.total;

    let content: ReactNode;
    if (error && applications.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{t("adminApplications.loadError")}</p>
                <Button variant="outline" onClick={() => refetch()}>
                    {t("adminApplications.retry")}
                </Button>
            </div>
        );
    } else if (isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminApplications.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                ))}
            </div>
        );
    } else if (applications.length === 0) {
        content = <p className="py-6 text-muted-foreground">{t("adminApplications.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                {typeof total === "number" && (
                    <p className="text-sm text-muted-foreground">
                        {t("adminApplications.list.total", { count: total })}
                    </p>
                )}
                <ul className="grid gap-2">
                    {applications.map((application) => (
                        <ApplicationRow
                            key={application.id}
                            application={application}
                            onOpen={() => setSelectedId(application.id)}
                        />
                    ))}
                </ul>
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error.message}
                    </p>
                )}
                {hasNextPage && (
                    <Button
                        variant="outline"
                        className="justify-self-center"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                    >
                        {isFetchingNextPage
                            ? t("adminApplications.list.loadingMore")
                            : t("adminApplications.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <section className="grid gap-6" aria-labelledby="admin-applications-title">
            <header className="grid gap-1">
                <H1 id="admin-applications-title">{t("adminApplications.title")}</H1>
                <p className="text-muted-foreground">{t("adminApplications.description")}</p>
            </header>
            <AdminApplicationFiltersForm
                key={JSON.stringify(filters)}
                filters={filters}
                onApply={onFiltersChange}
            />
            {content}
            <AdminApplicationDetailDialog
                applicationId={selectedId}
                timestamps={selected}
                open={Boolean(selectedId)}
                onOpenChange={(open) => {
                    if (!open) setSelectedId(undefined);
                }}
            />
        </section>
    );
}
