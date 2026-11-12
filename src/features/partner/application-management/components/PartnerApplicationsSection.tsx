import { Link } from "@tanstack/react-router";
import { FileText, Info, Plus } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    canWithdrawApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";
import { useProviderNames } from "@/features/partner/common/api/useProviderNames.ts";
import { PartnerPageHeader } from "@/features/partner/common/components/PartnerPageHeader.tsx";
import {
    PartnerListHeading,
    PartnerStatePanel,
} from "@/features/partner/common/components/PartnerStatePanel.tsx";
import {
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { useApplicationListingSourceBySlug } from "../api/useApplicationListingSourceBySlug.ts";
import { usePartnerApplications } from "../api/usePartnerApplications.ts";
import { PartnerApplicationCreateDialog } from "./PartnerApplicationCreateDialog.tsx";
import { PartnerApplicationDetailDialog } from "./PartnerApplicationDetailDialog.tsx";
import { PartnerApplicationRow } from "./PartnerApplicationRow.tsx";

const SKELETON_IDS = ["first", "second", "third"] as const;

export function PartnerApplicationsSection({
    createOpen: createOpenProp,
    onCreateOpenChange,
    createProviderSlug,
}: {
    /** Opens the new application dialog, e.g. from a link on the overview. */
    readonly createOpen?: boolean;
    /** A listed provider's public slug to choose in the dialog, e.g. from its provider page. */
    readonly createProviderSlug?: string;
    readonly onCreateOpenChange?: (open: boolean) => void;
} = {}) {
    const { t } = useTranslation();
    const [createOpenState, setCreateOpenState] = useState(false);
    const createOpen = createOpenProp ?? createOpenState;
    const setCreateOpen = (open: boolean) => {
        setCreateOpenState(open);
        onCreateOpenChange?.(open);
    };
    const [selectedId, setSelectedId] = useState<string>();
    const { data: createProvider } = useApplicationListingSourceBySlug(createProviderSlug);
    const { data: applications = [], isPending, isError, refetch } = usePartnerApplications();
    const { isAuthenticated } = useResolvedAuth();
    const { sources } = useOwnListingSources(isAuthenticated);
    const providerNames = useProviderNames(sources);

    const newApplicationButton = (
        <button type="button" className={PRIMARY_PILL_CLASS} onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("partnerApplications.create.open")}
        </button>
    );

    let content: ReactNode;
    if (isPending) {
        content = <ApplicationRowsSkeleton />;
    } else if (isError) {
        content = (
            <PartnerStatePanel
                tone="error"
                titleKey="partnerApplications.loadErrorHeading"
                description={t("partnerApplications.loadErrorDescription")}
            >
                <button type="button" className={SECONDARY_PILL_CLASS} onClick={() => refetch()}>
                    {t("partnerDashboard.tryAgain")}
                </button>
            </PartnerStatePanel>
        );
    } else if (applications.length === 0) {
        content = (
            <PartnerStatePanel
                tone="empty"
                icon={FileText}
                titleKey="partnerApplications.emptyHeading"
                description={t("partnerApplications.emptyDescription")}
            >
                {newApplicationButton}
                <Link
                    to="/$lng/partner-program"
                    params={true}
                    from="/$lng"
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("partnerApplications.howItWorks")}
                </Link>
            </PartnerStatePanel>
        );
    } else {
        const open = applications.filter(canWithdrawApplication);
        const decided = applications.filter((application) => !canWithdrawApplication(application));
        content = (
            <>
                {open.length > 0 && (
                    <ApplicationGroup
                        id="partner-applications-open"
                        title={t("partnerApplications.groups.open")}
                        count={t("partnerApplications.groups.openCount", { count: open.length })}
                        applications={open}
                        providerNames={providerNames}
                        onOpen={setSelectedId}
                    />
                )}
                {decided.length > 0 && (
                    <ApplicationGroup
                        id="partner-applications-decided"
                        title={t("partnerApplications.groups.decided")}
                        count={t("partnerApplications.groups.decidedCount", {
                            count: decided.length,
                        })}
                        applications={decided}
                        providerNames={providerNames}
                        onOpen={setSelectedId}
                    />
                )}
                <p className="flex max-w-[640px] items-start gap-3 text-meta text-ink-muted">
                    <Info
                        aria-hidden="true"
                        className="mt-0.5 size-[15px] shrink-0"
                        strokeWidth={1.8}
                    />
                    {t("partnerApplications.proposals.selectionHint")}
                </p>
            </>
        );
    }

    return (
        <>
            <PartnerPageHeader
                titleKey="partnerApplications.heading"
                lead={t("partnerApplications.lead")}
                action={newApplicationButton}
            />
            {content}
            <PartnerApplicationCreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                initialSource={createProvider ?? undefined}
            />
            <PartnerApplicationDetailDialog
                applicationId={selectedId}
                providerNames={providerNames}
                open={Boolean(selectedId)}
                onOpenChange={(next) => {
                    if (!next) setSelectedId(undefined);
                }}
            />
        </>
    );
}

function ApplicationGroup({
    id,
    title,
    count,
    applications,
    providerNames,
    onOpen,
}: {
    readonly id: string;
    readonly title: string;
    readonly count: string;
    readonly applications: readonly PartnerApplication[];
    readonly providerNames: ReadonlyMap<string, string>;
    readonly onOpen: (id: string) => void;
}) {
    return (
        <section aria-labelledby={id} className="flex flex-col gap-4">
            <PartnerListHeading id={id} title={title} count={count} />
            <ul className="border-t border-line">
                {applications.map((application) => (
                    <li key={application.id}>
                        <PartnerApplicationRow
                            application={application}
                            providerNames={providerNames}
                            onOpen={() => onOpen(application.id)}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** Loading rows matching the application row: tile, two text bars and the status. */
export function ApplicationRowsSkeleton({ count = 3 }: { readonly count?: number }) {
    const { t } = useTranslation();
    return (
        <output aria-busy="true" className="block">
            <span className="sr-only">{t("partnerApplications.loading")}</span>
            <ul className="border-t border-line">
                {SKELETON_IDS.slice(0, count).map((id) => (
                    <li
                        key={id}
                        className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3.5 border-b border-line-subtle py-4 sm:grid-cols-[52px_minmax(0,1fr)_120px] sm:gap-5 sm:px-2 sm:py-[18px]"
                    >
                        <span className="size-11 animate-pulse rounded-thumb bg-image-ground motion-reduce:animate-none sm:size-[52px]" />
                        <span className="flex flex-col gap-2">
                            <span className="h-4 w-[45%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                            <span className="h-2.5 w-[30%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                        </span>
                        <span className="hidden h-2.5 animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none sm:block" />
                    </li>
                ))}
            </ul>
        </output>
    );
}
