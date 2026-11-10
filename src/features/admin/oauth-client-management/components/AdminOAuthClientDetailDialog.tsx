import { Loader2, TriangleAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type { AdminOAuthClient } from "@/data/internal/admin/AdminOAuthClient.ts";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_TAG_CLASS,
    DANGER_PILL_CLASS,
    MONO_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminOAuthClient, useDeleteAdminOAuthClient } from "../api/useAdminOAuthClients.ts";
import { formatAdminDateTime } from "../lib/formatAdminOAuthClientDate.ts";

/**
 * An OAuth client's record dialog (board "Admin · OAuth client dialogs", details): metadata links,
 * allowed scopes, redirect URIs, delete (with its own confirmation) and edit. Secrets never appear.
 */
export function AdminOAuthClientDetailDialog({
    clientId: requestedClientId,
    open,
    onOpenChange,
    onEdit,
    onDeleted,
}: {
    readonly clientId?: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onEdit: (client: AdminOAuthClient) => void;
    readonly onDeleted: () => void;
}) {
    const { t, i18n } = useTranslation();
    const [clientId, releaseClientId] = useRetainedDialogValue(requestedClientId, open);
    const query = useAdminOAuthClient(clientId, open);
    const deletion = useDeleteAdminOAuthClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const client = query.data;

    // A failed deletion belongs to the client it was attempted on, not the next one opened.
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) deletion.reset();
        onOpenChange(nextOpen);
    };

    const confirmDeletion = async () => {
        if (!clientId) return;
        try {
            await deletion.mutateAsync(clientId);
            setConfirmDelete(false);
            toast.success(t("adminOAuthClients.success.deleted"));
            onDeleted();
        } catch {
            setConfirmDelete(false);
        }
    };

    let body: ReactNode;
    if (query.error) {
        body = (
            <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3.5 rounded-md bg-surface p-4 shadow-ring"
            >
                <span className="flex gap-2.5 text-sm text-oxblood">
                    <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                        strokeWidth={2}
                    />
                    {query.error.message}
                </span>
                <button
                    type="button"
                    onClick={() => void query.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    } else if (!client) {
        body = (
            <div aria-busy="true" className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                    {[0, 1, 2, 3].map((index) => (
                        <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")} />
                    ))}
                </div>
                <p role="status" className="text-meta text-ink-secondary">
                    {t("adminOAuthClients.loadingDetail")}
                </p>
            </div>
        );
    } else {
        const links = [
            {
                key: "homepage",
                label: t("adminOAuthClients.fields.homepageShort"),
                value: client.clientUri,
            },
            { key: "terms", label: t("adminOAuthClients.fields.termsShort"), value: client.tosUri },
            {
                key: "privacy",
                label: t("adminOAuthClients.fields.privacyShort"),
                value: client.policyUri,
            },
            { key: "logo", label: t("adminOAuthClients.fields.logo"), value: client.logoUri },
        ];
        body = (
            <>
                <dl className="border-t border-line">
                    {links.map((link) => (
                        <div
                            key={link.key}
                            className="grid grid-cols-1 items-baseline gap-1 border-b border-line-subtle py-2.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-3"
                        >
                            <dt className="text-meta text-ink-secondary">{link.label}</dt>
                            <dd className="text-meta break-all">{link.value}</dd>
                        </div>
                    ))}
                </dl>
                <section className="flex flex-col gap-2">
                    <h3 className={MONO_LABEL_CLASS}>
                        {t("adminOAuthClients.fields.scopes")} · {client.scopes.length}
                    </h3>
                    {client.scopes.length > 0 ? (
                        <ul className="flex flex-wrap gap-1">
                            {client.scopes.map((scope) => (
                                <li key={scope} className={ADMIN_TAG_CLASS}>
                                    {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-meta text-ink-muted">
                            {t("adminOAuthClients.list.noScopes")}
                        </p>
                    )}
                </section>
                <section className="flex flex-col gap-2">
                    <h3 className={MONO_LABEL_CLASS}>
                        {t("adminOAuthClients.fields.redirectUris")} · {client.redirectUris.length}
                    </h3>
                    <ul className="border-t border-line-subtle">
                        {client.redirectUris.map((uri) => (
                            <li key={uri} className="border-b border-line-subtle py-2">
                                <code className="font-mono text-xs break-all">{uri}</code>
                            </li>
                        ))}
                    </ul>
                </section>
                {deletion.error && (
                    <p role="alert" className="text-meta text-oxblood">
                        {deletion.error.message}
                    </p>
                )}
                <div className="flex flex-wrap justify-between gap-2.5">
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className={ADMIN_DANGER_OUTLINE_CLASS}
                    >
                        {t("adminOAuthClients.actions.delete")}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            deletion.reset();
                            onEdit(client);
                        }}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {t("adminOAuthClients.actions.edit")}
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminRecordDialog
                open={open}
                onOpenChange={handleOpenChange}
                eyebrow={t("adminOAuthClients.detail.title")}
                title={
                    client ? (
                        client.clientName
                    ) : (
                        <>
                            <span className="sr-only">{t("adminOAuthClients.loadingDetail")}</span>
                            <span
                                aria-hidden="true"
                                className={cn(ADMIN_SKELETON_CLASS, "block h-8 w-3/5 rounded-sm")}
                            />
                        </>
                    )
                }
                subtitle={
                    client ? (
                        <code className="font-mono text-xs break-all">
                            {t("adminOAuthClients.detail.idIssued", {
                                clientId: client.clientId,
                                date: formatAdminDateTime(
                                    new Date(client.clientIdIssuedAt * 1000),
                                    i18n.language,
                                ),
                            })}
                        </code>
                    ) : undefined
                }
                onCloseAutoFocus={releaseClientId}
            >
                {body}
            </AdminRecordDialog>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent className="gap-5 rounded-panel border-0 bg-surface-raised p-7 text-ink shadow-menu data-[size=default]:sm:max-w-[520px]">
                    <div className="flex flex-col gap-2">
                        <AlertDialogTitle className="font-serif text-[26px] leading-[1.15] font-normal">
                            {t("adminOAuthClients.delete.titleNamed", {
                                name: client?.clientName ?? "",
                            })}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-normal text-ink-secondary">
                            {t("adminOAuthClients.delete.consequence")}
                        </AlertDialogDescription>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2.5">
                        <button
                            type="button"
                            disabled={deletion.isPending}
                            onClick={() => setConfirmDelete(false)}
                            className={SECONDARY_PILL_CLASS}
                        >
                            {t("adminCommon.cancel")}
                        </button>
                        <button
                            type="button"
                            disabled={deletion.isPending}
                            aria-busy={deletion.isPending}
                            onClick={confirmDeletion}
                            className={DANGER_PILL_CLASS}
                        >
                            {deletion.isPending && (
                                <Loader2
                                    aria-hidden="true"
                                    className="size-[15px] animate-spin motion-reduce:animate-none"
                                />
                            )}
                            {t("adminOAuthClients.actions.delete")}
                        </button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
