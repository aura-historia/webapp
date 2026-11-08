import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    canWithdrawApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import {
    DANGER_OUTLINE_PILL_CLASS,
    DANGER_PILL_CLASS,
    DIALOG_CONTENT_CLASS,
    DIALOG_TITLE_CLASS,
    INLINE_ALERT_CLASS,
    MONO_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    usePartnerApplicationDetails,
    useWithdrawPartnerApplication,
} from "../api/usePartnerApplications.ts";
import { BUSINESS_STATE_NOTE_KEY } from "../lib/partnerApplicationHelpers.ts";
import {
    ApplicationStatus,
    ApplicationTile,
    useApplicationLabels,
} from "./PartnerApplicationRow.tsx";

export function PartnerApplicationDetailDialog({
    applicationId: requestedApplicationId,
    providerNames,
    open,
    onOpenChange,
}: {
    readonly applicationId?: string;
    readonly providerNames?: ReadonlyMap<string, string>;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [applicationId, releaseApplicationId] = useRetainedDialogValue(
        requestedApplicationId,
        open,
    );
    const {
        data: application,
        isPending,
        error,
        refetch,
    } = usePartnerApplicationDetails(applicationId, open);
    const withdrawal = useWithdrawPartnerApplication();
    const [confirming, setConfirming] = useState(false);
    const changeOpen = (next: boolean) => {
        if (withdrawal.isPending) return;
        setConfirming(false);
        withdrawal.reset();
        onOpenChange(next);
    };

    let body: ReactNode;
    if (error) {
        body = (
            <div className="flex flex-col gap-5 p-7">
                <DialogTitle className={DIALOG_TITLE_CLASS}>
                    {t("partnerApplications.viewDetails")}
                </DialogTitle>
                <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md p-3.5 text-body-sm text-oxblood shadow-ring"
                >
                    {error.message}
                    <button
                        type="button"
                        className={SMALL_SECONDARY_PILL_CLASS}
                        onClick={() => refetch()}
                    >
                        {t("partnerDashboard.tryAgain")}
                    </button>
                </div>
            </div>
        );
    } else if (isPending || !application) {
        body = (
            <div className="flex flex-col gap-5 p-7">
                <DialogTitle className={DIALOG_TITLE_CLASS}>
                    {t("partnerApplications.viewDetails")}
                </DialogTitle>
                <output className="flex min-h-13 items-center gap-2 rounded-md px-3.5 text-body-sm text-ink-secondary shadow-ring">
                    <Spinner aria-hidden="true" />
                    {t("partnerApplications.loadingDetails")}
                </output>
            </div>
        );
    } else {
        body = (
            <ApplicationDetails
                application={application}
                providerNames={providerNames}
                confirming={confirming}
                onConfirmingChange={setConfirming}
                withdrawPending={withdrawal.isPending}
                withdrawError={withdrawal.error?.message}
                onWithdraw={() =>
                    withdrawal.mutate(application.id, {
                        onSuccess: () => {
                            setConfirming(false);
                            toast.success(t("partnerApplications.withdrawSuccess"));
                        },
                    })
                }
                onClose={() => changeOpen(false)}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent
                className={cn(
                    DIALOG_CONTENT_CLASS,
                    "max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[600px]",
                )}
                closeLabel={t("partnerDashboard.close")}
                showCloseButton={!withdrawal.isPending}
                onCloseAutoFocus={releaseApplicationId}
            >
                {body}
            </DialogContent>
        </Dialog>
    );
}

function ApplicationDetails({
    application,
    providerNames,
    confirming,
    onConfirmingChange,
    withdrawPending,
    withdrawError,
    onWithdraw,
    onClose,
}: {
    readonly application: PartnerApplication;
    readonly providerNames?: ReadonlyMap<string, string>;
    readonly confirming: boolean;
    readonly onConfirmingChange: (confirming: boolean) => void;
    readonly withdrawPending: boolean;
    readonly withdrawError?: string;
    readonly onWithdraw: () => void;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    const labels = useApplicationLabels(application, providerNames);
    const proposal = application.proposal;
    const facts: { key: string; label: string; value?: string; mono?: boolean }[] =
        proposal.type === "PROPOSED_LISTING_SOURCE"
            ? [
                  {
                      key: "url",
                      label: t("partnerApplications.details.website"),
                      value: proposal.listingSource.url,
                  },
                  {
                      key: "image",
                      label: t("partnerApplications.details.image"),
                      value: proposal.listingSource.image,
                  },
                  {
                      key: "party",
                      label: t("partnerApplications.details.operator"),
                      value: proposal.party.name,
                  },
                  {
                      key: "phone",
                      label: t("partnerApplications.details.phone"),
                      value: proposal.party.phone,
                  },
                  {
                      key: "email",
                      label: t("partnerApplications.details.email"),
                      value: proposal.party.email,
                  },
                  {
                      key: "methods",
                      label: t("partnerApplications.details.connections"),
                      value:
                          proposal.listingSource.requestedIngestionMethods
                              .map((method) =>
                                  t(`partnerApplications.proposals.ingestion.${method}`),
                              )
                              .join(", ") || t("partnerApplications.proposals.noMethods"),
                  },
                  {
                      key: "id",
                      label: t("partnerApplications.details.applicationId"),
                      value: application.id,
                      mono: true,
                  },
              ]
            : [
                  {
                      key: "source",
                      label: t("partnerApplications.details.providerId"),
                      value: proposal.listingSourceId,
                      mono: true,
                  },
                  {
                      key: "id",
                      label: t("partnerApplications.details.applicationId"),
                      value: application.id,
                      mono: true,
                  },
              ];
    const canWithdraw = canWithdrawApplication(application);

    return (
        <>
            <div className="flex items-start gap-4 border-b border-line-subtle p-7 pr-14">
                <ApplicationTile
                    initial={labels.initial}
                    image={labels.image}
                    className="size-16 text-[28px]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] break-all text-ink-muted uppercase">
                        {labels.meta}
                    </span>
                    <DialogTitle className={cn(DIALOG_TITLE_CLASS, "text-[28px] break-words")}>
                        {labels.title}
                    </DialogTitle>
                    <ApplicationStatus state={application.state} />
                    <DialogDescription className="text-body-sm text-ink-secondary">
                        {t(BUSINESS_STATE_NOTE_KEY[application.state])}
                    </DialogDescription>
                </div>
            </div>
            <dl className="px-7 pt-2 pb-1">
                {facts.map((fact) => (
                    <div
                        key={fact.key}
                        className="grid gap-1 border-b border-line-subtle py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4"
                    >
                        <dt className={cn(MONO_LABEL_CLASS, "pt-[3px]")}>{fact.label}</dt>
                        <dd
                            className={cn(
                                "text-body-sm break-words [overflow-wrap:anywhere]",
                                fact.mono && "font-mono text-meta",
                                fact.value ? "text-ink" : "text-ink-muted",
                            )}
                        >
                            {fact.value || "—"}
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="flex flex-col gap-3.5 px-7 pt-5 pb-6">
                {withdrawError && (
                    <p role="alert" className={INLINE_ALERT_CLASS}>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-oxblood"
                            strokeWidth={2}
                        />
                        {withdrawError}
                    </p>
                )}
                {confirming ? (
                    <div
                        role="group"
                        aria-labelledby="withdraw-confirm-title"
                        className="flex flex-col gap-3.5 rounded-md bg-surface p-4 shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                    >
                        <div className="flex flex-col gap-1">
                            <p id="withdraw-confirm-title" className="text-[15px] font-medium">
                                {t("partnerApplications.withdrawConfirm.title")}
                            </p>
                            <p className="text-meta text-ink-secondary">
                                {t("partnerApplications.withdrawConfirm.description")}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2.5">
                            <button
                                type="button"
                                className={SECONDARY_PILL_CLASS}
                                disabled={withdrawPending}
                                onClick={() => onConfirmingChange(false)}
                            >
                                {t("partnerApplications.withdrawConfirm.keep")}
                            </button>
                            <button
                                type="button"
                                className={DANGER_PILL_CLASS}
                                disabled={withdrawPending}
                                onClick={onWithdraw}
                            >
                                {withdrawPending && <Spinner aria-hidden="true" />}
                                {t("partnerApplications.withdrawConfirm.confirm")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {canWithdraw && (
                            <button
                                type="button"
                                className={DANGER_OUTLINE_PILL_CLASS}
                                aria-expanded={false}
                                onClick={() => onConfirmingChange(true)}
                            >
                                {t("partnerApplications.proposals.withdraw")}
                            </button>
                        )}
                        {application.state === "APPROVED" && (
                            <Link
                                to="/$lng/partners/listing-sources"
                                params={true}
                                from="/$lng"
                                className={TEXT_LINK_CLASS}
                            >
                                {t("partnerApplications.viewProviders")}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-[13px]"
                                    strokeWidth={1.8}
                                />
                            </Link>
                        )}
                        <button
                            type="button"
                            className={cn(PRIMARY_PILL_CLASS, "ml-auto")}
                            onClick={onClose}
                        >
                            {t("partnerDashboard.close")}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
