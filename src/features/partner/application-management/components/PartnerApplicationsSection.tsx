import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { applicationName } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { usePartnerApplications } from "../api/usePartnerApplications.ts";
import { PartnerApplicationCreateDialog } from "./PartnerApplicationCreateDialog.tsx";
import { PartnerApplicationDetailDialog } from "./PartnerApplicationDetailDialog.tsx";
import {
    BUSINESS_STATE_TRANSLATION_KEY,
    businessStateVariant,
} from "../lib/partnerApplicationHelpers.ts";

export function PartnerApplicationsSection() {
    const { t } = useTranslation();
    const [creating, setCreating] = useState(false);
    const [selectedId, setSelectedId] = useState<string>();
    const { data: applications = [], isPending, isError, refetch } = usePartnerApplications();
    let applicationContent: ReactNode;
    if (isPending) {
        applicationContent = (
            <div role="status" aria-live="polite" className="grid gap-3">
                <span className="sr-only">{t("partnerApplications.loading")}</span>
                {["first", "second", "third"].map((key) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-3 border bg-surface-container-low p-4"
                    >
                        <div className="grid gap-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-9 w-28" />
                    </div>
                ))}
            </div>
        );
    } else if (isError) {
        applicationContent = (
            <div role="alert">
                {t("partnerApplications.loadError")}
                <Button onClick={() => refetch()}>{t("partnerApplications.actions.retry")}</Button>
            </div>
        );
    } else if (applications.length === 0) {
        applicationContent = (
            <p className="border bg-surface-container-low p-12 text-center text-muted-foreground">
                {t("partnerApplications.empty")}
            </p>
        );
    } else {
        applicationContent = (
            <ul className="grid gap-3">
                {applications.map((application) => (
                    <li
                        key={application.id}
                        className="flex flex-wrap items-center justify-between gap-3 border bg-surface-container-low p-4"
                    >
                        <div className="min-w-0">
                            <p className="break-all font-medium">{applicationName(application)}</p>
                            <p className="break-all font-mono text-xs text-muted-foreground">
                                {application.id}
                            </p>
                            <Badge variant={businessStateVariant(application.state)}>
                                {t(BUSINESS_STATE_TRANSLATION_KEY[application.state])}
                            </Badge>
                        </div>
                        <Button onClick={() => setSelectedId(application.id)}>
                            {t("partnerApplications.viewDetails")}
                        </Button>
                    </li>
                ))}
            </ul>
        );
    }
    return (
        <section className="grid gap-4" aria-labelledby="partner-applications-title">
            <header className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                    <H2 id="partner-applications-title">{t("partnerApplications.title")}</H2>
                    <p className="text-muted-foreground">
                        {t("partnerApplications.proposals.description")}
                    </p>
                </div>
                <Button variant="outline" onClick={() => setCreating(true)}>
                    {t("partnerApplications.create.open")}
                </Button>
            </header>
            {applicationContent}
            <PartnerApplicationCreateDialog open={creating} onOpenChange={setCreating} />
            <PartnerApplicationDetailDialog
                key={selectedId}
                applicationId={selectedId}
                open={Boolean(selectedId)}
                onOpenChange={(next) => {
                    if (!next) setSelectedId(undefined);
                }}
            />
        </section>
    );
}
