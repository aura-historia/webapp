import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    type AdminApplicationDecision,
    type AdminPartnershipApplication,
    type AdminPartnershipApplicationSummary,
    adminApplicationName,
    canDecideApplication,
    canMarkApplicationInReview,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import { AdminStatusMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    PRIMARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { formatAdminTimestamp } from "@/features/admin/party-management/lib/adminDates.ts";
import {
    AdminConflictNotice,
    AdminErrorLine,
} from "@/features/admin/partnership-management/components/AdminConflictNotice.tsx";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    AdminApplicationRequestError,
    useAdminPartnershipApplication,
    useDecideAdminApplication,
    useMarkAdminApplicationInReview,
} from "../api/useAdminPartnershipApplications.ts";
import {
    ADMIN_APPLICATION_STATE_TONE,
    ADMIN_APPLICATION_STATE_TRANSLATION_KEY,
} from "../lib/adminApplicationPresentation.ts";
import { AdminApplicationProposal } from "./AdminApplicationProposal.tsx";

/**
 * The review dialog (board "Admin · Application"). Timestamps come only from the list row that
 * opened it; the detail response has none. Proposals are read-only.
 */
export function AdminApplicationDetailDialog({
    applicationId: requestedId,
    summary: requestedSummary,
    onClose,
}: {
    readonly applicationId?: string;
    readonly summary?: AdminPartnershipApplicationSummary;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    const open = Boolean(requestedId);
    const [applicationId, releaseId] = useRetainedDialogValue(requestedId, open);
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const {
        data: application,
        isPending,
        error,
        refetch,
    } = useAdminPartnershipApplication(applicationId, open);
    const shown = application ?? summary;
    const existing = shown?.proposal.type === "EXISTING_LISTING_SOURCE";

    let content: ReactNode;
    if (application) {
        content = <ApplicationBody application={application} summary={summary} />;
    } else if (error) {
        content = (
            <div className="flex flex-wrap items-center justify-between gap-3.5">
                <AdminErrorLine message={error.message} className="text-sm" />
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    } else if (isPending) {
        content = (
            <div aria-busy="true" className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                    {[0, 1, 2, 3].map((index) => (
                        <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")} />
                    ))}
                </div>
                <output className="block text-meta text-ink-secondary">
                    {t("adminApplications.loadingDetail")}
                </output>
            </div>
        );
    }

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
            onCloseAutoFocus={() => {
                releaseId();
                releaseSummary();
            }}
            eyebrow={
                shown
                    ? t(`adminApplications.detail.eyebrow.${shown.proposal.type}`)
                    : t("adminApplications.detail.fallbackTitle")
            }
            title={
                shown ? (
                    <span className={cn(existing && "font-mono text-xl break-all sm:text-2xl")}>
                        {adminApplicationName(shown)}
                    </span>
                ) : (
                    t("adminApplications.detail.fallbackTitle")
                )
            }
            subtitle={
                shown ? (
                    <AdminStatusMark
                        tone={ADMIN_APPLICATION_STATE_TONE[shown.state]}
                        label={t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[shown.state])}
                        className="text-ink"
                    />
                ) : undefined
            }
        >
            {content}
        </AdminRecordDialog>
    );
}

function ApplicationBody({
    application,
    summary,
}: {
    readonly application: AdminPartnershipApplication;
    readonly summary?: AdminPartnershipApplicationSummary;
}) {
    const { t, i18n } = useTranslation();
    const timestamps = summary?.id === application.id ? summary : undefined;
    const facts = [
        { key: "id", label: t("adminApplications.fields.id"), value: application.id, mono: true },
        {
            key: "applicant",
            label: t("adminApplications.fields.applicantUserId"),
            value: application.applicantUserId,
            mono: true,
        },
        ...(timestamps
            ? [
                  {
                      key: "created",
                      label: t("adminApplications.fields.created"),
                      value: formatAdminTimestamp(timestamps.created, i18n.language),
                  },
                  {
                      key: "updated",
                      label: t("adminApplications.fields.updated"),
                      value: formatAdminTimestamp(timestamps.updated, i18n.language),
                  },
              ]
            : []),
        ...(application.approvedPartnershipId
            ? [
                  {
                      key: "partnership",
                      label: t("adminApplications.fields.approvedPartnershipId"),
                      value: application.approvedPartnershipId,
                      mono: true,
                  },
              ]
            : []),
        ...(application.approvedListingSourceId
            ? [
                  {
                      key: "source",
                      label: t("adminApplications.fields.approvedListingSourceId"),
                      value: application.approvedListingSourceId,
                      mono: true,
                  },
              ]
            : []),
    ];

    return (
        <>
            <AdminFacts facts={facts} />
            <section aria-labelledby="admin-application-proposal" className="flex flex-col gap-3">
                <h3
                    id="admin-application-proposal"
                    className={cn(ADMIN_SECTION_TITLE_CLASS, "text-[22px]")}
                >
                    {t("adminApplications.proposal.title")}
                </h3>
                <AdminApplicationProposal proposal={application.proposal} />
            </section>
            <DecisionBlock key={application.id} application={application} />
        </>
    );
}

function DecisionBlock({ application }: { readonly application: AdminPartnershipApplication }) {
    const { t } = useTranslation();
    const markInReview = useMarkAdminApplicationInReview();
    const decide = useDecideAdminApplication();
    const [confirming, setConfirming] = useState<AdminApplicationDecision>();
    const [returnFocus, setReturnFocus] = useState<AdminApplicationDecision>();
    const approveButton = useRef<HTMLButtonElement>(null);
    const rejectButton = useRef<HTMLButtonElement>(null);
    const pending = markInReview.isPending || decide.isPending;
    const error = markInReview.error ?? decide.error;
    const approved = application.state === "APPROVED";

    useEffect(() => {
        if (confirming || !returnFocus) return;
        (returnFocus === "APPROVE" ? approveButton : rejectButton).current?.focus();
        setReturnFocus(undefined);
    }, [confirming, returnFocus]);

    const startReview = () => {
        decide.reset();
        markInReview.mutate(application.id, {
            onSuccess: () => toast.success(t("adminApplications.success.IN_REVIEW")),
        });
    };
    const submitDecision = (decision: AdminApplicationDecision) => {
        markInReview.reset();
        decide.mutate(
            { id: application.id, decision },
            {
                onSuccess: () => {
                    setConfirming(undefined);
                    toast.success(t(`adminApplications.success.${decision}`));
                },
                onError: () => setConfirming(undefined),
            },
        );
    };
    const ask = (decision: AdminApplicationDecision) => {
        markInReview.reset();
        decide.reset();
        setConfirming(decision);
    };

    const canReview = canMarkApplicationInReview(application);
    const canDecide = canDecideApplication(application);
    const hasLinks =
        approved && (application.approvedPartnershipId || application.approvedListingSourceId);
    if (!canReview && !canDecide && !hasLinks && !error) return null;

    return (
        <section
            aria-label={t("adminApplications.decision.label")}
            className="flex flex-col gap-3.5 border-t border-line pt-5"
        >
            {canReview && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={pending}
                        onClick={startReview}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {t("adminApplications.actions.markInReview")}
                    </button>
                </div>
            )}
            {canDecide &&
                (confirming ? (
                    <AdminInlineConfirm
                        message={t(
                            confirming === "APPROVE"
                                ? "adminApplications.actions.confirmApprove"
                                : "adminApplications.actions.confirmReject",
                        )}
                        confirmLabel={t(`adminApplications.actions.${confirming}`)}
                        tone={confirming === "APPROVE" ? "primary" : "danger"}
                        pending={decide.isPending}
                        onConfirm={() => submitDecision(confirming)}
                        onCancel={() => {
                            setReturnFocus(confirming);
                            setConfirming(undefined);
                        }}
                    />
                ) : (
                    <div className="flex flex-wrap justify-end gap-2.5">
                        <button
                            ref={rejectButton}
                            type="button"
                            disabled={pending}
                            onClick={() => ask("REJECT")}
                            className={ADMIN_DANGER_OUTLINE_CLASS}
                        >
                            {t("adminApplications.actions.REJECT")}
                        </button>
                        <button
                            ref={approveButton}
                            type="button"
                            disabled={pending}
                            onClick={() => ask("APPROVE")}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {t("adminApplications.actions.APPROVE")}
                        </button>
                    </div>
                ))}
            {hasLinks && (
                <div className="flex flex-wrap gap-4">
                    {application.approvedPartnershipId && (
                        <Link
                            to="/$lng/admin/partnerships"
                            from="/$lng"
                            params={true}
                            search={{ partnership: application.approvedPartnershipId }}
                            className={TEXT_LINK_CLASS}
                        >
                            {t("adminApplications.links.partnership")}
                        </Link>
                    )}
                    {application.approvedListingSourceId && (
                        <Link
                            to="/$lng/admin/listing-sources"
                            from="/$lng"
                            params={true}
                            search={{ source: application.approvedListingSourceId }}
                            className={TEXT_LINK_CLASS}
                        >
                            {t("adminApplications.links.listingSource")}
                        </Link>
                    )}
                </div>
            )}
            {error &&
                (error instanceof AdminApplicationRequestError && error.status === 409 ? (
                    <AdminConflictNotice message={error.message} />
                ) : (
                    <AdminErrorLine message={error.message} />
                ))}
        </section>
    );
}
