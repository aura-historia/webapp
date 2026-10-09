import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    type AdminApplicationDecision,
    type AdminPartnershipApplication,
    adminApplicationName,
    canDecideApplication,
    canMarkApplicationInReview,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { formatDateTime } from "@/lib/utils.ts";
import {
    useAdminPartnershipApplication,
    useDecideAdminApplication,
    useMarkAdminApplicationInReview,
} from "../api/useAdminPartnershipApplications.ts";
import {
    ADMIN_APPLICATION_STATE_TRANSLATION_KEY,
    adminApplicationStateVariant,
    PROPOSAL_TYPE_TRANSLATION_KEY,
} from "../lib/adminApplicationPresentation.ts";
import { AdminApplicationProposal } from "./AdminApplicationProposal.tsx";

/** Timestamps come only from the search summary; the detail response omits them. */
export type AdminApplicationTimestamps = {
    readonly created?: Date;
    readonly updated?: Date;
};

function DetailRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="break-all">{children}</dd>
        </div>
    );
}

function ApplicationActions({
    application,
}: {
    readonly application: AdminPartnershipApplication;
}) {
    const { t } = useTranslation();
    const markInReview = useMarkAdminApplicationInReview();
    const decide = useDecideAdminApplication();
    const [confirming, setConfirming] = useState<AdminApplicationDecision>();
    const pending = markInReview.isPending || decide.isPending;
    const error = markInReview.error ?? decide.error;

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

    return (
        <div className="grid gap-3">
            {canMarkApplicationInReview(application) && (
                <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">
                        {t("adminApplications.actions.markInReviewHint")}
                    </p>
                    <Button
                        className="justify-self-start"
                        disabled={pending}
                        onClick={() => {
                            decide.reset();
                            markInReview.mutate(application.id, {
                                onSuccess: () =>
                                    toast.success(t("adminApplications.success.IN_REVIEW")),
                            });
                        }}
                    >
                        {t("adminApplications.actions.markInReview")}
                    </Button>
                </div>
            )}
            {canDecideApplication(application) &&
                (confirming ? (
                    <div className="grid gap-2">
                        <p className="text-sm text-muted-foreground">
                            {t(`adminApplications.actions.confirm.${confirming}`)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={confirming === "REJECT" ? "destructive" : "default"}
                                disabled={pending}
                                onClick={() => submitDecision(confirming)}
                            >
                                {t(`adminApplications.actions.${confirming}`)}
                            </Button>
                            <Button
                                variant="outline"
                                disabled={pending}
                                onClick={() => setConfirming(undefined)}
                            >
                                {t("adminApplications.actions.cancel")}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <Button disabled={pending} onClick={() => setConfirming("APPROVE")}>
                            {t("adminApplications.actions.APPROVE")}
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={pending}
                            onClick={() => setConfirming("REJECT")}
                        >
                            {t("adminApplications.actions.REJECT")}
                        </Button>
                    </div>
                ))}
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error.message}
                </p>
            )}
        </div>
    );
}

export function AdminApplicationDetailDialog({
    applicationId,
    timestamps,
    open,
    onOpenChange,
}: {
    readonly applicationId?: string;
    readonly timestamps?: AdminApplicationTimestamps;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t, i18n } = useTranslation();
    const {
        data: application,
        isPending,
        error,
        refetch,
    } = useAdminPartnershipApplication(applicationId, open);

    let content: ReactNode;
    if (error) {
        content = (
            <div role="alert" className="grid gap-3">
                <p>{error.message}</p>
                <Button variant="outline" className="justify-self-start" onClick={() => refetch()}>
                    {t("adminApplications.retry")}
                </Button>
            </div>
        );
    } else if (isPending || !application) {
        content = <output>{t("adminApplications.loadingDetail")}</output>;
    } else {
        content = (
            <div className="grid gap-5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-all font-medium">{adminApplicationName(application)}</h3>
                    <Badge variant={adminApplicationStateVariant(application.state)}>
                        {t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[application.state])}
                    </Badge>
                    <Badge variant="outline">
                        {t(PROPOSAL_TYPE_TRANSLATION_KEY[application.proposal.type])}
                    </Badge>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label={t("adminApplications.fields.id")}>
                        <span className="font-mono text-sm">{application.id}</span>
                    </DetailRow>
                    <DetailRow label={t("adminApplications.fields.applicantUserId")}>
                        <span className="font-mono text-sm">{application.applicantUserId}</span>
                    </DetailRow>
                    {timestamps?.created && (
                        <DetailRow label={t("adminApplications.fields.created")}>
                            {formatDateTime(timestamps.created, i18n.language)}
                        </DetailRow>
                    )}
                    {timestamps?.updated && (
                        <DetailRow label={t("adminApplications.fields.updated")}>
                            {formatDateTime(timestamps.updated, i18n.language)}
                        </DetailRow>
                    )}
                    {application.approvedPartnershipId && (
                        <DetailRow label={t("adminApplications.fields.approvedPartnershipId")}>
                            <span className="font-mono text-sm">
                                {application.approvedPartnershipId}
                            </span>
                        </DetailRow>
                    )}
                    {application.approvedListingSourceId && (
                        <DetailRow label={t("adminApplications.fields.approvedListingSourceId")}>
                            <span className="block font-mono text-sm">
                                {application.approvedListingSourceId}
                            </span>
                            <Link
                                to="/$lng/admin/listing-sources"
                                params={true}
                                from="/$lng"
                                className="text-sm text-primary underline-offset-4 hover:underline"
                            >
                                {t("adminApplications.links.listingSources")}
                            </Link>
                        </DetailRow>
                    )}
                </dl>
                <section className="grid gap-2" aria-labelledby="admin-application-proposal">
                    <h4 id="admin-application-proposal" className="text-sm font-medium">
                        {t("adminApplications.proposal.title")}
                    </h4>
                    <AdminApplicationProposal proposal={application.proposal} />
                </section>
                <ApplicationActions application={application} />
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("adminApplications.detail.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminApplications.detail.description")}
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
