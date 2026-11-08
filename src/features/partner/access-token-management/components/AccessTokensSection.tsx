import { KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import {
    useAccessTokens,
    useDeleteAccessToken,
    useDeleteAllAccessTokens,
} from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenEditDialog } from "@/features/partner/access-token-management/components/AccessTokenEditDialog.tsx";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import { PartnerPageHeader } from "@/features/partner/common/components/PartnerPageHeader.tsx";
import {
    PartnerListHeading,
    PartnerStatePanel,
} from "@/features/partner/common/components/PartnerStatePanel.tsx";
import {
    DANGER_OUTLINE_PILL_CLASS,
    DANGER_PILL_CLASS,
    DIALOG_CONTENT_CLASS,
    DIALOG_DESCRIPTION_CLASS,
    DIALOG_TITLE_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";
import {
    sortAccessTokens,
    type AccessTokenWithExpiry,
    useClientNow,
} from "../lib/accessTokenExpiry.ts";
import { AccessTokenRow } from "./AccessTokenRow.tsx";

export function AccessTokensSection({
    createOpen: createOpenProp,
    onCreateOpenChange,
}: {
    /** Opens the create dialog, e.g. from a link on the overview. */
    readonly createOpen?: boolean;
    readonly onCreateOpenChange?: (open: boolean) => void;
} = {}) {
    const { t, i18n } = useTranslation();
    const [createOpenState, setCreateOpenState] = useState(false);
    const createOpen = createOpenProp ?? createOpenState;
    const setCreateOpen = (open: boolean) => {
        setCreateOpenState(open);
        onCreateOpenChange?.(open);
    };
    const [editTarget, setEditTarget] = useState<AccessToken | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AccessToken | null>(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const {
        data: accessTokens = [],
        dataUpdatedAt,
        isPending,
        isError,
        refetch,
    } = useAccessTokens();
    // Expiry depends on the clock, so it is resolved after mount and on each refetch, not during render.
    const now = useClientNow(dataUpdatedAt);
    const sorted = sortAccessTokens(accessTokens, now, i18n.language);
    const active = sorted.filter((entry) => entry.expiry !== "expired");
    const expired = sorted.filter((entry) => entry.expiry === "expired");
    const deleteAccessToken = useDeleteAccessToken();
    const deleteAllAccessTokens = useDeleteAllAccessTokens();
    const actionsDisabled = deleteAccessToken.isPending || deleteAllAccessTokens.isPending;

    const renderGroup = (
        id: string,
        title: string,
        count: string,
        entries: AccessTokenWithExpiry[],
    ) => (
        <section aria-labelledby={id} className="flex flex-col gap-4">
            <PartnerListHeading id={id} title={title} count={count} />
            <ul className="border-t border-line">
                {entries.map(({ accessToken, expiry }) => (
                    <AccessTokenRow
                        key={accessToken.id}
                        accessToken={accessToken}
                        expiry={expiry}
                        actionsDisabled={actionsDisabled}
                        onEdit={() => setEditTarget(accessToken)}
                        onDelete={() => setDeleteTarget(accessToken)}
                    />
                ))}
            </ul>
        </section>
    );

    let content: ReactNode;
    if (isPending) {
        content = <AccessTokensSkeleton />;
    } else if (isError) {
        content = (
            <PartnerStatePanel
                tone="error"
                titleKey="partnerAccessTokens.loadErrorHeading"
                description={t("partnerAccessTokens.loadErrorDescription")}
            >
                <button type="button" className={SECONDARY_PILL_CLASS} onClick={() => refetch()}>
                    {t("partnerDashboard.tryAgain")}
                </button>
            </PartnerStatePanel>
        );
    } else if (accessTokens.length === 0) {
        content = (
            <PartnerStatePanel
                tone="empty"
                icon={KeyRound}
                titleKey="partnerAccessTokens.emptyHeading"
                description={t("partnerAccessTokens.emptyDescription")}
            >
                <button
                    type="button"
                    className={PRIMARY_PILL_CLASS}
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    {t("partnerAccessTokens.create.open")}
                </button>
            </PartnerStatePanel>
        );
    } else {
        content = (
            <>
                {active.length > 0 &&
                    renderGroup(
                        "partner-access-tokens-active",
                        t("partnerAccessTokens.groups.active"),
                        t("partnerAccessTokens.groups.activeCount", { count: active.length }),
                        active,
                    )}
                {expired.length > 0 &&
                    renderGroup(
                        "partner-access-tokens-expired",
                        t("partnerAccessTokens.groups.expired"),
                        t("partnerAccessTokens.groups.expiredCount", { count: expired.length }),
                        expired,
                    )}
                <section
                    aria-labelledby="partner-access-tokens-delete-all"
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-panel px-6 py-5 shadow-[inset_0_0_0_1px_var(--line)]"
                >
                    <div className="flex max-w-[520px] flex-col gap-1">
                        <h2
                            id="partner-access-tokens-delete-all"
                            className="text-[15px] font-medium"
                        >
                            {t("partnerAccessTokens.deleteAll.heading")}
                        </h2>
                        <p className="text-meta text-ink-secondary">
                            {t("partnerAccessTokens.deleteAll.lead")}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={cn(DANGER_OUTLINE_PILL_CLASS, "w-full sm:w-auto")}
                        disabled={actionsDisabled}
                        onClick={() => setDeleteAllOpen(true)}
                    >
                        <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.7} />
                        {t("partnerAccessTokens.deleteAll.openEllipsis")}
                    </button>
                </section>
            </>
        );
    }

    return (
        <>
            <PartnerPageHeader
                titleKey="partnerAccessTokens.heading"
                lead={t("partnerAccessTokens.lead")}
                action={
                    <button
                        type="button"
                        className={PRIMARY_PILL_CLASS}
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("partnerAccessTokens.create.open")}
                    </button>
                }
            />
            {content}
            {createOpen && (
                <AccessTokenCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            )}
            <AccessTokenEditDialog
                accessToken={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
            />
            <DeleteConfirmationDialog
                open={deleteTarget !== null}
                isPending={deleteAccessToken.isPending}
                title={t("partnerAccessTokens.delete.heading", { name: deleteTarget?.name })}
                description={t("partnerAccessTokens.delete.lead")}
                confirmLabel={t("partnerAccessTokens.delete.confirmShort")}
                pendingLabel={t("partnerAccessTokens.delete.pending")}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    deleteAccessToken.mutate(deleteTarget.id, {
                        onSuccess: () => {
                            toast.success(t("partnerAccessTokens.delete.success"));
                            setDeleteTarget(null);
                        },
                    });
                }}
            />
            <DeleteConfirmationDialog
                open={deleteAllOpen}
                isPending={deleteAllAccessTokens.isPending}
                title={t("partnerAccessTokens.deleteAll.confirmTitle", {
                    count: accessTokens.length,
                })}
                description={t("partnerAccessTokens.deleteAll.confirmDescription", {
                    count: accessTokens.length,
                })}
                confirmLabel={t("partnerAccessTokens.deleteAll.confirmAll", {
                    count: accessTokens.length,
                })}
                pendingLabel={t("partnerAccessTokens.delete.pending")}
                onOpenChange={setDeleteAllOpen}
                onConfirm={() => {
                    deleteAllAccessTokens.mutate(
                        accessTokens.map((accessToken) => accessToken.id),
                        {
                            onSuccess: () => {
                                toast.success(t("partnerAccessTokens.deleteAll.success"));
                                setDeleteAllOpen(false);
                            },
                        },
                    );
                }}
            />
        </>
    );
}

function DeleteConfirmationDialog({
    open,
    isPending,
    title,
    description,
    confirmLabel,
    pendingLabel,
    onOpenChange,
    onConfirm,
}: {
    readonly open: boolean;
    readonly isPending: boolean;
    readonly title: string;
    readonly description: string;
    readonly confirmLabel: string;
    readonly pendingLabel: string;
    readonly onOpenChange: (open: boolean) => void;
    readonly onConfirm: () => void;
}) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
            <DialogContent
                role="alertdialog"
                showCloseButton={false}
                aria-busy={isPending}
                className={cn(DIALOG_CONTENT_CLASS, "gap-5 p-7 sm:max-w-[520px]")}
            >
                <div className="flex flex-col gap-2">
                    <DialogTitle className={DIALOG_TITLE_CLASS}>{title}</DialogTitle>
                    <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                        {description}
                    </DialogDescription>
                </div>
                <div className="flex flex-wrap justify-end gap-2.5">
                    <button
                        type="button"
                        className={SECONDARY_PILL_CLASS}
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        {t("partnerAccessTokens.delete.cancel")}
                    </button>
                    <button
                        type="button"
                        className={DANGER_PILL_CLASS}
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending && <Spinner aria-hidden="true" />}
                        {isPending ? pendingLabel : confirmLabel}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AccessTokensSkeleton() {
    const { t } = useTranslation();
    return (
        <div role="status" aria-busy="true">
            <span className="sr-only">{t("partnerAccessTokens.loading")}</span>
            <ul className="border-t border-line">
                {["access-token-skeleton-1", "access-token-skeleton-2"].map((id) => (
                    <li
                        key={id}
                        className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-5 border-b border-line-subtle py-[18px] sm:grid-cols-[40px_minmax(0,1fr)_210px] sm:px-2"
                    >
                        <span className="size-10 animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none" />
                        <span className="flex flex-col gap-2.5">
                            <span className="h-4 w-[40%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                            <span className="flex gap-1.5">
                                <span className="h-6 w-28 animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                                <span className="h-6 w-32 animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                            </span>
                        </span>
                        <span className="hidden h-2.5 animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none sm:block" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
