import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AdminOAuthClient,
    AdminOAuthClientFilters,
} from "@/data/internal/admin/AdminOAuthClient.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { formatDateTime } from "@/lib/utils.ts";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogLoadingState,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    useAdminOAuthClient,
    useAdminOAuthClients,
    useDeleteAdminOAuthClient,
} from "../api/useAdminOAuthClients.ts";
import { AdminOAuthClientFiltersForm } from "../components/AdminOAuthClientFiltersForm.tsx";
import { AdminOAuthClientFormDialog } from "../components/AdminOAuthClientFormDialog.tsx";

export function AdminOAuthClientsPage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<AdminOAuthClientFilters>({});
    const [selectedClientId, setSelectedClientId] = useState<string>();
    const [formOpen, setFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<AdminOAuthClient>();
    const clientsQuery = useAdminOAuthClients(filters);
    const clients = clientsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const total = clientsQuery.data?.pages[0]?.total;

    let content: ReactNode;
    if (clientsQuery.error && clients.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{clientsQuery.error.message}</p>
                <Button variant="outline" onClick={() => clientsQuery.refetch()}>
                    {t("adminOAuthClients.actions.retry")}
                </Button>
            </div>
        );
    } else if (clientsQuery.isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminOAuthClients.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        );
    } else if (clients.length === 0) {
        content = <p className="py-6 text-muted-foreground">{t("adminOAuthClients.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                {typeof total === "number" && (
                    <p className="text-sm text-muted-foreground">
                        {t("adminOAuthClients.list.total", { count: total })}
                    </p>
                )}
                <ul className="grid gap-2">
                    {clients.map((client) => (
                        <OAuthClientRow
                            key={client.clientId}
                            client={client}
                            onOpen={() => setSelectedClientId(client.clientId)}
                        />
                    ))}
                </ul>
                {clientsQuery.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {clientsQuery.error.message}
                    </p>
                )}
                {clientsQuery.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={clientsQuery.isFetchingNextPage}
                        onClick={() => clientsQuery.fetchNextPage()}
                    >
                        {clientsQuery.isFetchingNextPage
                            ? t("adminOAuthClients.list.loadingMore")
                            : t("adminOAuthClients.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <section className="grid gap-6" aria-labelledby="admin-oauth-clients-title">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <H1 id="admin-oauth-clients-title">{t("adminOAuthClients.title")}</H1>
                        <p className="text-muted-foreground">
                            {t("adminOAuthClients.description")}
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingClient(undefined);
                            setFormOpen(true);
                        }}
                    >
                        {t("adminOAuthClients.actions.create")}
                    </Button>
                </header>

                <AdminOAuthClientFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={setFilters}
                />
                {content}
            </section>

            <AdminOAuthClientDetailDialog
                clientId={selectedClientId}
                open={Boolean(selectedClientId)}
                onOpenChange={(open) => {
                    if (!open) setSelectedClientId(undefined);
                }}
                onEdit={(client) => {
                    setSelectedClientId(undefined);
                    setEditingClient(client);
                    setFormOpen(true);
                }}
                onDeleted={() => setSelectedClientId(undefined)}
            />
            <AdminOAuthClientFormDialog
                key={editingClient?.clientId ?? "create"}
                mode={editingClient ? "edit" : "create"}
                client={editingClient}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}

function OAuthClientRow({
    client,
    onOpen,
}: {
    readonly client: AdminOAuthClient;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    const issueDate = new Date(client.clientIdIssuedAt * 1000);
    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-2">
                <p className="break-words font-medium">{client.clientName}</p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                    {client.clientId}
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t("adminOAuthClients.list.issued", {
                            date: formatDateTime(issueDate, i18n.language, "UTC"),
                        })}
                    </span>
                    {client.scopes.map((scope) => (
                        <span key={scope}>{t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}</span>
                    ))}
                    {client.scopes.length === 0 && (
                        <span>{t("adminOAuthClients.list.noScopes")}</span>
                    )}
                </div>
            </div>
            <Button type="button" variant="outline" onClick={onOpen}>
                {t("adminOAuthClients.actions.details")}
            </Button>
        </li>
    );
}

function AdminOAuthClientDetailDialog({
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
    const { t } = useTranslation();
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

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="flex h-[min(90vh,32rem)] flex-col overflow-y-auto sm:max-w-2xl"
                    closeLabel={t("adminOAuthClients.actions.close")}
                    onCloseAutoFocus={releaseClientId}
                >
                    <DialogHeader>
                        <DialogTitle>{t("adminOAuthClients.detail.title")}</DialogTitle>
                        <DialogDescription>
                            {t("adminOAuthClients.detail.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <AdminOAuthClientDetailContent query={query} />

                    {deletion.error && (
                        <p role="alert" className="text-sm text-destructive">
                            {deletion.error.message}
                        </p>
                    )}
                    {client && (
                        <DialogFooter className="mt-auto flex-wrap sm:justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setConfirmDelete(true)}
                            >
                                {t("adminOAuthClients.actions.delete")}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    deletion.reset();
                                    onEdit(client);
                                }}
                            >
                                {t("adminOAuthClients.actions.edit")}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("adminOAuthClients.delete.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("adminOAuthClients.delete.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("adminOAuthClients.actions.cancel")}
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deletion.isPending}
                            onClick={confirmDeletion}
                        >
                            {deletion.isPending
                                ? t("adminOAuthClients.actions.deleting")
                                : t("adminOAuthClients.delete.confirm")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function AdminOAuthClientDetailContent({
    query,
}: {
    readonly query: ReturnType<typeof useAdminOAuthClient>;
}) {
    const { t, i18n } = useTranslation();
    if (query.isPending) {
        return <DialogLoadingState>{t("adminOAuthClients.loadingDetail")}</DialogLoadingState>;
    }
    if (query.error) {
        return (
            <div className="grid justify-items-start gap-3" role="alert">
                <p className="text-muted-foreground">{query.error.message}</p>
                <Button variant="outline" onClick={() => query.refetch()}>
                    {t("adminOAuthClients.actions.retry")}
                </Button>
            </div>
        );
    }
    const client = query.data;
    if (!client) return null;
    const issueDate = new Date(client.clientIdIssuedAt * 1000);
    return (
        <dl className="grid gap-4 sm:grid-cols-2">
            <DetailValue label={t("adminOAuthClients.fields.name")}>
                {client.clientName}
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.clientId")}>
                <span className="break-all font-mono">{client.clientId}</span>
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.terms")}>
                <span className="break-all">{client.tosUri}</span>
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.privacy")}>
                <span className="break-all">{client.policyUri}</span>
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.homepage")}>
                <span className="break-all">{client.clientUri}</span>
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.logo")}>
                <span className="break-all">{client.logoUri}</span>
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.issuedAt")}>
                {formatDateTime(issueDate, i18n.language, "UTC")}
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.scopes")}>
                {client.scopes.length ? (
                    <ul className="grid gap-1">
                        {client.scopes.map((scope) => (
                            <li key={scope}>{t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}</li>
                        ))}
                    </ul>
                ) : (
                    t("adminOAuthClients.list.noScopes")
                )}
            </DetailValue>
            <DetailValue label={t("adminOAuthClients.fields.redirectUris")}>
                <ul className="grid gap-1">
                    {client.redirectUris.map((uri) => (
                        <li key={uri} className="break-all font-mono text-xs">
                            {uri}
                        </li>
                    ))}
                </ul>
            </DetailValue>
        </dl>
    );
}

function DetailValue({
    label,
    children,
}: {
    readonly label: string;
    readonly children: ReactNode;
}) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}
