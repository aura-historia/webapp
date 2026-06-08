import { useState } from "react";
import { Clock3, Globe, Plus, RefreshCw, SearchX, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import type {
    PartnerApplication,
    PartnerApplicationBusinessState,
    PartnerApplicationExecutionState,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { usePartnerApplications } from "@/features/partner-dashboard/api/usePartnerApplications.ts";
import { PartnerApplicationCreateDialog } from "@/features/partner-dashboard/components/PartnerApplicationCreateDialog.tsx";

const BUSINESS_STATE_TRANSLATION_KEY: Record<PartnerApplicationBusinessState, string> = {
    SUBMITTED: "partnerDashboard.applications.businessState.submitted",
    IN_REVIEW: "partnerDashboard.applications.businessState.inReview",
    APPROVED: "partnerDashboard.applications.businessState.approved",
    REJECTED: "partnerDashboard.applications.businessState.rejected",
};

const EXECUTION_STATE_TRANSLATION_KEY: Record<PartnerApplicationExecutionState, string> = {
    PROCESSING: "partnerDashboard.applications.executionState.processing",
    WAITING: "partnerDashboard.applications.executionState.waiting",
    COMPLETED: "partnerDashboard.applications.executionState.completed",
};

function businessStateVariant(
    state: PartnerApplicationBusinessState,
): "default" | "secondary" | "destructive" | "outline" {
    switch (state) {
        case "APPROVED":
            return "default";
        case "REJECTED":
            return "destructive";
        case "IN_REVIEW":
            return "secondary";
        case "SUBMITTED":
            return "outline";
        default:
            return "outline";
    }
}

function getApplicationTitle(application: PartnerApplication, existingShopLabel: string): string {
    if (application.payload.type === "NEW") {
        return application.payload.shopName;
    }

    return `${existingShopLabel}: ${application.payload.shopId}`;
}

export function PartnerApplicationsSection() {
    const { t, i18n } = useTranslation();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data: applications = [], isPending, isError, refetch } = usePartnerApplications();

    const renderContent = () => {
        if (isPending) {
            return <PartnerApplicationsSkeleton />;
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("partnerDashboard.applications.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {t("partnerDashboard.actions.retry")}
                    </Button>
                </div>
            );
        }

        if (applications.length === 0) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                        {t("partnerDashboard.applications.empty")}
                    </p>
                </div>
            );
        }

        return (
            <ul className="flex flex-col gap-3">
                {applications.map((application) => {
                    const title = getApplicationTitle(
                        application,
                        t("partnerDashboard.applications.existingShop"),
                    );

                    return (
                        <li
                            key={application.id}
                            className="flex flex-col gap-2 border bg-surface-container-low p-4"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex min-w-0 flex-col gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Store
                                            className="h-4 w-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="truncate font-medium" title={title}>
                                            {title}
                                        </span>
                                    </div>
                                    {application.payload.type === "NEW" && (
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                {t(
                                                    SHOP_TYPE_TRANSLATION_CONFIG[
                                                        application.payload.shopType
                                                    ].translationKey,
                                                )}
                                            </span>
                                            {application.payload.shopDomains.length > 0 && (
                                                <span className="flex min-w-0 items-center gap-1">
                                                    <Globe
                                                        className="h-3 w-3 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                    <span
                                                        className="truncate"
                                                        title={application.payload.shopDomains.join(
                                                            ", ",
                                                        )}
                                                    >
                                                        {application.payload.shopDomains.join(", ")}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant={businessStateVariant(application.businessState)}
                                    >
                                        {t(
                                            BUSINESS_STATE_TRANSLATION_KEY[
                                                application.businessState
                                            ],
                                        )}
                                    </Badge>
                                    <Badge variant="outline">
                                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                                        {t(
                                            EXECUTION_STATE_TRANSLATION_KEY[
                                                application.executionState
                                            ],
                                        )}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                    {t("partnerDashboard.applications.submittedAt", {
                                        date: formatShortDate(application.created, i18n.language),
                                    })}
                                </span>
                                <span>
                                    {t("partnerDashboard.applications.updatedAt", {
                                        date: formatShortDate(application.updated, i18n.language),
                                    })}
                                </span>
                                <span title={application.id} className="font-mono">
                                    #{application.id.slice(0, 8)}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-applications-title">
            <SectionHeader onCreateClick={() => setCreateDialogOpen(true)} />
            {renderContent()}
            <PartnerApplicationCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </section>
    );
}

function SectionHeader({ onCreateClick }: { readonly onCreateClick: () => void }) {
    const { t } = useTranslation();

    return (
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
                <H2 id="partner-applications-title">{t("partnerDashboard.applications.title")}</H2>
                <p className="text-sm text-muted-foreground md:text-base">
                    {t("partnerDashboard.applications.description")}
                </p>
            </div>
            <Button type="button" onClick={onCreateClick}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("partnerDashboard.create.open")}
            </Button>
        </header>
    );
}

function PartnerApplicationsSkeleton() {
    const { t } = useTranslation();

    return (
        <div role="status" aria-live="polite">
            <span className="sr-only">{t("partnerDashboard.applications.loading")}</span>
            <ul className="flex flex-col gap-3">
                {["application-skeleton-1", "application-skeleton-2", "application-skeleton-3"].map(
                    (id) => (
                        <li
                            key={id}
                            className="flex flex-col gap-3 border bg-surface-container-low p-4"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 shrink-0 rounded-none" />
                                        <Skeleton className="h-5 w-full max-w-64" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-6 w-24 rounded-none" />
                                    <Skeleton className="h-6 w-32 rounded-none" />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
}
