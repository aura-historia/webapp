import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type {
    AdminListingSourceDetail,
    AdminListingSourceFilters,
    AdminListingSourceSummary,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import type { ReferralConfigurationData } from "@/client";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { formatDateTime } from "@/lib/utils.ts";
import {
    useAdminListingSources,
    useAdminListingSource,
    useDeleteAdminListingSource,
} from "../api/useAdminListingSources.ts";
import { AdminListingSourceFiltersForm } from "../components/AdminListingSourceFiltersForm.tsx";
import { AdminListingSourceFormDialog } from "../components/AdminListingSourceFormDialog.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogLoadingState,
    DialogTitle,
} from "@/components/ui/dialog.tsx";

function ListingSourceRow({
    source,
    onOpen,
}: {
    readonly source: AdminListingSourceSummary;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-2">
                <div className="grid gap-1">
                    <p className="break-words font-medium">{source.name}</p>
                    <p className="break-words text-sm text-muted-foreground">
                        {t("adminListingSources.list.operator", { name: source.operator.name })}
                    </p>
                </div>
                <p className="break-all font-mono text-xs text-muted-foreground">
                    {source.listingSourceId} · {source.listingSourceSlugId}
                </p>
                <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    {source.ingestionMethods.length ? (
                        source.ingestionMethods.map((method) => (
                            <span key={method}>{t(`adminListingSources.methods.${method}`)}</span>
                        ))
                    ) : (
                        <span>{t("adminListingSources.list.noMethods")}</span>
                    )}
                    <span>
                        {t("adminListingSources.list.updated", {
                            date: formatDateTime(source.updated, i18n.language, "UTC"),
                        })}
                    </span>
                </div>
            </div>
            <Button type="button" variant="outline" onClick={onOpen}>
                {t("adminListingSources.actions.details")}
            </Button>
        </li>
    );
}

export function AdminListingSourcesPage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<AdminListingSourceFilters>({});
    const [selectedId, setSelectedId] = useState<string>();
    const [formOpen, setFormOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<AdminListingSourceDetail>();
    const [editingReferralConfiguration, setEditingReferralConfiguration] =
        useState<ReferralConfigurationData | null>();
    const listingSourcesQuery = useAdminListingSources(filters);
    const sources = listingSourcesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const total = listingSourcesQuery.data?.pages[0]?.total;
    // Referral data is only exposed on search summaries; read it from the live list cache so it
    // refreshes after mutations instead of keeping a snapshot from when the dialog was opened.
    const selectedSummary = sources.find((source) => source.listingSourceId === selectedId);

    let content: ReactNode;
    if (listingSourcesQuery.error && sources.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{listingSourcesQuery.error.message}</p>
                <Button variant="outline" onClick={() => listingSourcesQuery.refetch()}>
                    {t("adminListingSources.actions.retry")}
                </Button>
            </div>
        );
    } else if (listingSourcesQuery.isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminListingSources.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-28 w-full" />
                ))}
            </div>
        );
    } else if (sources.length === 0) {
        content = <p className="py-6 text-muted-foreground">{t("adminListingSources.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                {typeof total === "number" && (
                    <p className="text-sm text-muted-foreground">
                        {t("adminListingSources.list.total", { count: total })}
                    </p>
                )}
                <ul className="grid gap-2">
                    {sources.map((source) => (
                        <ListingSourceRow
                            key={source.listingSourceId}
                            source={source}
                            onOpen={() => setSelectedId(source.listingSourceId)}
                        />
                    ))}
                </ul>
                {listingSourcesQuery.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {listingSourcesQuery.error.message}
                    </p>
                )}
                {listingSourcesQuery.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={listingSourcesQuery.isFetchingNextPage}
                        onClick={() => listingSourcesQuery.fetchNextPage()}
                    >
                        {listingSourcesQuery.isFetchingNextPage
                            ? t("adminListingSources.list.loadingMore")
                            : t("adminListingSources.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <section className="grid gap-6" aria-labelledby="admin-listing-sources-title">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <H1 id="admin-listing-sources-title">{t("adminListingSources.title")}</H1>
                        <p className="text-muted-foreground">
                            {t("adminListingSources.description")}
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingSource(undefined);
                            setEditingReferralConfiguration(undefined);
                            setFormOpen(true);
                        }}
                    >
                        {t("adminListingSources.actions.create")}
                    </Button>
                </header>
                <AdminListingSourceFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={setFilters}
                />
                {content}
            </section>
            <AdminListingSourceDetailDialog
                listingSourceId={selectedId}
                summary={selectedSummary}
                open={Boolean(selectedId)}
                onOpenChange={(open) => {
                    if (!open) setSelectedId(undefined);
                }}
                onEdit={(source, referralConfiguration) => {
                    setEditingSource(source);
                    setEditingReferralConfiguration(referralConfiguration);
                    setFormOpen(true);
                }}
            />
            <AdminListingSourceFormDialog
                source={editingSource}
                referralConfiguration={editingReferralConfiguration}
                open={formOpen}
                onOpenChange={(open) => setFormOpen(open)}
                onCreated={setSelectedId}
                onUpdated={setSelectedId}
            />
        </div>
    );
}

function AdminListingSourceDetailDialog({
    listingSourceId: requestedListingSourceId,
    summary: requestedSummary,
    open,
    onOpenChange,
    onEdit,
}: {
    readonly listingSourceId?: string;
    readonly summary?: AdminListingSourceSummary;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onEdit: (
        source: AdminListingSourceDetail,
        referralConfiguration?: ReferralConfigurationData | null,
    ) => void;
}) {
    const { t, i18n } = useTranslation();
    const [listingSourceId, releaseListingSourceId] = useRetainedDialogValue(
        requestedListingSourceId,
        open,
    );
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const detailQuery = useAdminListingSource(listingSourceId, open);
    const deleteSource = useDeleteAdminListingSource();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const source = detailQuery.data;
    // A summary older than the detail predates a mutation, so its referral data is unknown.
    const referralConfiguration =
        source && summary && summary.updated.getTime() >= source.updated.getTime()
            ? (summary.referralConfiguration ?? null)
            : undefined;

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            setConfirmDelete(false);
            deleteSource.reset();
        }
        onOpenChange(nextOpen);
    };

    let content: ReactNode;
    if (detailQuery.error) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3">
                <p>{detailQuery.error.message}</p>
                <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
                    {t("adminListingSources.actions.retry")}
                </Button>
            </div>
        );
    } else if (detailQuery.isPending || !source) {
        content = <DialogLoadingState>{t("adminListingSources.loadingDetail")}</DialogLoadingState>;
    } else {
        content = (
            <div className="grid gap-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label={t("adminListingSources.fields.listingSourceId")}>
                        <span className="break-all font-mono text-sm">
                            {source.listingSourceId}
                        </span>
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.immutableSlug")}>
                        <span className="break-all font-mono text-sm">
                            {source.listingSourceSlugId}
                        </span>
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.name")}>
                        {source.name}
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.operator")}>
                        {source.operator.name}
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.operatorPartyId")}>
                        <span className="break-all font-mono text-sm">
                            {source.operator.partyId}
                        </span>
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.ingestionMethods")}>
                        {source.ingestionMethods.length
                            ? source.ingestionMethods
                                  .map((method) => t(`adminListingSources.methods.${method}`))
                                  .join(", ")
                            : t("adminListingSources.list.noMethods")}
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.url")}>
                        {source.presentation.url ? (
                            <a
                                className="break-all text-primary underline"
                                href={source.presentation.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {source.presentation.url}
                            </a>
                        ) : (
                            t("adminListingSources.fields.notProvided")
                        )}
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.image")}>
                        {source.presentation.image ? (
                            <a
                                className="break-all text-primary underline"
                                href={source.presentation.image}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {source.presentation.image}
                            </a>
                        ) : (
                            t("adminListingSources.fields.notProvided")
                        )}
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.referralConfiguration")}>
                        <ReferralConfigurationValue configuration={referralConfiguration} />
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.created")}>
                        <time dateTime={source.created.toISOString()}>
                            {formatDateTime(source.created, i18n.language, "UTC")}
                        </time>
                    </DetailRow>
                    <DetailRow label={t("adminListingSources.fields.updated")}>
                        <time dateTime={source.updated.toISOString()}>
                            {formatDateTime(source.updated, i18n.language, "UTC")}
                        </time>
                    </DetailRow>
                </dl>
                {deleteSource.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {deleteSource.error.message}
                    </p>
                )}
                {confirmDelete ? (
                    <div className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
                        <p className="text-sm">{t("adminListingSources.actions.confirmDelete")}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleteSource.isPending}
                                onClick={() =>
                                    deleteSource.mutate(source.listingSourceId, {
                                        onSuccess: () => {
                                            toast.success(t("adminListingSources.success.deleted"));
                                            close(false);
                                        },
                                    })
                                }
                            >
                                {deleteSource.isPending
                                    ? t("adminListingSources.actions.deleting")
                                    : t("adminListingSources.actions.confirmDeleteButton")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={deleteSource.isPending}
                                onClick={() => setConfirmDelete(false)}
                            >
                                {t("adminListingSources.actions.cancel")}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-between gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                deleteSource.reset();
                                setConfirmDelete(true);
                            }}
                        >
                            {t("adminListingSources.actions.delete")}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                close(false);
                                onEdit(source, referralConfiguration);
                            }}
                        >
                            {t("adminListingSources.actions.edit")}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent
                className="flex h-[min(90vh,40rem)] flex-col overflow-y-auto"
                onCloseAutoFocus={() => {
                    releaseListingSourceId();
                    releaseSummary();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{t("adminListingSources.detail.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminListingSources.detail.description")}
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}

function ReferralConfigurationValue({
    configuration,
}: {
    readonly configuration?: ReferralConfigurationData | null;
}) {
    const { t } = useTranslation();
    if (configuration === undefined) return t("adminListingSources.fields.referralUnavailable");
    if (configuration?.type === "PARTNERIZE") {
        return t("adminListingSources.referral.partnerizeValue", { camref: configuration.camref });
    }
    return t("adminListingSources.fields.notProvided");
}

function DetailRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words">{children}</dd>
        </div>
    );
}
