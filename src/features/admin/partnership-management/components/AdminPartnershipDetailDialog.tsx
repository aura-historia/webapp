import { Link } from "@tanstack/react-router";
import { Check, CircleAlert } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
    AdminPartnershipDetails,
    AdminPartnershipSummary,
} from "@/data/internal/partnership/AdminPartnership.ts";
import { AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_INSET_CLASS,
    ADMIN_RAISED_FIELD_CLASS,
    ADMIN_ROW_ACTION_CLASS,
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_SMALL_PRIMARY_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useAdminListingSource } from "@/features/admin/listing-source-management/api/useAdminListingSources.ts";
import { AdminConfirmDialog } from "@/features/admin/party-management/components/AdminConfirmDialog.tsx";
import { formatAdminDay } from "@/features/admin/party-management/lib/adminDates.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    AdminPartnershipRequestError,
    useAdminPartnership,
    useDissolveAdminPartnership,
    useGrantAdminPartnershipListingSource,
    useGrantAdminPartnershipMembership,
    useRevokeAdminPartnershipListingSource,
    useRevokeAdminPartnershipMembership,
} from "../api/useAdminPartnerships.ts";
import { AdminConflictNotice, AdminErrorLine } from "./AdminConflictNotice.tsx";

const MAX_ID_LENGTH = 128;
/** 44px pills with the 13px label the insets use. */
const INSET_PRIMARY_CLASS = cn(PRIMARY_PILL_CLASS, "px-4 text-meta");
const INSET_SECONDARY_CLASS = cn(SECONDARY_PILL_CLASS, "px-4 text-meta");

/**
 * Members, source grants and dissolution of one partnership (board "Admin · Partnership").
 * Counts are complete; the ID lists hold at most 100 entries and are never used as totals.
 */
export function AdminPartnershipDetailDialog({
    partnershipId: requestedId,
    summary: requestedSummary,
    onClose,
}: {
    readonly partnershipId?: string;
    readonly summary?: AdminPartnershipSummary;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    const open = Boolean(requestedId);
    const [partnershipId, releaseId] = useRetainedDialogValue(requestedId, open);
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const detailQuery = useAdminPartnership(partnershipId, open);
    const shown =
        detailQuery.data ?? (summary?.partnershipId === partnershipId ? summary : undefined);

    return (
        <AdminRecordDialog
            open={open}
            width="lg"
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
            onCloseAutoFocus={() => {
                releaseId();
                releaseSummary();
            }}
            eyebrow={t("adminPartnerships.detail.eyebrow")}
            title={shown?.party.name ?? t("adminPartnerships.detail.eyebrow")}
            subtitle={
                shown ? (
                    <Link
                        to="/$lng/admin/parties/$partyId"
                        from="/$lng"
                        params={(previous) => ({ ...previous, partyId: shown.party.partyId })}
                        className={cn(TEXT_LINK_CLASS, "text-ink")}
                    >
                        {t("adminPartnerships.detail.organizationLink")}
                    </Link>
                ) : undefined
            }
        >
            {partnershipId &&
                (detailQuery.data ? (
                    // Keyed so member and source drafts never carry over to another partnership.
                    <PartnershipBody
                        key={partnershipId}
                        partnership={detailQuery.data}
                        onDissolved={onClose}
                    />
                ) : detailQuery.error ? (
                    <div className="flex flex-wrap items-center justify-between gap-3.5">
                        <AdminErrorLine message={detailQuery.error.message} className="text-sm" />
                        <button
                            type="button"
                            onClick={() => detailQuery.refetch()}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("adminCommon.retry")}
                        </button>
                    </div>
                ) : (
                    <div aria-busy="true" className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <span
                                    key={index}
                                    className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")}
                                />
                            ))}
                        </div>
                        <p role="status" className="text-meta text-ink-secondary">
                            {t("adminPartnerships.loadingDetail")}
                        </p>
                    </div>
                ))}
        </AdminRecordDialog>
    );
}

function PartnershipBody({
    partnership,
    onDissolved,
}: {
    readonly partnership: AdminPartnershipDetails;
    readonly onDissolved: () => void;
}) {
    const { t, i18n } = useTranslation();
    const number = new Intl.NumberFormat(i18n.language);
    const facts = [
        {
            key: "partyId",
            label: t("adminPartnerships.fields.organizationId"),
            value: partnership.party.partyId,
            mono: true,
        },
        {
            key: "slug",
            label: t("adminPartnerships.fields.organizationSlug"),
            value: partnership.party.partySlugId,
            mono: true,
        },
        {
            key: "partnershipId",
            label: t("adminPartnerships.fields.partnershipId"),
            value: partnership.partnershipId,
            mono: true,
        },
        {
            key: "members",
            label: t("adminPartnerships.fields.members"),
            value: number.format(partnership.memberCount),
        },
        {
            key: "grants",
            label: t("adminPartnerships.fields.sourceGrants"),
            value: number.format(partnership.listingSourceGrantCount),
        },
        {
            key: "dates",
            label: t("adminPartnerships.fields.createdUpdated"),
            value: `${formatAdminDay(partnership.created, i18n.language)} · ${formatAdminDay(partnership.updated, i18n.language)}`,
        },
    ];
    return (
        <>
            <AdminFacts facts={facts} columns={3} />
            <div className="grid gap-5 lg:grid-cols-2">
                <MembersInset partnership={partnership} />
                <SourcesInset partnership={partnership} />
            </div>
            <DissolveBlock partnership={partnership} onDissolved={onDissolved} />
        </>
    );
}

/** A mutation error: 409 conflicts in brass (the data is reloaded), the rest in oxblood. */
function MutationError({
    error,
    conflictInBrass = true,
}: {
    readonly error: Error | null;
    readonly conflictInBrass?: boolean;
}) {
    if (!error) return null;
    if (conflictInBrass && error instanceof AdminPartnershipRequestError && error.status === 409) {
        return <AdminConflictNotice message={error.message} />;
    }
    return <AdminErrorLine message={error.message} />;
}

function validateId(value: string, t: (key: string) => string): string | undefined {
    const id = value.trim();
    if (!id) return t("adminPartnerships.validation.requiredId");
    if (id.length > MAX_ID_LENGTH) return t("adminPartnerships.validation.idTooLong");
    return undefined;
}

function InsetHeader({
    id,
    title,
    shown,
    count,
}: {
    readonly id: string;
    readonly title: string;
    readonly shown: number;
    readonly count: number;
}) {
    const { t, i18n } = useTranslation();
    const number = new Intl.NumberFormat(i18n.language);
    return (
        <div className="flex flex-col gap-1">
            <h3 id={id} className={cn(ADMIN_SECTION_TITLE_CLASS, "text-[22px]")}>
                {title}
            </h3>
            <p className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                {t("adminPartnerships.detail.shown", {
                    shown: number.format(shown),
                    count: number.format(count),
                })}
            </p>
        </div>
    );
}

/** Mono IDs, each with Revoke that confirms inline in its row. */
function ReferenceRows({
    ids,
    confirmText,
    revokeLabel,
    disabled,
    onRevoke,
}: {
    readonly ids: readonly string[];
    readonly confirmText: string;
    readonly revokeLabel: (id: string) => string;
    readonly disabled: boolean;
    readonly onRevoke: (id: string, done: () => void) => void;
}) {
    const { t } = useTranslation();
    const [asking, setAsking] = useState<string>();
    const [pendingId, setPendingId] = useState<string>();
    const [returnFocus, setReturnFocus] = useState<string>();
    const revokeButtons = useRef(new Map<string, HTMLButtonElement>());

    useEffect(() => {
        if (asking || !returnFocus) return;
        revokeButtons.current.get(returnFocus)?.focus();
        setReturnFocus(undefined);
    }, [asking, returnFocus]);

    if (ids.length === 0) {
        return (
            <p className="border-t border-line pt-3 text-meta text-ink-muted">
                {t("adminPartnerships.detail.noReferences")}
            </p>
        );
    }
    return (
        <ul className="border-t border-line">
            {ids.map((id) => (
                <li
                    key={id}
                    className="flex min-h-[52px] items-center justify-between gap-3 border-b border-line-subtle py-2"
                >
                    {asking === id ? (
                        <RowConfirm
                            text={confirmText}
                            pending={pendingId === id}
                            onCancel={() => {
                                setReturnFocus(id);
                                setAsking(undefined);
                            }}
                            onConfirm={() => {
                                setPendingId(id);
                                onRevoke(id, () => {
                                    setPendingId(undefined);
                                    setAsking(undefined);
                                });
                            }}
                        />
                    ) : (
                        <>
                            <code className="min-w-0 truncate font-mono text-xs text-ink-secondary">
                                {id}
                            </code>
                            <button
                                ref={(element) => {
                                    if (element) revokeButtons.current.set(id, element);
                                    else revokeButtons.current.delete(id);
                                }}
                                type="button"
                                disabled={disabled}
                                aria-label={revokeLabel(id)}
                                onClick={() => setAsking(id)}
                                className={ADMIN_ROW_ACTION_CLASS}
                            >
                                {t("adminPartnerships.actions.revoke")}
                            </button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}

function RowConfirm({
    text,
    pending,
    onCancel,
    onConfirm,
}: {
    readonly text: string;
    readonly pending: boolean;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
}) {
    const { t } = useTranslation();
    const cancelButton = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        cancelButton.current?.focus();
    }, []);
    return (
        <span
            role="group"
            aria-label={text}
            className="flex w-full flex-wrap items-center justify-between gap-2"
        >
            <span className="text-meta text-oxblood">{text}</span>
            <span className="flex gap-1.5">
                <button
                    ref={cancelButton}
                    type="button"
                    disabled={pending}
                    onClick={onCancel}
                    className={cn(ADMIN_ROW_ACTION_CLASS, "px-3")}
                >
                    {t("adminCommon.cancel")}
                </button>
                <button
                    type="button"
                    disabled={pending}
                    aria-busy={pending}
                    onClick={onConfirm}
                    className={cn(
                        "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-oxblood px-3 text-meta font-medium text-on-oxblood disabled:cursor-not-allowed disabled:opacity-45",
                        FOCUS_CLASS,
                    )}
                >
                    {t("adminPartnerships.actions.revoke")}
                </button>
            </span>
        </span>
    );
}

/** A mono ID input with its actions in one row (wrapping when narrow) and its error below. */
function IdField({
    id,
    label,
    placeholder,
    value,
    error,
    onChange,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
    readonly error?: string;
    readonly onChange: (value: string) => void;
    readonly children: ReactNode;
}) {
    return (
        <>
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                <input
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(
                        ADMIN_RAISED_FIELD_CLASS,
                        "w-auto min-w-[10rem] flex-1 font-mono text-[13px]",
                    )}
                />
                {children}
            </div>
            {error && (
                <p id={`${id}-error`} className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
        </>
    );
}

function MembersInset({ partnership }: { readonly partnership: AdminPartnershipDetails }) {
    const { t } = useTranslation();
    const grant = useGrantAdminPartnershipMembership();
    const revoke = useRevokeAdminPartnershipMembership();
    const [userId, setUserId] = useState("");
    const [fieldError, setFieldError] = useState<string>();
    const pending = grant.isPending || revoke.isPending;
    const partnershipId = partnership.partnershipId;
    const inputId = `admin-partnership-member-${partnershipId}`;

    const run = async (action: "grant" | "revoke") => {
        const error = validateId(userId, t);
        setFieldError(error);
        if (error) return;
        grant.reset();
        revoke.reset();
        try {
            await (action === "grant" ? grant : revoke).mutateAsync({
                partnershipId,
                userId: userId.trim(),
            });
            setUserId("");
            toast.success(
                t(
                    action === "grant"
                        ? "adminPartnerships.success.memberGranted"
                        : "adminPartnerships.success.memberRevoked",
                ),
            );
        } catch {
            // The localized mutation error is shown below the form.
        }
    };

    return (
        <section
            aria-labelledby={`${inputId}-title`}
            className={cn(ADMIN_INSET_CLASS, "flex flex-col gap-3.5 p-5")}
        >
            <InsetHeader
                id={`${inputId}-title`}
                title={t("adminPartnerships.members.heading")}
                shown={partnership.memberUserIds.length}
                count={partnership.memberCount}
            />
            <ReferenceRows
                ids={partnership.memberUserIds}
                confirmText={t("adminPartnerships.members.confirmRevoke")}
                revokeLabel={(id) => t("adminPartnerships.actions.revokeMemberFor", { id })}
                disabled={pending}
                onRevoke={(id, done) => {
                    grant.reset();
                    revoke.reset();
                    revoke.mutate(
                        { partnershipId, userId: id },
                        {
                            onSuccess: () =>
                                toast.success(t("adminPartnerships.success.memberRevoked")),
                            onSettled: done,
                        },
                    );
                }}
            />
            <form
                noValidate
                className="flex flex-col gap-2"
                onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    void run("grant");
                }}
            >
                <IdField
                    id={inputId}
                    label={t("adminPartnerships.members.userId")}
                    placeholder="usr_…"
                    value={userId}
                    error={fieldError}
                    onChange={(value) => {
                        setUserId(value);
                        setFieldError(undefined);
                    }}
                >
                    <button type="submit" disabled={pending} className={INSET_PRIMARY_CLASS}>
                        {t("adminPartnerships.actions.grantMembership")}
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => void run("revoke")}
                        className={INSET_SECONDARY_CLASS}
                    >
                        {t("adminPartnerships.actions.revoke")}
                    </button>
                </IdField>
            </form>
            <MutationError error={grant.error ?? revoke.error} />
        </section>
    );
}

function SourcesInset({ partnership }: { readonly partnership: AdminPartnershipDetails }) {
    const { t } = useTranslation();
    const grant = useGrantAdminPartnershipListingSource();
    const revoke = useRevokeAdminPartnershipListingSource();
    const [sourceId, setSourceId] = useState("");
    const [fieldError, setFieldError] = useState<string>();
    const [checkedId, setCheckedId] = useState<string>();
    const sourceQuery = useAdminListingSource(checkedId, true);
    const pending = grant.isPending || revoke.isPending;
    const partnershipId = partnership.partnershipId;
    const inputId = `admin-partnership-source-${partnershipId}`;
    const checkedCurrent = Boolean(checkedId) && checkedId === sourceId.trim();
    const source = checkedCurrent ? sourceQuery.data : undefined;
    const matches = source?.operator.partyId === partnership.party.partyId;

    const resetMutations = () => {
        grant.reset();
        revoke.reset();
    };
    const check = (event: FormEvent) => {
        event.preventDefault();
        const error = validateId(sourceId, t);
        setFieldError(error);
        if (error) return;
        resetMutations();
        setCheckedId(sourceId.trim());
    };
    const run = async (action: "grant" | "revoke") => {
        if (!source || (action === "grant" && !matches)) return;
        resetMutations();
        try {
            await (action === "grant" ? grant : revoke).mutateAsync({
                partnershipId,
                listingSourceId: source.listingSourceId,
            });
            setSourceId("");
            setCheckedId(undefined);
            toast.success(
                t(
                    action === "grant"
                        ? "adminPartnerships.success.listingSourceGranted"
                        : "adminPartnerships.success.listingSourceRevoked",
                ),
            );
        } catch {
            // The localized mutation error is shown below the form.
        }
    };

    let checkResult: ReactNode;
    if (checkedCurrent && sourceQuery.isPending) {
        checkResult = (
            <p role="status" className="text-meta text-ink-secondary">
                {t("adminPartnerships.sources.checking")}
            </p>
        );
    } else if (checkedCurrent && sourceQuery.error) {
        checkResult = <AdminErrorLine message={sourceQuery.error.message} />;
    } else if (source && matches) {
        checkResult = (
            <div
                role="status"
                className="flex flex-col gap-2.5 rounded-md bg-surface-raised px-3.5 py-3 shadow-ring"
            >
                <p className="flex gap-2 text-meta leading-normal">
                    <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-pill bg-ink text-surface"
                    >
                        <Check className="size-[9px]" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 break-words">
                        {t("adminPartnerships.sources.sameOrganization", { name: source.name })}
                    </span>
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => void run("grant")}
                        className={ADMIN_SMALL_PRIMARY_CLASS}
                    >
                        {t("adminPartnerships.actions.grantSource")}
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => void run("revoke")}
                        className={SMALL_SECONDARY_PILL_CLASS}
                    >
                        {t("adminPartnerships.actions.revokeSource")}
                    </button>
                </div>
            </div>
        );
    } else if (source) {
        checkResult = (
            <p
                role="alert"
                className="flex items-start gap-2 text-meta leading-normal text-oxblood"
            >
                <CircleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-[15px] shrink-0"
                    strokeWidth={2}
                />
                {t("adminPartnerships.sources.otherOrganization")}
            </p>
        );
    }

    return (
        <section
            aria-labelledby={`${inputId}-title`}
            className={cn(ADMIN_INSET_CLASS, "flex flex-col gap-3.5 p-5")}
        >
            <InsetHeader
                id={`${inputId}-title`}
                title={t("adminPartnerships.sources.heading")}
                shown={partnership.listingSourceIds.length}
                count={partnership.listingSourceGrantCount}
            />
            <ReferenceRows
                ids={partnership.listingSourceIds}
                confirmText={t("adminPartnerships.sources.confirmRevoke")}
                revokeLabel={(id) => t("adminPartnerships.actions.revokeSourceFor", { id })}
                disabled={pending}
                onRevoke={(id, done) => {
                    resetMutations();
                    revoke.mutate(
                        { partnershipId, listingSourceId: id },
                        {
                            onSuccess: () =>
                                toast.success(t("adminPartnerships.success.listingSourceRevoked")),
                            onSettled: done,
                        },
                    );
                }}
            />
            <form noValidate className="flex flex-col gap-2" onSubmit={check}>
                <IdField
                    id={inputId}
                    label={t("adminPartnerships.sources.listingSourceId")}
                    placeholder="ls_…"
                    value={sourceId}
                    error={fieldError}
                    onChange={(value) => {
                        setSourceId(value);
                        setFieldError(undefined);
                        setCheckedId(undefined);
                    }}
                >
                    <button
                        type="submit"
                        disabled={checkedCurrent && sourceQuery.isFetching}
                        className={INSET_SECONDARY_CLASS}
                    >
                        {t("adminPartnerships.sources.check")}
                    </button>
                </IdField>
            </form>
            {checkResult}
            <MutationError error={grant.error ?? revoke.error} conflictInBrass={!grant.error} />
        </section>
    );
}

function DissolveBlock({
    partnership,
    onDissolved,
}: {
    readonly partnership: AdminPartnershipDetails;
    readonly onDissolved: () => void;
}) {
    const { t } = useTranslation();
    const dissolve = useDissolveAdminPartnership();
    const [confirming, setConfirming] = useState(false);
    const submit = () =>
        dissolve.mutate(
            { partnershipId: partnership.partnershipId },
            {
                onSuccess: () => {
                    toast.success(t("adminPartnerships.success.dissolved"));
                    setConfirming(false);
                    onDissolved();
                },
            },
        );
    return (
        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-md p-5 shadow-[inset_0_0_0_1px_var(--oxblood)]">
            <h3 className={cn(ADMIN_SECTION_TITLE_CLASS, "text-[22px] text-oxblood")}>
                {t("adminPartnerships.dissolution.title")}
            </h3>
            <button
                type="button"
                onClick={() => {
                    dissolve.reset();
                    setConfirming(true);
                }}
                className={ADMIN_DANGER_OUTLINE_CLASS}
            >
                {t("adminPartnerships.actions.dissolve")}
            </button>
            <AdminConfirmDialog
                open={confirming}
                onOpenChange={setConfirming}
                title={t("adminPartnerships.dissolution.confirmQuestion")}
                description={t("adminPartnerships.dissolution.removes", {
                    memberships: t("adminPartnerships.dissolution.memberships", {
                        count: partnership.memberCount,
                    }),
                    grants: t("adminPartnerships.dissolution.grants", {
                        count: partnership.listingSourceGrantCount,
                    }),
                })}
                confirmLabel={t("adminPartnerships.actions.confirmDissolve")}
                pending={dissolve.isPending}
                error={dissolve.error?.message}
                onConfirm={submit}
            />
        </div>
    );
}
