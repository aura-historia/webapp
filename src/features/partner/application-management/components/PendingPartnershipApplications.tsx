import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import {
    applicationName,
    canWithdrawApplication,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { usePartnerApplications } from "../api/usePartnerApplications.ts";
import { BUSINESS_STATE_TRANSLATION_KEY } from "../lib/partnerApplicationHelpers.ts";

export function PendingPartnershipApplications({ enabled }: { readonly enabled: boolean }) {
    const { t } = useTranslation();
    const { data: applications = [], isError, refetch } = usePartnerApplications(enabled);
    if (!enabled) return null;
    if (isError)
        return (
            <div role="alert">
                <p>{t("partnerApplications.loadError")}</p>
                <Button variant="outline" onClick={() => refetch()}>
                    {t("partnerApplications.actions.retry")}
                </Button>
            </div>
        );
    const pending = applications.filter(canWithdrawApplication);
    if (pending.length === 0) return null;
    return (
        <div className="grid gap-3 border border-border bg-background p-4">
            <p className="font-medium">{t("partnerApplications.title")}</p>
            <ul className="grid gap-2">
                {pending.map((application) => (
                    <li
                        key={application.id}
                        className="flex flex-wrap justify-between gap-2 border border-dashed p-3"
                    >
                        <Link
                            to="/$lng/partners/applications"
                            params={true}
                            from="/$lng"
                            className="break-all underline"
                        >
                            {applicationName(application)}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                            {t(BUSINESS_STATE_TRANSLATION_KEY[application.state])}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="text-sm text-muted-foreground">
                {t("partnerApplications.proposals.selectionHint")}
            </p>
        </div>
    );
}
