import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogLoadingState,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    applicationName,
    canWithdrawApplication,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import {
    usePartnerApplicationDetails,
    useWithdrawPartnerApplication,
} from "../api/usePartnerApplications.ts";
import {
    BUSINESS_STATE_TRANSLATION_KEY,
    businessStateVariant,
} from "../lib/partnerApplicationHelpers.ts";

export function PartnerApplicationDetailDialog({
    applicationId: requestedApplicationId,
    open,
    onOpenChange,
}: {
    readonly applicationId?: string;
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
    const proposal = application?.proposal;
    let applicationContent: ReactNode = null;
    if (error) {
        applicationContent = (
            <div role="alert">
                <p>{error.message}</p>
                <Button variant="outline" onClick={() => refetch()}>
                    {t("partnerApplications.actions.retry")}
                </Button>
            </div>
        );
    } else if (isPending) {
        applicationContent = (
            <DialogLoadingState>{t("partnerApplications.loading")}</DialogLoadingState>
        );
    }
    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent
                className="flex h-[min(90vh,44rem)] flex-col overflow-y-auto"
                onCloseAutoFocus={releaseApplicationId}
            >
                <DialogHeader>
                    <DialogTitle>{t("partnerApplications.viewDetails")}</DialogTitle>
                    <DialogDescription>
                        {t("partnerApplications.proposals.immutable")}
                    </DialogDescription>
                </DialogHeader>
                {applicationContent}
                {!error && !isPending && application && (
                    <>
                        <h3 className="font-medium">{applicationName(application)}</h3>
                        <p className="break-all font-mono text-sm">{application.id}</p>
                        <Badge variant={businessStateVariant(application.state)}>
                            {t(BUSINESS_STATE_TRANSLATION_KEY[application.state])}
                        </Badge>
                        {proposal?.type === "PROPOSED_LISTING_SOURCE" && (
                            <dl className="grid gap-3">
                                {(
                                    [
                                        ["partyName", proposal.party.name],
                                        ["partyPhone", proposal.party.phone],
                                        ["partyEmail", proposal.party.email],
                                        ["sourceName", proposal.listingSource.name],
                                        ["sourceUrl", proposal.listingSource.url],
                                        ["sourceImage", proposal.listingSource.image],
                                    ] as const
                                ).map(([key, value]) =>
                                    value ? (
                                        <div key={key}>
                                            <dt className="text-sm text-muted-foreground">
                                                {t(`partnerApplications.proposals.${key}`)}
                                            </dt>
                                            <dd className="break-all">{value}</dd>
                                        </div>
                                    ) : null,
                                )}
                                <div>
                                    <dt className="text-sm text-muted-foreground">
                                        {t("partnerApplications.proposals.methods")}
                                    </dt>
                                    <dd className="break-all">
                                        {proposal.listingSource.requestedIngestionMethods
                                            .map((method) =>
                                                t(
                                                    `partnerApplications.proposals.ingestion.${method}`,
                                                ),
                                            )
                                            .join(", ") ||
                                            t("partnerApplications.proposals.noMethods")}
                                    </dd>
                                </div>
                            </dl>
                        )}
                        {canWithdrawApplication(application) && (
                            <div className="grid gap-3">
                                {confirming ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            {t("partnerApplications.proposals.withdrawConfirm")}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                disabled={withdrawal.isPending}
                                                onClick={() =>
                                                    withdrawal.mutate(application.id, {
                                                        onSuccess: () => setConfirming(false),
                                                    })
                                                }
                                            >
                                                {t("partnerApplications.proposals.withdraw")}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={withdrawal.isPending}
                                                onClick={() => setConfirming(false)}
                                            >
                                                {t("partnerApplications.create.cancel")}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <Button variant="outline" onClick={() => setConfirming(true)}>
                                        {t("partnerApplications.proposals.withdraw")}
                                    </Button>
                                )}
                            </div>
                        )}
                        {withdrawal.error && (
                            <p role="alert" className="text-destructive">
                                {withdrawal.error.message}
                            </p>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
