import { KeyRound, Plug, Plus, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import type { ConnectedApp } from "@/data/internal/access-tokens/OwnCredentials.ts";
import {
    useDeleteAccessToken,
    useDeleteAllAccessTokens,
    useDisconnectConnectedApp,
    useOwnCredentials,
} from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenEditDialog } from "@/features/partner/access-token-management/components/AccessTokenEditDialog.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import { PartnerPageHeader } from "@/features/partner/common/components/PartnerPageHeader.tsx";
import { PartnerStatePanel } from "@/features/partner/common/components/PartnerStatePanel.tsx";
import {
    DANGER_OUTLINE_PILL_CLASS,
    DANGER_PILL_CLASS,
    DIALOG_CONTENT_CLASS,
    DIALOG_DESCRIPTION_CLASS,
    DIALOG_TITLE_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SECTION_HEADING_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";
import {
    sortAccessTokens,
    type AccessTokenWithExpiry,
    useClientNow,
} from "../lib/accessTokenExpiry.ts";
import {
    getConnectedAppExpiry,
    getConnectedAppKind,
    sortConnectedApps,
} from "../lib/connectedApps.ts";
import { AccessTokenRow } from "./AccessTokenRow.tsx";
import { ConnectedAppRow } from "./ConnectedAppRow.tsx";

const CONNECTED_APPS_HEADING_ID = "partner-connected-apps";
const PERSONAL_TOKENS_HEADING_ID = "partner-personal-access-tokens";

/**
 * Everything that can act for the account, from one listing: connected apps, then personal access
 * tokens (boards "Partner dashboard · Access tokens" and "Access tokens — states").
 */
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
    const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
    const { data, dataUpdatedAt, isPending, isError, refetch } = useOwnCredentials();
    const accessTokens = data?.personalTokens ?? [];
    // Expiry depends on the clock, so it is resolved after mount and on each refetch, not during render.
    const now = useClientNow(dataUpdatedAt);
    const sorted = sortAccessTokens(accessTokens, now, i18n.language);
    const active = sorted.filter((entry) => entry.expiry !== "expired");
    const expired = sorted.filter((entry) => entry.expiry === "expired");
    const deleteAccessToken = useDeleteAccessToken();
    const deleteAllAccessTokens = useDeleteAllAccessTokens();
    const disconnectApp = useDisconnectConnectedApp();
    const actionsDisabled =
        deleteAccessToken.isPending || deleteAllAccessTokens.isPending || disconnectApp.isPending;

    const displayName = (app: ConnectedApp) =>
        getConnectedAppKind(app) === "browser"
            ? t("partnerAccessTokens.connectedApps.browserAgentsName")
            : app.client.name;
    const connectedApps = sortConnectedApps(data?.connectedApps ?? [], displayName, i18n.language);

    const disconnect = (app: ConnectedApp) => {
        const name = displayName(app);
        disconnectApp.mutate(app.client.clientId, {
            onSuccess: () => {
                toast.success(t("partnerAccessTokens.connectedApps.disconnect.success", { name }));
                setDisconnectTarget(null);
            },
            onError: () => {
                toast.error(t("partnerAccessTokens.connectedApps.disconnect.error", { name }));
            },
        });
    };

    const renderGroup = (
        id: string,
        title: string,
        count: string,
        entries: AccessTokenWithExpiry[],
    ) => (
        <div role="group" aria-labelledby={id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h3 id={id} className="text-[15px] font-medium">
                    {title}
                </h3>
                <span className="font-mono text-[11px] tracking-[0.14em] text-ink-muted uppercase">
                    {count}
                </span>
            </div>
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
        </div>
    );

    let content: ReactNode;
    if (isPending) {
        content = (
            <output aria-busy="true" className="flex flex-col gap-12 sm:gap-16">
                <span className="sr-only">{t("partnerAccessTokens.loading")}</span>
                <CredentialSection
                    id={CONNECTED_APPS_HEADING_ID}
                    titleKey="partnerAccessTokens.connectedApps.heading"
                >
                    <CredentialRowsSkeleton />
                </CredentialSection>
                <CredentialSection
                    id={PERSONAL_TOKENS_HEADING_ID}
                    titleKey="partnerAccessTokens.personal.heading"
                    ruled
                >
                    <CredentialRowsSkeleton />
                </CredentialSection>
            </output>
        );
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
    } else {
        content = (
            <>
                <CredentialSection
                    id={CONNECTED_APPS_HEADING_ID}
                    titleKey="partnerAccessTokens.connectedApps.heading"
                    lead={t("partnerAccessTokens.connectedApps.lead")}
                    aside={
                        connectedApps.length > 0 && (
                            <span className="font-mono text-[11px] tracking-[0.14em] text-ink-muted uppercase">
                                {t("partnerAccessTokens.connectedApps.count", {
                                    count: connectedApps.length,
                                })}
                            </span>
                        )
                    }
                >
                    {connectedApps.length > 0 ? (
                        <ul className="border-t border-line">
                            {connectedApps.map((app) => {
                                const clientId = app.client.clientId;
                                const confirming = disconnectTarget === clientId;
                                return (
                                    <ConnectedAppRow
                                        key={clientId}
                                        app={app}
                                        kind={getConnectedAppKind(app)}
                                        displayName={displayName(app)}
                                        expiry={getConnectedAppExpiry(app, now)}
                                        confirming={confirming}
                                        pending={confirming && disconnectApp.isPending}
                                        actionsDisabled={actionsDisabled}
                                        onDisconnect={() => setDisconnectTarget(clientId)}
                                        onCancel={() => setDisconnectTarget(null)}
                                        onConfirm={() => disconnect(app)}
                                    />
                                );
                            })}
                        </ul>
                    ) : (
                        <SectionEmptyState
                            icon={Plug}
                            title={t("partnerAccessTokens.connectedApps.empty.title")}
                            description={t("partnerAccessTokens.connectedApps.empty.description")}
                        />
                    )}
                </CredentialSection>
                <CredentialSection
                    id={PERSONAL_TOKENS_HEADING_ID}
                    titleKey="partnerAccessTokens.personal.heading"
                    lead={t("partnerAccessTokens.personal.lead")}
                    aside={
                        <button
                            type="button"
                            className={cn(PRIMARY_PILL_CLASS, "w-full sm:w-auto")}
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                            {t("partnerAccessTokens.create.open")}
                        </button>
                    }
                    ruled
                >
                    {accessTokens.length === 0 ? (
                        <SectionEmptyState
                            icon={KeyRound}
                            title={t("partnerAccessTokens.personal.empty.title")}
                            description={t("partnerAccessTokens.personal.empty.description")}
                        />
                    ) : (
                        <>
                            {active.length > 0 &&
                                renderGroup(
                                    "partner-access-tokens-active",
                                    t("partnerAccessTokens.groups.active"),
                                    t("partnerAccessTokens.groups.activeCount", {
                                        count: active.length,
                                    }),
                                    active,
                                )}
                            {expired.length > 0 &&
                                renderGroup(
                                    "partner-access-tokens-expired",
                                    t("partnerAccessTokens.groups.expired"),
                                    t("partnerAccessTokens.groups.expiredCount", {
                                        count: expired.length,
                                    }),
                                    expired,
                                )}
                            <div
                                role="group"
                                aria-labelledby="partner-access-tokens-delete-all"
                                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-panel px-6 py-5 shadow-[inset_0_0_0_1px_var(--line)]"
                            >
                                <div className="flex max-w-[520px] flex-col gap-1">
                                    <h3
                                        id="partner-access-tokens-delete-all"
                                        className="text-[15px] font-medium"
                                    >
                                        {t("partnerAccessTokens.deleteAll.heading")}
                                    </h3>
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
                                    <Trash2
                                        aria-hidden="true"
                                        className="size-4"
                                        strokeWidth={1.7}
                                    />
                                    {t("partnerAccessTokens.deleteAll.openEllipsis")}
                                </button>
                            </div>
                        </>
                    )}
                </CredentialSection>
            </>
        );
    }

    return (
        <>
            <PartnerPageHeader
                titleKey="partnerAccessTokens.heading"
                lead={t("partnerAccessTokens.lead")}
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

function CredentialSection({
    id,
    titleKey,
    lead,
    aside,
    ruled = false,
    children,
}: {
    readonly id: string;
    readonly titleKey: string;
    readonly lead?: string;
    readonly aside?: ReactNode;
    readonly ruled?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={id}
            className={cn(
                "flex flex-col gap-5",
                ruled && "gap-7 border-t border-line pt-10 sm:pt-14",
            )}
        >
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                <div className="flex max-w-[620px] flex-col gap-2">
                    <h2 id={id} className={SECTION_HEADING_CLASS}>
                        <Trans i18nKey={titleKey} components={HEADLINE_COMPONENTS} />
                    </h2>
                    {lead && <p className="text-sm leading-[1.6] text-ink-secondary">{lead}</p>}
                </div>
                {aside}
            </div>
            {children}
        </section>
    );
}

/** A section's quiet empty state: a hairline panel with an icon tile. */
function SectionEmptyState({
    icon: Icon,
    title,
    description,
}: {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
}) {
    return (
        <div className="flex items-start gap-4 rounded-panel px-6 py-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-muted"
            >
                <Icon className="size-[18px]" strokeWidth={1.7} />
            </span>
            <div className="flex flex-col gap-1">
                <p className="text-[15px] font-medium">{title}</p>
                <p className="text-sm leading-[1.55] text-ink-secondary">{description}</p>
            </div>
        </div>
    );
}

function CredentialRowsSkeleton() {
    return (
        <ul className="border-t border-line">
            {["credential-skeleton-1", "credential-skeleton-2"].map((id) => (
                <li
                    key={id}
                    className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-5 border-b border-line-subtle py-[18px] sm:grid-cols-[40px_minmax(0,1fr)_190px] sm:px-2"
                >
                    <span className="size-10 animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none" />
                    <span className="flex flex-col gap-2.5">
                        <span className="h-4 w-[40%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                        <span className="h-2.5 w-[28%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                        <span className="flex gap-1.5">
                            <span className="h-6 w-28 animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                            <span className="h-6 w-32 animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                        </span>
                    </span>
                    <span className="hidden flex-col gap-2.5 pt-1 sm:flex">
                        <span className="h-2.5 animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                        <span className="h-2.5 w-[70%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                    </span>
                </li>
            ))}
        </ul>
    );
}
