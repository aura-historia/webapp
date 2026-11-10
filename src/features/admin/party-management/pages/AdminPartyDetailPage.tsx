import { Link, useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Party } from "@/data/internal/party/Party.ts";
import { AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import {
    AdminBackLink,
    AdminRecordHeader,
} from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_SKELETON_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { PartyLocationWorkspace } from "@/features/party-locations/components/PartyLocationWorkspace.tsx";
import { cn } from "@/lib/utils.ts";
import {
    AdminPartyRequestError,
    useAdminParty,
    useDeleteAdminParty,
} from "../api/useAdminParties.ts";
import { AdminConfirmDialog } from "../components/AdminConfirmDialog.tsx";
import { AdminPartyFormDialog } from "../components/AdminPartyFormDialog.tsx";
import { AdminPartyLocationAccessSection } from "../components/AdminPartyLocationAccessSection.tsx";
import { formatAdminTimestamp } from "../lib/adminDates.ts";

/**
 * One organization (board "Admin · Organization"): identity and contact facts with edit and
 * delete, every business location, and explicit location-management access.
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
    const back = (
        <AdminBackLink to="/$lng/admin/parties" params={{ lng: language }}>
            {t("adminParties.page.allOrganizations")}
        </AdminBackLink>
    );

    if (!party && partyQuery.error) {
        const status =
            partyQuery.error instanceof AdminPartyRequestError ? partyQuery.error.status : 500;
        const accessLost = status === 401 || status === 403;
        return (
            <div className="flex flex-col gap-5">
                {back}
                <AdminStatePanel
                    tone={status === 404 ? "empty" : "error"}
                    icon={status === 404 ? Building2 : undefined}
                    title={
                        status === 404
                            ? t("adminParties.detail.notFound")
                            : partyQuery.error.message
                    }
                >
                    <Link
                        to="/$lng/admin/parties"
                        params={{ lng: language }}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {t("adminParties.page.allOrganizations")}
                    </Link>
                    {!accessLost && (
                        <button
                            type="button"
                            onClick={() => partyQuery.refetch()}
                            className={SECONDARY_PILL_CLASS}
                        >
                            {t("adminCommon.retry")}
                        </button>
                    )}
                </AdminStatePanel>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {party ? (
                <PartyHeader party={party} language={language} back={back} />
            ) : (
                <div aria-busy="true" className="mb-10 flex flex-col gap-3.5 sm:mb-14">
                    {back}
                    <span className={cn(ADMIN_SKELETON_CLASS, "mt-3 h-3 w-1/4")} />
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-11 w-2/3 rounded-sm")} />
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <span
                                key={index}
                                className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")}
                            />
                        ))}
                    </div>
                    <p role="status" className="text-meta text-ink-secondary">
                        {t("adminParties.loadingDetail")}
                    </p>
                </div>
            )}
            <div className="flex flex-col gap-10 sm:gap-14">
                {user ? (
                    <PartyLocationWorkspace scope={{ viewerCacheKey: user.userId, partyId }} />
                ) : (
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-48 w-full rounded-panel")} />
                )}
                {party && <AdminPartyLocationAccessSection party={party} />}
            </div>
        </div>
    );
}

function PartyHeader({
    party,
    language,
    back,
}: {
    readonly party: Party;
    readonly language: string;
    readonly back: ReactNode;
}) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    // The form edits the organization as it was when editing began; refetches do not reset a draft.
    const [edited, setEdited] = useState(party);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const deleteParty = useDeleteAdminParty();
    const notProvided = t("adminParties.fields.notProvided");

    const remove = () =>
        deleteParty.mutate(party.partyId, {
            onSuccess: () => {
                setConfirmingDelete(false);
                toast.success(t("adminParties.success.deleted"));
                void navigate({ to: "/$lng/admin/parties", params: { lng: language } });
            },
        });

    return (
        <>
            <AdminRecordHeader
                back={back}
                eyebrow={t("adminParties.detail.eyebrow")}
                title={party.name}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                deleteParty.reset();
                                setConfirmingDelete(true);
                            }}
                            className={ADMIN_DANGER_OUTLINE_CLASS}
                        >
                            {t("adminParties.actions.remove")}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEdited(party);
                                setEditing(true);
                            }}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {t("adminParties.actions.edit")}
                        </button>
                    </>
                }
            >
                <AdminFacts
                    columns={3}
                    facts={[
                        {
                            key: "phone",
                            label: t("adminParties.fields.phone"),
                            value: party.contact.phone ?? notProvided,
                            muted: !party.contact.phone,
                        },
                        {
                            key: "email",
                            label: t("adminParties.fields.email"),
                            value: party.contact.email ?? notProvided,
                            muted: !party.contact.email,
                        },
                        {
                            key: "partyId",
                            label: t("adminParties.fields.partyId"),
                            value: party.partyId,
                            mono: true,
                        },
                        {
                            key: "slug",
                            label: t("adminParties.fields.partySlugId"),
                            value: party.partySlugId,
                            mono: true,
                        },
                        {
                            key: "created",
                            label: t("adminParties.fields.created"),
                            value: formatAdminTimestamp(party.created, i18n.language),
                        },
                        {
                            key: "updated",
                            label: t("adminParties.fields.updated"),
                            value: formatAdminTimestamp(party.updated, i18n.language),
                        },
                    ]}
                />
            </AdminRecordHeader>

            <AdminPartyFormDialog
                key={`${edited.partyId}:${edited.updated.toISOString()}`}
                party={edited}
                open={editing}
                onOpenChange={setEditing}
            />
            <AdminConfirmDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                title={t("adminParties.page.deleteTitle", { name: party.name })}
                description={t("adminParties.actions.confirmDelete")}
                confirmLabel={t("adminParties.actions.confirmDeleteButton")}
                pending={deleteParty.isPending}
                error={deleteParty.error?.message}
                onConfirm={remove}
            />
        </>
    );
}
