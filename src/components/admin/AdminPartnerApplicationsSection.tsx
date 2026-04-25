import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Eye, Globe, Pencil, Store, UserRound, X } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/shop/ShopType.ts";
import type {
    PartnerApplication,
    PartnerApplicationBusinessState,
    PartnerApplicationExecutionState,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { useAdminPartnerApplications } from "@/hooks/admin/useAdminPartnerApplications.ts";
import {
    useAdminPartnerApplicationDecision,
    usePatchAdminPartnerApplication,
} from "@/hooks/admin/useAdminPartnerApplicationActions.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { toast } from "sonner";
import { AdminApplicationEditDialog } from "@/components/admin/AdminApplicationEditDialog.tsx";
import { AdminPartnerApplicationDetailDialog } from "@/components/admin/AdminPartnerApplicationDetailDialog.tsx";

const BUSINESS_STATE_TRANSLATION_KEY: Record<PartnerApplicationBusinessState, string> = {
    SUBMITTED: "adminDashboard.applications.businessState.submitted",
    IN_REVIEW: "adminDashboard.applications.businessState.inReview",
    APPROVED: "adminDashboard.applications.businessState.approved",
    REJECTED: "adminDashboard.applications.businessState.rejected",
};

const EXECUTION_STATE_TRANSLATION_KEY: Record<PartnerApplicationExecutionState, string> = {
    PROCESSING: "adminDashboard.applications.executionState.processing",
    WAITING: "adminDashboard.applications.executionState.waiting",
    COMPLETED: "adminDashboard.applications.executionState.completed",
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

function shopTypeLabel(t: (k: string) => string, shopType: ShopType): string {
    return t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey);
}

const TAB_FILTERS: Record<"PENDING" | "DECIDED" | "ALL", PartnerApplicationBusinessState[] | null> =
    {
        PENDING: ["SUBMITTED", "IN_REVIEW"],
        DECIDED: ["APPROVED", "REJECTED"],
        ALL: null,
    };

export function AdminPartnerApplicationsSection() {
    const { t, i18n } = useTranslation();
    const { data, isPending, isError, refetch } = useAdminPartnerApplications();
    const decision = useAdminPartnerApplicationDecision();
    const patch = usePatchAdminPartnerApplication();
    const [tab, setTab] = useState<"PENDING" | "DECIDED" | "ALL">("PENDING");
    const [editTarget, setEditTarget] = useState<PartnerApplication | null>(null);
    const [detailTarget, setDetailTarget] = useState<PartnerApplication | null>(null);

    const filtered =
        data?.filter((a) => {
            const filter = TAB_FILTERS[tab];
            return filter === null || filter.includes(a.businessState);
        }) ?? [];

    const handleDecision = (application: PartnerApplication, dec: "APPROVE" | "REJECT") => {
        decision.mutate(
            { partnerApplicationId: application.id, decision: dec },
            {
                onSuccess: () => {
                    toast.success(
                        t(
                            dec === "APPROVE"
                                ? "adminDashboard.applications.decision.approveSuccess"
                                : "adminDashboard.applications.decision.rejectSuccess",
                        ),
                    );
                },
            },
        );
    };

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
                <H1>{t("adminDashboard.applications.title")}</H1>
                <p className="text-base text-muted-foreground">
                    {t("adminDashboard.applications.description")}
                </p>
            </header>

            <div className="flex flex-wrap items-center gap-1">
                {(Object.keys(TAB_FILTERS) as Array<keyof typeof TAB_FILTERS>).map((key) => (
                    <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant={tab === key ? "default" : "outline"}
                        onClick={() => setTab(key)}
                    >
                        {t(`adminDashboard.applications.tabs.${key.toLowerCase()}`)}
                    </Button>
                ))}
            </div>

            {isPending ? (
                <div className="flex justify-center py-10" role="status" aria-live="polite">
                    <Spinner />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.applications.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        {t("adminDashboard.actions.retry")}
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {t("adminDashboard.applications.empty")}
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {filtered.map((application) => {
                        const isNew = application.payload.type === "NEW";
                        const reviewable =
                            application.businessState === "IN_REVIEW" &&
                            application.executionState === "WAITING";
                        const editable = isNew && application.businessState !== "APPROVED";
                        return (
                            <li
                                key={application.id}
                                className="flex flex-col gap-2 rounded-md border bg-surface-container-low p-3"
                            >
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <Store
                                        className="h-4 w-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    {application.payload.type === "NEW" ? (
                                        <span className="font-medium">
                                            {application.payload.shopName}
                                        </span>
                                    ) : (
                                        <span
                                            className="font-mono text-sm"
                                            title={application.payload.shopId}
                                        >
                                            {t("adminDashboard.applications.existingShop")}:{" "}
                                            {application.payload.shopId}
                                        </span>
                                    )}
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
                                        {t(
                                            EXECUTION_STATE_TRANSLATION_KEY[
                                                application.executionState
                                            ],
                                        )}
                                    </Badge>
                                    <Badge variant="outline">
                                        {application.payload.type === "NEW"
                                            ? t("adminDashboard.applications.payloadType.new")
                                            : t("adminDashboard.applications.payloadType.existing")}
                                    </Badge>
                                </div>

                                {application.payload.type === "NEW" && (
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span>
                                            {shopTypeLabel(t, application.payload.shopType)}
                                        </span>
                                        {application.payload.shopDomains.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" aria-hidden="true" />
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

                                <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                    <span title={application.id} className="font-mono">
                                        #{application.id.slice(0, 8)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <UserRound className="h-3 w-3" aria-hidden="true" />
                                        <span className="font-mono">
                                            {application.applicantUserId.slice(0, 8)}
                                        </span>
                                    </span>
                                    <span>
                                        {t("adminDashboard.applications.submittedAt", {
                                            date: formatShortDate(
                                                application.created,
                                                i18n.language,
                                            ),
                                        })}
                                    </span>
                                    <span>
                                        {t("adminDashboard.applications.updatedAt", {
                                            date: formatShortDate(
                                                application.updated,
                                                i18n.language,
                                            ),
                                        })}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDetailTarget(application)}
                                    >
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                        {t("adminDashboard.applications.actions.details")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        disabled={!reviewable || decision.isPending}
                                        onClick={() => handleDecision(application, "APPROVE")}
                                        aria-label={t(
                                            "adminDashboard.applications.actions.approveAriaLabel",
                                        )}
                                    >
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                        {t("adminDashboard.applications.actions.approve")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={!reviewable || decision.isPending}
                                        onClick={() => handleDecision(application, "REJECT")}
                                        aria-label={t(
                                            "adminDashboard.applications.actions.rejectAriaLabel",
                                        )}
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                        {t("adminDashboard.applications.actions.reject")}
                                    </Button>
                                    {editable && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditTarget(application)}
                                            disabled={patch.isPending}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                            {t("adminDashboard.actions.edit")}
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <AdminApplicationEditDialog
                application={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
            />
            <AdminPartnerApplicationDetailDialog
                application={detailTarget}
                open={detailTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDetailTarget(null);
                }}
            />
        </section>
    );
}
