import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { H1 } from "@/components/typography/H1.tsx";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Party } from "@/data/internal/party/Party.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { PartyLocationWorkspace } from "@/features/party-locations/components/PartyLocationWorkspace.tsx";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminParty, useDeleteAdminParty } from "../api/useAdminParties.ts";
import { AdminPartyFormDialog } from "../components/AdminPartyFormDialog.tsx";
import { AdminPartyLocationAccessSection } from "../components/AdminPartyLocationAccessSection.tsx";

/**
 * One organization with its identity, contact details, business locations and explicit
 * location-management access on one page.
 */
export function AdminPartyDetailPage({
    partyId,
    language,
}: {
    readonly partyId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const { user } = useResolvedAuth();
    const partyQuery = useAdminParty(partyId);
    const party = partyQuery.data;

    let header: ReactNode;
    if (party) {
        header = <PartyHeader party={party} language={language} />;
    } else if (partyQuery.error) {
        header = (
            <div role="alert" className="grid justify-items-start gap-3">
                <H1>{t("adminParties.detail.title")}</H1>
                <p className="text-muted-foreground">{partyQuery.error.message}</p>
                <Button type="button" variant="outline" onClick={() => partyQuery.refetch()}>
                    {t("adminParties.actions.retry")}
                </Button>
            </div>
        );
    } else {
        header = (
            <div className="grid gap-4" aria-busy="true">
                <output className="sr-only">{t("adminParties.loadingDetail")}</output>
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6">
            <Link
                to="/$lng/admin/parties"
                params={{ lng: language }}
                className="inline-flex w-fit items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
            >
                <ArrowLeft className="size-4" aria-hidden />
                {t("adminParties.page.back")}
            </Link>
            {header}
            {!partyQuery.error &&
                (user ? (
                    <PartyLocationWorkspace scope={{ viewerCacheKey: user.userId, partyId }} />
                ) : (
                    <Skeleton className="h-48 w-full" />
                ))}
            {party && <AdminPartyLocationAccessSection party={party} />}
        </div>
    );
}

function PartyHeader({ party, language }: { readonly party: Party; readonly language: string }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    // The form edits the organization as it was when editing began; refetches do not reset a draft.
    const [edited, setEdited] = useState(party);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const deleteParty = useDeleteAdminParty();

    const remove = () =>
        deleteParty.mutate(party.partyId, {
            onSuccess: () => {
                toast.success(t("adminParties.success.deleted"));
                void navigate({ to: "/$lng/admin/parties", params: { lng: language } });
            },
            onSettled: () => setConfirmingDelete(false),
        });

    return (
        <>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <H1 className="min-w-0 break-words">{party.name}</H1>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        onClick={() => {
                            setEdited(party);
                            setEditing(true);
                        }}
                    >
                        {t("adminParties.actions.edit")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            deleteParty.reset();
                            setConfirmingDelete(true);
                        }}
                    >
                        {t("adminParties.actions.delete")}
                    </Button>
                </div>
            </header>
            {deleteParty.error && (
                <p role="alert" className="text-sm text-destructive">
                    {deleteParty.error.message}
                </p>
            )}

            <section className="grid gap-4" aria-labelledby="admin-party-details-title">
                <div className="grid gap-1">
                    <h2 id="admin-party-details-title" className="text-xl font-medium">
                        {t("adminParties.detail.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("adminParties.detail.description")}
                    </p>
                </div>
                <dl className="grid gap-4 border bg-card p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                    <DetailRow label={t("adminParties.fields.phone")}>
                        {party.contact.phone ?? t("adminParties.fields.notProvided")}
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.email")}>
                        <span className="break-all">
                            {party.contact.email ?? t("adminParties.fields.notProvided")}
                        </span>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.partyId")}>
                        <span className="break-all font-mono text-sm">{party.partyId}</span>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.partySlugId")}>
                        <span className="break-all font-mono text-sm">{party.partySlugId}</span>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.created")}>
                        <time dateTime={party.created.toISOString()}>
                            {formatDateTime(party.created, i18n.language, "UTC")}
                        </time>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.updated")}>
                        <time dateTime={party.updated.toISOString()}>
                            {formatDateTime(party.updated, i18n.language, "UTC")}
                        </time>
                    </DetailRow>
                </dl>
            </section>

            <AdminPartyFormDialog
                key={`${edited.partyId}:${edited.updated.toISOString()}`}
                party={edited}
                open={editing}
                onOpenChange={setEditing}
            />
            <AlertDialog
                open={confirmingDelete}
                onOpenChange={(open) => {
                    if (!open && !deleteParty.isPending) setConfirmingDelete(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("adminParties.page.deleteTitle", { name: party.name })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("adminParties.actions.confirmDelete")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteParty.isPending}>
                            {t("adminParties.actions.cancel")}
                        </AlertDialogCancel>
                        {/* A plain button keeps the dialog open until the request settles. */}
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteParty.isPending}
                            onClick={remove}
                        >
                            {deleteParty.isPending
                                ? t("adminParties.actions.deleting")
                                : t("adminParties.actions.confirmDeleteButton")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function DetailRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="grid min-w-0 content-start gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words">{children}</dd>
        </div>
    );
}
