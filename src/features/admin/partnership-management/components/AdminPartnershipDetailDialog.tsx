import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAdminListingSource } from "@/features/admin/listing-source-management/api/useAdminListingSources.ts";
import {
    useAdminPartnership,
    useDissolveAdminPartnership,
    useGrantAdminPartnershipListingSource,
    useGrantAdminPartnershipMembership,
    useRevokeAdminPartnershipListingSource,
    useRevokeAdminPartnershipMembership,
} from "../api/useAdminPartnerships.ts";
import type { AdminPartnershipDetails } from "@/data/internal/partnership/AdminPartnership.ts";
import { formatDateTime } from "@/lib/utils.ts";

type IdFormValues = { id: string };

function ErrorNotice({ error }: { readonly error: Error | null }) {
    if (!error) return null;
    return (
        <p role="alert" className="text-sm text-destructive">
            {error.message}
        </p>
    );
}

function PartnershipReferenceList({
    title,
    count,
    ids,
    onRevoke,
    isRevoking,
}: {
    readonly title: string;
    readonly count: number;
    readonly ids: readonly string[];
    readonly onRevoke: (id: string) => void;
    readonly isRevoking: boolean;
}) {
    const { t } = useTranslation();

    return (
        <section className="grid gap-2" aria-label={title}>
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">
                {t("adminPartnerships.detail.referencesShown", {
                    shown: ids.length,
                    count,
                })}
            </p>
            {ids.length > 0 ? (
                <ul className="grid max-h-48 gap-2 overflow-y-auto">
                    {ids.map((id) => (
                        <li
                            key={id}
                            className="flex flex-wrap items-center justify-between gap-2 border bg-surface-container-low px-3 py-2"
                        >
                            <span className="break-all font-mono text-xs">{id}</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isRevoking}
                                onClick={() => onRevoke(id)}
                            >
                                {t("adminPartnerships.actions.revoke")}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {t("adminPartnerships.detail.noReferences")}
                </p>
            )}
        </section>
    );
}

function PartnershipFacts({ partnership }: { readonly partnership: AdminPartnershipDetails }) {
    const { t, i18n } = useTranslation();
    const facts = [
        ["party", t("adminPartnerships.fields.party"), partnership.party.name],
        ["partyId", t("adminPartnerships.fields.partyId"), partnership.party.partyId],
        ["partySlugId", t("adminPartnerships.fields.partySlugId"), partnership.party.partySlugId],
        ["partnershipId", t("adminPartnerships.fields.partnershipId"), partnership.partnershipId],
        ["members", t("adminPartnerships.fields.memberCount"), partnership.memberCount],
        [
            "sources",
            t("adminPartnerships.fields.listingSourceGrantCount"),
            partnership.listingSourceGrantCount,
        ],
        [
            "created",
            t("adminPartnerships.fields.created"),
            formatDateTime(partnership.created, i18n.language, "UTC"),
        ],
        [
            "updated",
            t("adminPartnerships.fields.updated"),
            formatDateTime(partnership.updated, i18n.language, "UTC"),
        ],
    ] as const;

    return (
        <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map(([key, label, value]) => (
                <div key={key} className="grid min-w-0 gap-1">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd
                        className={
                            key.endsWith("Id")
                                ? "break-all font-mono text-sm"
                                : "break-words text-sm"
                        }
                    >
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function AdminPartnershipDetailDialog({
    partnershipId,
    open,
    onOpenChange,
    onDissolved,
}: {
    readonly partnershipId: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onDissolved: () => void;
}) {
    const { t } = useTranslation();
    const detailQuery = useAdminPartnership(partnershipId, open);
    const partnership = detailQuery.data;
    const grantMembership = useGrantAdminPartnershipMembership();
    const revokeMembership = useRevokeAdminPartnershipMembership();
    const grantListingSource = useGrantAdminPartnershipListingSource();
    const revokeListingSourceMutation = useRevokeAdminPartnershipListingSource();
    const dissolvePartnership = useDissolveAdminPartnership();
    const [checkedListingSourceId, setCheckedListingSourceId] = useState<string>();
    const [confirmDissolveOpen, setConfirmDissolveOpen] = useState(false);
    const idSchema = z.object({
        id: z
            .string()
            .trim()
            .min(1, t("adminPartnerships.validation.requiredId"))
            .max(128, t("adminPartnerships.validation.idTooLong")),
    });
    const memberForm = useForm<IdFormValues>({
        resolver: zodResolver(idSchema),
        defaultValues: { id: "" },
    });
    const listingSourceForm = useForm<IdFormValues>({
        resolver: zodResolver(idSchema),
        defaultValues: { id: "" },
    });
    const enteredListingSourceId = listingSourceForm.watch("id").trim();
    const listingSourceQuery = useAdminListingSource(checkedListingSourceId, open);
    const listingSourceMatchesParty =
        Boolean(partnership) &&
        listingSourceQuery.data?.operator.partyId === partnership?.party.partyId;
    const sourceIsCheckedForCurrentValue =
        Boolean(checkedListingSourceId) && checkedListingSourceId === enteredListingSourceId;
    const memberMutationPending = grantMembership.isPending || revokeMembership.isPending;
    const sourceMutationPending =
        grantListingSource.isPending || revokeListingSourceMutation.isPending;

    const grantMember = memberForm.handleSubmit(async ({ id }) => {
        grantMembership.reset();
        revokeMembership.reset();
        try {
            await grantMembership.mutateAsync({ partnershipId, userId: id });
            memberForm.reset();
            toast.success(t("adminPartnerships.success.memberGranted"));
        } catch {
            // The localized mutation error is shown below the form.
        }
    });
    const revokeMemberById = memberForm.handleSubmit(async ({ id }) => {
        grantMembership.reset();
        revokeMembership.reset();
        try {
            await revokeMembership.mutateAsync({ partnershipId, userId: id });
            memberForm.reset();
            toast.success(t("adminPartnerships.success.memberRevoked"));
        } catch {
            // The localized mutation error is shown below the form.
        }
    });
    const checkListingSource = listingSourceForm.handleSubmit(({ id }) => {
        setCheckedListingSourceId(id);
        grantListingSource.reset();
        revokeListingSourceMutation.reset();
    });
    const grantSource = listingSourceForm.handleSubmit(async ({ id }) => {
        if (
            !partnership ||
            !sourceIsCheckedForCurrentValue ||
            !listingSourceMatchesParty ||
            listingSourceQuery.isPending
        ) {
            return;
        }
        grantListingSource.reset();
        revokeListingSourceMutation.reset();
        try {
            await grantListingSource.mutateAsync({ partnershipId, listingSourceId: id });
            listingSourceForm.reset();
            setCheckedListingSourceId(undefined);
            toast.success(t("adminPartnerships.success.listingSourceGranted"));
        } catch {
            // The localized mutation error is shown below the form.
        }
    });
    const revokeSourceById = listingSourceForm.handleSubmit(async ({ id }) => {
        grantListingSource.reset();
        revokeListingSourceMutation.reset();
        try {
            await revokeListingSourceMutation.mutateAsync({ partnershipId, listingSourceId: id });
            listingSourceForm.reset();
            setCheckedListingSourceId(undefined);
            toast.success(t("adminPartnerships.success.listingSourceRevoked"));
        } catch {
            // The localized mutation error is shown below the form.
        }
    });

    const revokeMember = (userId: string) => {
        grantMembership.reset();
        revokeMembership.reset();
        revokeMembership.mutate(
            { partnershipId, userId },
            { onSuccess: () => toast.success(t("adminPartnerships.success.memberRevoked")) },
        );
    };
    const revokeListingSource = (listingSourceId: string) => {
        grantListingSource.reset();
        revokeListingSourceMutation.reset();
        revokeListingSourceMutation.mutate(
            { partnershipId, listingSourceId },
            { onSuccess: () => toast.success(t("adminPartnerships.success.listingSourceRevoked")) },
        );
    };

    const dissolve = async () => {
        dissolvePartnership.reset();
        try {
            await dissolvePartnership.mutateAsync({ partnershipId });
            toast.success(t("adminPartnerships.success.dissolved"));
            setConfirmDissolveOpen(false);
            onDissolved();
        } catch {
            // The localized dissolution failure is shown in the confirmation dialog.
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {partnership?.party.name ?? t("adminPartnerships.detail.title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("adminPartnerships.detail.description")}
                    </DialogDescription>
                </DialogHeader>
                {detailQuery.error ? (
                    <div role="alert" className="grid justify-items-start gap-3">
                        <p>{detailQuery.error.message}</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => detailQuery.refetch()}
                        >
                            {t("adminPartnerships.actions.retry")}
                        </Button>
                    </div>
                ) : detailQuery.isPending || !partnership ? (
                    <output>{t("adminPartnerships.loadingDetail")}</output>
                ) : (
                    <div className="grid gap-6">
                        <PartnershipFacts partnership={partnership} />

                        <div className="grid gap-6 lg:grid-cols-2">
                            <PartnershipReferenceList
                                title={t("adminPartnerships.detail.members", {
                                    count: partnership.memberCount,
                                })}
                                count={partnership.memberCount}
                                ids={partnership.memberUserIds}
                                onRevoke={revokeMember}
                                isRevoking={memberMutationPending}
                            />
                            <PartnershipReferenceList
                                title={t("adminPartnerships.detail.listingSources", {
                                    count: partnership.listingSourceGrantCount,
                                })}
                                count={partnership.listingSourceGrantCount}
                                ids={partnership.listingSourceIds}
                                onRevoke={revokeListingSource}
                                isRevoking={sourceMutationPending}
                            />
                        </div>

                        <section className="grid gap-3 border bg-surface-container-low p-4">
                            <h3 className="font-medium">{t("adminPartnerships.members.title")}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t("adminPartnerships.members.description")}
                            </p>
                            <form
                                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void grantMember(event);
                                }}
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="admin-partnership-member-id">
                                        {t("adminPartnerships.members.userId")}
                                    </Label>
                                    <Input
                                        id="admin-partnership-member-id"
                                        {...memberForm.register("id")}
                                        autoComplete="off"
                                        spellCheck={false}
                                        aria-invalid={Boolean(memberForm.formState.errors.id)}
                                    />
                                    {memberForm.formState.errors.id && (
                                        <p className="text-sm text-destructive">
                                            {memberForm.formState.errors.id.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit" disabled={memberMutationPending}>
                                        {grantMembership.isPending
                                            ? t("adminPartnerships.actions.saving")
                                            : t("adminPartnerships.actions.grantMembership")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={memberMutationPending}
                                        onClick={() => void revokeMemberById()}
                                    >
                                        {t("adminPartnerships.actions.revokeMembership")}
                                    </Button>
                                </div>
                            </form>
                            <ErrorNotice error={grantMembership.error ?? revokeMembership.error} />
                        </section>

                        <section className="grid gap-3 border bg-surface-container-low p-4">
                            <h3 className="font-medium">{t("adminPartnerships.sources.title")}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t("adminPartnerships.sources.description")}
                            </p>
                            <form
                                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void checkListingSource(event);
                                }}
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="admin-partnership-listing-source-id">
                                        {t("adminPartnerships.sources.listingSourceId")}
                                    </Label>
                                    <Input
                                        id="admin-partnership-listing-source-id"
                                        {...listingSourceForm.register("id", {
                                            onChange: () => setCheckedListingSourceId(undefined),
                                        })}
                                        autoComplete="off"
                                        spellCheck={false}
                                        aria-invalid={Boolean(
                                            listingSourceForm.formState.errors.id,
                                        )}
                                    />
                                    {listingSourceForm.formState.errors.id && (
                                        <p className="text-sm text-destructive">
                                            {listingSourceForm.formState.errors.id.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={listingSourceQuery.isFetching}
                                    >
                                        {listingSourceQuery.isFetching
                                            ? t("adminPartnerships.sources.checking")
                                            : t("adminPartnerships.sources.check")}
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={
                                            !sourceIsCheckedForCurrentValue ||
                                            !listingSourceMatchesParty ||
                                            listingSourceQuery.isPending ||
                                            sourceMutationPending
                                        }
                                        onClick={() => void grantSource()}
                                    >
                                        {t("adminPartnerships.actions.grantSource")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={sourceMutationPending}
                                        onClick={() => void revokeSourceById()}
                                    >
                                        {t("adminPartnerships.actions.revokeSource")}
                                    </Button>
                                </div>
                            </form>
                            {listingSourceQuery.isPending && checkedListingSourceId && (
                                <p role="status" className="text-sm text-muted-foreground">
                                    {t("adminPartnerships.sources.checking")}
                                </p>
                            )}
                            {listingSourceQuery.error && checkedListingSourceId && (
                                <ErrorNotice error={listingSourceQuery.error} />
                            )}
                            {listingSourceQuery.data &&
                                sourceIsCheckedForCurrentValue &&
                                (listingSourceMatchesParty ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t("adminPartnerships.sources.sameParty", {
                                            name: listingSourceQuery.data.name,
                                            listingSourceId:
                                                listingSourceQuery.data.listingSourceId,
                                        })}
                                    </p>
                                ) : (
                                    <p role="alert" className="text-sm text-destructive">
                                        {t("adminPartnerships.errors.partyConflict")}
                                    </p>
                                ))}
                            <ErrorNotice
                                error={
                                    grantListingSource.error ?? revokeListingSourceMutation.error
                                }
                            />
                        </section>

                        <section className="grid gap-3 border border-destructive/30 p-4">
                            <h3 className="font-medium">
                                {t("adminPartnerships.dissolution.title")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t("adminPartnerships.dissolution.description")}
                            </p>
                            <AlertDialog
                                open={confirmDissolveOpen}
                                onOpenChange={(nextOpen) => {
                                    if (nextOpen) dissolvePartnership.reset();
                                    setConfirmDissolveOpen(nextOpen);
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={memberMutationPending || sourceMutationPending}
                                    onClick={() => setConfirmDissolveOpen(true)}
                                >
                                    {t("adminPartnerships.actions.dissolve")}
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("adminPartnerships.dissolution.confirmTitle")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("adminPartnerships.dissolution.confirmDescription", {
                                                name: partnership.party.name,
                                            })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <ErrorNotice error={dissolvePartnership.error} />
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={dissolvePartnership.isPending}>
                                            {t("adminPartnerships.actions.cancel")}
                                        </AlertDialogCancel>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={dissolvePartnership.isPending}
                                            onClick={() => void dissolve()}
                                        >
                                            {dissolvePartnership.isPending
                                                ? t("adminPartnerships.actions.dissolving")
                                                : t("adminPartnerships.actions.confirmDissolve")}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </section>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
