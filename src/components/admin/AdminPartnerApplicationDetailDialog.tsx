import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ExternalLink, UserRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { useAdminUser } from "@/hooks/admin/useAdminUsers.ts";
import { formatShortDate } from "@/lib/utils.ts";

interface AdminPartnerApplicationDetailDialogProps {
    readonly application: PartnerApplication | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { readonly label: string; readonly value?: string }) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="break-words text-sm">{value || "—"}</dd>
        </div>
    );
}

export function AdminPartnerApplicationDetailDialog({
    application,
    open,
    onOpenChange,
}: AdminPartnerApplicationDetailDialogProps) {
    const { t, i18n } = useTranslation();
    const {
        data: applicant,
        isPending: isApplicantPending,
        isError: isApplicantError,
        refetch: refetchApplicant,
    } = useAdminUser(application?.applicantUserId, open && Boolean(application));

    if (!application) {
        return null;
    }

    const applicantName = applicant
        ? [applicant.firstName, applicant.lastName].filter(Boolean).join(" ") || applicant.email
        : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.applications.detail.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.applications.detail.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <section className="rounded-md border bg-surface-container-low p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">
                                {application.payload.type === "NEW"
                                    ? application.payload.shopName
                                    : t("adminDashboard.applications.existingShop")}
                            </h3>
                            <Badge variant="outline">{application.businessState}</Badge>
                            <Badge variant="outline">{application.executionState}</Badge>
                        </div>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            <Field
                                label={t("adminDashboard.applications.detail.applicationId")}
                                value={application.id}
                            />
                            <Field
                                label={t("adminDashboard.applications.detail.payloadType")}
                                value={t(
                                    application.payload.type === "NEW"
                                        ? "adminDashboard.applications.payloadType.new"
                                        : "adminDashboard.applications.payloadType.existing",
                                )}
                            />
                            <Field
                                label={t("adminDashboard.applications.detail.createdAt")}
                                value={formatShortDate(application.created, i18n.language)}
                            />
                            <Field
                                label={t("adminDashboard.applications.detail.updatedAt")}
                                value={formatShortDate(application.updated, i18n.language)}
                            />
                        </dl>
                    </section>

                    <section className="rounded-md border p-4">
                        <h3 className="font-medium">
                            {t("adminDashboard.applications.detail.shopSection")}
                        </h3>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            {application.payload.type === "NEW" ? (
                                <>
                                    <Field
                                        label={t("adminDashboard.applications.fields.shopName")}
                                        value={application.payload.shopName}
                                    />
                                    <Field
                                        label={t("adminDashboard.applications.fields.shopType")}
                                        value={t(
                                            SHOP_TYPE_TRANSLATION_CONFIG[
                                                application.payload.shopType
                                            ].translationKey,
                                        )}
                                    />
                                    <Field
                                        label={t("adminDashboard.applications.fields.domains")}
                                        value={application.payload.shopDomains.join(", ")}
                                    />
                                    <Field
                                        label={t("adminDashboard.applications.fields.image")}
                                        value={application.payload.shopImage}
                                    />
                                    {application.payload.shopPhone && (
                                        <Field
                                            label={t("adminDashboard.shops.fields.phone")}
                                            value={application.payload.shopPhone}
                                        />
                                    )}
                                    {application.payload.shopEmail && (
                                        <Field
                                            label={t("adminDashboard.shops.fields.email")}
                                            value={application.payload.shopEmail}
                                        />
                                    )}
                                    {application.payload.shopStructuredAddress && (
                                        <Field
                                            label={t("adminDashboard.shops.fields.locality")}
                                            value={[
                                                application.payload.shopStructuredAddress
                                                    .addressline,
                                                application.payload.shopStructuredAddress.locality,
                                                application.payload.shopStructuredAddress
                                                    .postalCode,
                                                application.payload.shopStructuredAddress.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        />
                                    )}
                                    {application.payload.shopSpecialitiesCategories &&
                                        application.payload.shopSpecialitiesCategories.length >
                                            0 && (
                                            <Field
                                                label={t(
                                                    "adminDashboard.shops.fields.specialitiesCategories",
                                                )}
                                                value={application.payload.shopSpecialitiesCategories.join(
                                                    ", ",
                                                )}
                                            />
                                        )}
                                    {application.payload.shopSpecialitiesPeriods &&
                                        application.payload.shopSpecialitiesPeriods.length > 0 && (
                                            <Field
                                                label={t(
                                                    "adminDashboard.shops.fields.specialitiesPeriods",
                                                )}
                                                value={application.payload.shopSpecialitiesPeriods.join(
                                                    ", ",
                                                )}
                                            />
                                        )}
                                </>
                            ) : (
                                <Field
                                    label={t("adminDashboard.applications.detail.shopId")}
                                    value={application.payload.shopId}
                                />
                            )}
                        </dl>
                    </section>

                    <section className="rounded-md border p-4">
                        <div className="flex items-center gap-2">
                            <UserRound
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <h3 className="font-medium">
                                {t("adminDashboard.applications.detail.applicantSection")}
                            </h3>
                        </div>

                        {isApplicantPending ? (
                            <div
                                className="flex justify-center py-6"
                                role="status"
                                aria-live="polite"
                            >
                                <Spinner />
                            </div>
                        ) : isApplicantError || !applicant ? (
                            <div className="mt-3 flex flex-col items-start gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {t("adminDashboard.applications.detail.applicantLoadError")}
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => refetchApplicant()}
                                >
                                    {t("adminDashboard.actions.retry")}
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-col gap-3">
                                <dl className="grid gap-3 sm:grid-cols-2">
                                    <Field
                                        label={t("adminDashboard.users.fields.email")}
                                        value={applicant.email}
                                    />
                                    <Field
                                        label={t("adminDashboard.users.fields.name")}
                                        value={applicantName}
                                    />
                                    <Field
                                        label={t("adminDashboard.users.fields.tier")}
                                        value={applicant.tier}
                                    />
                                    <Field
                                        label={t("adminDashboard.users.fields.role")}
                                        value={applicant.role}
                                    />
                                </dl>
                                <Button asChild size="sm" className="w-fit">
                                    <Link to="/admin/users" search={{ userId: applicant.userId }}>
                                        {t("adminDashboard.applications.detail.openApplicant")}
                                        <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
