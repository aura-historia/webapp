import { Check, ExternalLink, Mail, Phone, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { usePartnerApplicationDetails } from "@/features/partner-dashboard/api/usePartnerApplications.ts";
import { formatShortDate } from "@/lib/utils.ts";
import {
    BUSINESS_STATE_TRANSLATION_KEY,
    businessStateVariant,
    getAddressSummary,
    getApplicationTitle,
    getProgressValue,
} from "@/features/partner-dashboard/lib/partnerApplicationHelpers.ts";

function Field({ label, value }: { readonly label: string; readonly value?: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="break-words text-sm">{value || "—"}</dd>
        </div>
    );
}

function LinkField({ label, value }: { readonly label: string; readonly value?: string }) {
    if (!value) {
        return <Field label={label} />;
    }

    return (
        <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="min-w-0 text-sm">
                <a
                    className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline"
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="truncate">{value}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
            </dd>
        </div>
    );
}

function ApplicationProgress({ application }: { readonly application: PartnerApplication }) {
    const { t } = useTranslation();

    const getFinalLabel = () => {
        if (application.businessState === "APPROVED") {
            return t("partnerDashboard.applications.progress.approved");
        }
        if (application.businessState === "REJECTED") {
            return t("partnerDashboard.applications.progress.denied");
        }
        return t("partnerDashboard.applications.progress.completed");
    };

    const getCurrentStep = () => {
        if (application.businessState === "SUBMITTED") {
            return 0;
        }
        if (application.businessState === "IN_REVIEW") {
            return 1;
        }
        return 2;
    };
    const stops = [
        t("partnerDashboard.applications.progress.handedIn"),
        t("partnerDashboard.applications.progress.checking"),
        getFinalLabel(),
    ];

    return (
        <div className="grid gap-3">
            <div className="relative h-4">
                <Progress
                    value={getProgressValue(application.businessState)}
                    aria-label={t("partnerDashboard.applications.detail.progressLabel")}
                    aria-valuetext={t(BUSINESS_STATE_TRANSLATION_KEY[application.businessState])}
                    className={`absolute top-1/2 h-2 -translate-y-1/2 ${
                        application.businessState === "REJECTED" ? "[&>div]:bg-destructive" : ""
                    }`}
                />
                <div className="absolute inset-x-0 top-1/2 grid -translate-y-1/2 grid-cols-3">
                    {stops.map((label, index) => (
                        <span
                            key={label}
                            className={`h-3 w-3 rounded-full border-2 ${
                                index <= getCurrentStep()
                                    ? application.businessState === "REJECTED" && index === 2
                                        ? "border-destructive bg-destructive"
                                        : "border-primary bg-primary"
                                    : "border-primary/30 bg-background"
                            } ${index === 0 ? "justify-self-start" : index === 1 ? "justify-self-center" : "justify-self-end"}`}
                            aria-hidden="true"
                        />
                    ))}
                </div>
            </div>
            <ol className="grid grid-cols-3 text-xs text-muted-foreground">
                {stops.map((label, index) => (
                    <li
                        key={label}
                        className={`${
                            index <= getCurrentStep() ? "font-medium text-foreground" : ""
                        } ${index === 0 ? "text-left" : index === 1 ? "text-center" : "text-right"}`}
                    >
                        {label}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div role="status" aria-live="polite" className="grid gap-4">
            <Skeleton className="h-24 w-full rounded-none" />
            <Skeleton className="h-36 w-full rounded-none" />
            <Skeleton className="h-28 w-full rounded-none" />
        </div>
    );
}

function ApplicationDetails({ application }: { readonly application: PartnerApplication }) {
    const { t, i18n } = useTranslation();
    const title = getApplicationTitle(application, t("partnerDashboard.applications.existingShop"));

    return (
        <div className="grid gap-4">
            <section className="border bg-surface-container-low p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                            <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <h3 className="truncate font-medium" title={title}>
                                {title}
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <Badge variant={businessStateVariant(application.businessState)}>
                                {application.businessState === "APPROVED" && (
                                    <Check className="h-3 w-3" aria-hidden="true" />
                                )}
                                {t(BUSINESS_STATE_TRANSLATION_KEY[application.businessState])}
                            </Badge>
                        </div>
                    </div>
                    <ApplicationProgress application={application} />
                </div>
            </section>

            <section className="border p-4">
                <h3 className="font-medium">
                    {t("partnerDashboard.applications.detail.applicationSection")}
                </h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field
                        label={t("partnerDashboard.applications.detail.applicationId")}
                        value={application.id}
                    />
                    <Field
                        label={t("partnerDashboard.applications.detail.applicantUserId")}
                        value={application.applicantUserId}
                    />
                    <Field
                        label={t("partnerDashboard.applications.detail.createdAt")}
                        value={formatShortDate(application.created, i18n.language)}
                    />
                    <Field
                        label={t("partnerDashboard.applications.detail.updatedAt")}
                        value={formatShortDate(application.updated, i18n.language)}
                    />
                </dl>
            </section>

            <section className="border p-4">
                <h3 className="font-medium">
                    {t("partnerDashboard.applications.detail.shopSection")}
                </h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {application.payload.type === "NEW" ? (
                        <>
                            <Field
                                label={t("partnerDashboard.applications.detail.shopName")}
                                value={application.payload.shopName}
                            />
                            <Field
                                label={t("partnerDashboard.applications.detail.shopType")}
                                value={t(
                                    SHOP_TYPE_TRANSLATION_CONFIG[application.payload.shopType]
                                        .translationKey,
                                )}
                            />
                            <Field
                                label={t("partnerDashboard.applications.detail.domains")}
                                value={application.payload.shopDomains.join(", ")}
                            />
                            <LinkField
                                label={t("partnerDashboard.applications.detail.shopUrl")}
                                value={application.payload.shopUrl}
                            />
                            <LinkField
                                label={t("partnerDashboard.applications.detail.shopImage")}
                                value={application.payload.shopImage}
                            />
                            {application.payload.shopPhone && (
                                <div className="flex min-w-0 flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {t("partnerDashboard.applications.detail.shopPhone")}
                                    </dt>
                                    <dd className="min-w-0 text-sm">
                                        <a
                                            className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline"
                                            href={`tel:${application.payload.shopPhone}`}
                                        >
                                            <Phone
                                                className="h-3 w-3 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="truncate">
                                                {application.payload.shopPhone}
                                            </span>
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {application.payload.shopEmail && (
                                <div className="flex min-w-0 flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {t("partnerDashboard.applications.detail.shopEmail")}
                                    </dt>
                                    <dd className="min-w-0 text-sm">
                                        <a
                                            className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline"
                                            href={`mailto:${application.payload.shopEmail}`}
                                        >
                                            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                                            <span className="truncate">
                                                {application.payload.shopEmail}
                                            </span>
                                        </a>
                                    </dd>
                                </div>
                            )}
                            <Field
                                label={t("partnerDashboard.applications.detail.address")}
                                value={getAddressSummary(application.payload.shopStructuredAddress)}
                            />
                        </>
                    ) : (
                        <Field
                            label={t("partnerDashboard.applications.detail.shopId")}
                            value={application.payload.shopId}
                        />
                    )}
                </dl>
            </section>
        </div>
    );
}

interface PartnerApplicationDetailDialogProps {
    readonly applicationId?: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function PartnerApplicationDetailDialog({
    applicationId,
    open,
    onOpenChange,
}: PartnerApplicationDetailDialogProps) {
    const { t } = useTranslation();
    const {
        data: application,
        isPending,
        isError,
        refetch,
    } = usePartnerApplicationDetails(applicationId, open);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("partnerDashboard.applications.detail.title")}</DialogTitle>
                    <DialogDescription>
                        {t("partnerDashboard.applications.detail.description")}
                    </DialogDescription>
                </DialogHeader>

                {isPending && <DetailSkeleton />}
                {isError && (
                    <div className="flex flex-col items-start gap-3 border bg-surface-container-low p-4">
                        <p className="text-sm text-muted-foreground">
                            {t("partnerDashboard.applications.detail.loadError")}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                            {t("partnerDashboard.actions.retry")}
                        </Button>
                    </div>
                )}
                {!isPending && !isError && application && (
                    <ApplicationDetails application={application} />
                )}
            </DialogContent>
        </Dialog>
    );
}
