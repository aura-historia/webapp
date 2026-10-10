import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogLoadingState,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { Party } from "@/data/internal/party/Party.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminParty, useDeleteAdminParty } from "../api/useAdminParties.ts";

export function AdminPartyDetailDialog({
    partyId,
    open,
    onOpenChange,
    onEdit,
}: {
    readonly partyId?: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onEdit: (party: Party) => void;
}) {
    const { t, i18n } = useTranslation();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [displayedPartyId, releasePartyId] = useRetainedDialogValue(partyId, open);
    const partyQuery = useAdminParty(displayedPartyId, open);
    const deleteParty = useDeleteAdminParty();
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setConfirmDelete(false);
            deleteParty.reset();
        }
        onOpenChange(nextOpen);
    };

    let content: ReactNode;
    if (partyQuery.error) {
        content = (
            <div role="alert" className="grid gap-3">
                <p>{partyQuery.error.message}</p>
                <Button
                    variant="outline"
                    className="justify-self-start"
                    onClick={() => partyQuery.refetch()}
                >
                    {t("adminParties.actions.retry")}
                </Button>
            </div>
        );
    } else if (partyQuery.isPending || !partyQuery.data) {
        content = <DialogLoadingState>{t("adminParties.loadingDetail")}</DialogLoadingState>;
    } else {
        const party = partyQuery.data;
        content = (
            <div className="grid gap-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label={t("adminParties.fields.partyId")}>
                        <span className="break-all font-mono text-sm">{party.partyId}</span>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.partySlugId")}>
                        <span className="break-all font-mono text-sm">{party.partySlugId}</span>
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.name")}>{party.name}</DetailRow>
                    <DetailRow label={t("adminParties.fields.phone")}>
                        {party.contact.phone ?? t("adminParties.fields.notProvided")}
                    </DetailRow>
                    <DetailRow label={t("adminParties.fields.email")}>
                        {party.contact.email ?? t("adminParties.fields.notProvided")}
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
                {deleteParty.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {deleteParty.error.message}
                    </p>
                )}
                {confirmDelete ? (
                    <div className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
                        <p className="text-sm">{t("adminParties.actions.confirmDelete")}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="destructive"
                                disabled={deleteParty.isPending}
                                onClick={() =>
                                    deleteParty.mutate(party.partyId, {
                                        onSuccess: () => {
                                            toast.success(t("adminParties.success.deleted"));
                                            handleOpenChange(false);
                                        },
                                    })
                                }
                            >
                                {deleteParty.isPending
                                    ? t("adminParties.actions.deleting")
                                    : t("adminParties.actions.confirmDeleteButton")}
                            </Button>
                            <Button
                                variant="outline"
                                disabled={deleteParty.isPending}
                                onClick={() => setConfirmDelete(false)}
                            >
                                {t("adminParties.actions.cancel")}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-between gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteParty.reset();
                                setConfirmDelete(true);
                            }}
                        >
                            {t("adminParties.actions.delete")}
                        </Button>
                        <Button
                            onClick={() => {
                                handleOpenChange(false);
                                onEdit(party);
                            }}
                        >
                            {t("adminParties.actions.edit")}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="flex h-[min(90vh,30rem)] flex-col overflow-y-auto"
                onCloseAutoFocus={releasePartyId}
            >
                <DialogHeader>
                    <DialogTitle>{t("adminParties.detail.title")}</DialogTitle>
                    <DialogDescription>{t("adminParties.detail.description")}</DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words">{children}</dd>
        </div>
    );
}
