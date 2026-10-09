import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type {
    AdminPartnershipFilters,
    AdminPartnershipSummary,
} from "@/data/internal/partnership/AdminPartnership.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminPartnerships } from "../api/useAdminPartnerships.ts";
import { AdminPartnershipFiltersForm } from "../components/AdminPartnershipFiltersForm.tsx";
import { AdminPartnershipDetailDialog } from "../components/AdminPartnershipDetailDialog.tsx";

function PartnershipRow({
    partnership,
    onOpen,
}: {
    readonly partnership: AdminPartnershipSummary;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();

    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-3">
                <div className="grid gap-1">
                    <p className="break-words font-medium">{partnership.party.name}</p>
                    <p className="break-all font-mono text-xs text-muted-foreground">
                        {partnership.party.partyId} · {partnership.party.partySlugId}
                    </p>
                    <p className="break-all font-mono text-xs text-muted-foreground">
                        {partnership.partnershipId}
                    </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                        {t("adminPartnerships.list.members", { count: partnership.memberCount })}
                    </span>
                    <span>
                        {t("adminPartnerships.list.listingSources", {
                            count: partnership.listingSourceGrantCount,
                        })}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t("adminPartnerships.fields.created")}:{" "}
                        {formatDateTime(partnership.created, i18n.language, "UTC")}
                    </span>
                    <span>
                        {t("adminPartnerships.fields.updated")}:{" "}
                        {formatDateTime(partnership.updated, i18n.language, "UTC")}
                    </span>
                </div>
            </div>
            <Button type="button" variant="outline" onClick={onOpen}>
                {t("adminPartnerships.actions.details")}
            </Button>
        </li>
    );
}

export function AdminPartnershipsPage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<AdminPartnershipFilters>({});
    const [selectedPartnershipId, setSelectedPartnershipId] = useState<string>();
    const partnershipsQuery = useAdminPartnerships(filters);
    const partnerships = partnershipsQuery.data?.pages.flatMap((page) => page.items) ?? [];

    let content: ReactNode;
    if (partnershipsQuery.error && partnerships.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{partnershipsQuery.error.message}</p>
                <Button variant="outline" onClick={() => partnershipsQuery.refetch()}>
                    {t("adminPartnerships.actions.retry")}
                </Button>
            </div>
        );
    } else if (partnershipsQuery.isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminPartnerships.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-32 w-full" />
                ))}
            </div>
        );
    } else if (partnerships.length === 0) {
        content = <p className="py-6 text-muted-foreground">{t("adminPartnerships.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                    {t("adminPartnerships.list.loaded", { count: partnerships.length })}
                </p>
                <ul className="grid gap-2">
                    {partnerships.map((partnership) => (
                        <PartnershipRow
                            key={partnership.partnershipId}
                            partnership={partnership}
                            onOpen={() => setSelectedPartnershipId(partnership.partnershipId)}
                        />
                    ))}
                </ul>
                {partnershipsQuery.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {partnershipsQuery.error.message}
                    </p>
                )}
                {partnershipsQuery.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={partnershipsQuery.isFetchingNextPage}
                        onClick={() => partnershipsQuery.fetchNextPage()}
                    >
                        {partnershipsQuery.isFetchingNextPage
                            ? t("adminPartnerships.list.loadingMore")
                            : t("adminPartnerships.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <section className="grid gap-6" aria-labelledby="admin-partnerships-title">
                <header className="grid gap-1">
                    <H1 id="admin-partnerships-title">{t("adminPartnerships.title")}</H1>
                    <p className="text-muted-foreground">{t("adminPartnerships.description")}</p>
                </header>
                <AdminPartnershipFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={setFilters}
                />
                {content}
            </section>
            {selectedPartnershipId && (
                <AdminPartnershipDetailDialog
                    key={selectedPartnershipId}
                    partnershipId={selectedPartnershipId}
                    open
                    onOpenChange={(open) => {
                        if (!open) setSelectedPartnershipId(undefined);
                    }}
                    onDissolved={() => setSelectedPartnershipId(undefined)}
                />
            )}
        </div>
    );
}
