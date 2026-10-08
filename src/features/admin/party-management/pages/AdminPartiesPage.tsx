import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { AdminPartyFilters, Party } from "@/data/internal/party/Party.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminParties } from "../api/useAdminParties.ts";
import { AdminPartyDetailDialog } from "../components/AdminPartyDetailDialog.tsx";
import { AdminPartyFiltersForm } from "../components/AdminPartyFiltersForm.tsx";
import { AdminPartyFormDialog } from "../components/AdminPartyFormDialog.tsx";

function PartyRow({ party, onOpen }: { readonly party: Party; readonly onOpen: () => void }) {
    const { t, i18n } = useTranslation();
    return (
        <li className="flex flex-wrap items-center justify-between gap-3 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-1">
                <p className="break-words font-medium">{party.name}</p>
                <p className="break-all text-sm text-muted-foreground">
                    {party.contact.phone ?? t("adminParties.fields.notProvided")}
                    {party.contact.email && ` · ${party.contact.email}`}
                </p>
                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span className="break-all font-mono">{party.partyId}</span>
                    <span>
                        {t("adminParties.list.created", {
                            date: formatDateTime(party.created, i18n.language, "UTC"),
                        })}
                    </span>
                    <span>
                        {t("adminParties.list.updated", {
                            date: formatDateTime(party.updated, i18n.language, "UTC"),
                        })}
                    </span>
                </p>
            </div>
            <Button type="button" variant="outline" onClick={onOpen}>
                {t("adminParties.actions.details")}
            </Button>
        </li>
    );
}

export function AdminPartiesPage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<AdminPartyFilters>({});
    const [selectedId, setSelectedId] = useState<string>();
    const [formOpen, setFormOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party>();
    const partiesQuery = useAdminParties(filters);
    const parties = partiesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const total = partiesQuery.data?.pages[0]?.total;

    let content: ReactNode;
    if (partiesQuery.error && parties.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{partiesQuery.error.message}</p>
                <Button variant="outline" onClick={() => partiesQuery.refetch()}>
                    {t("adminParties.actions.retry")}
                </Button>
            </div>
        );
    } else if (partiesQuery.isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminParties.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        );
    } else if (parties.length === 0) {
        content = <p className="py-6 text-muted-foreground">{t("adminParties.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                {typeof total === "number" && (
                    <p className="text-sm text-muted-foreground">
                        {t("adminParties.list.total", { count: total })}
                    </p>
                )}
                <ul className="grid gap-2">
                    {parties.map((party) => (
                        <PartyRow
                            key={party.partyId}
                            party={party}
                            onOpen={() => setSelectedId(party.partyId)}
                        />
                    ))}
                </ul>
                {partiesQuery.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {partiesQuery.error.message}
                    </p>
                )}
                {partiesQuery.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={partiesQuery.isFetchingNextPage}
                        onClick={() => partiesQuery.fetchNextPage()}
                    >
                        {partiesQuery.isFetchingNextPage
                            ? t("adminParties.list.loadingMore")
                            : t("adminParties.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <section className="grid gap-6" aria-labelledby="admin-parties-title">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <H1 id="admin-parties-title">{t("adminParties.title")}</H1>
                        <p className="text-muted-foreground">{t("adminParties.description")}</p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingParty(undefined);
                            setFormOpen(true);
                        }}
                    >
                        {t("adminParties.actions.create")}
                    </Button>
                </header>
                <AdminPartyFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={setFilters}
                />
                {content}
            </section>
            <AdminPartyDetailDialog
                partyId={selectedId}
                open={Boolean(selectedId)}
                onOpenChange={(open) => {
                    if (!open) setSelectedId(undefined);
                }}
                onEdit={(party) => {
                    setEditingParty(party);
                    setFormOpen(true);
                }}
            />
            <AdminPartyFormDialog
                key={
                    editingParty
                        ? `${editingParty.partyId}:${editingParty.updated.toISOString()}`
                        : "new"
                }
                party={editingParty}
                open={formOpen}
                onOpenChange={(open) => setFormOpen(open)}
            />
        </div>
    );
}
