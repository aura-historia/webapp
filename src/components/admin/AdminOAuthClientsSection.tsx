import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";
import { AdminOAuthClientCreateDialog } from "@/components/admin/AdminOAuthClientCreateDialog.tsx";
import { AdminOAuthClientEditDialog } from "@/components/admin/AdminOAuthClientEditDialog.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import { useDeleteOAuthClient } from "@/hooks/admin/useAdminOAuthClientActions.ts";
import { useAdminOAuthClients } from "@/hooks/admin/useAdminOAuthClients.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { toast } from "sonner";

export function AdminOAuthClientsSection() {
    const { t, i18n } = useTranslation();
    const { data, isPending, isError, refetch } = useAdminOAuthClients();
    const deleteClient = useDeleteOAuthClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<OAuthClient | null>(null);
    const handleDelete = (client: OAuthClient) => {
        const confirmed = window.confirm(
            t("adminDashboard.oauthClients.deleteConfirm", {
                client: client.clientName,
            }),
        );
        if (!confirmed) {
            return;
        }

        deleteClient.mutate(client.clientId, {
            onSuccess: () => {
                toast.success(t("adminDashboard.oauthClients.deleteSuccess"));
            },
        });
    };

    const renderClients = () => {
        if (isPending) {
            return (
                <div className="flex justify-center py-10" role="status" aria-live="polite">
                    <Spinner />
                </div>
            );
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.oauthClients.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        {t("adminDashboard.actions.retry")}
                    </Button>
                </div>
            );
        }

        if ((data?.length ?? 0) === 0) {
            return (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {t("adminDashboard.oauthClients.empty")}
                </p>
            );
        }

        return (
            <ul className="flex flex-col gap-3">
                {data?.map((client) => (
                    <li
                        key={client.clientId}
                        className="rounded-md border bg-surface-container-low p-4"
                    >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div className="flex min-w-0 flex-1 gap-4">
                                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted sm:block">
                                    <ImageWithFallback
                                        src={client.logoUri}
                                        alt={t("adminDashboard.oauthClients.logoAlt", {
                                            client: client.clientName,
                                        })}
                                        className="h-full w-full"
                                        showErrorMessage={false}
                                    />
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-medium">
                                            {client.clientName}
                                        </span>
                                        {client.scope.map((scope) => (
                                            <Badge key={scope} variant="outline">
                                                {scope}
                                            </Badge>
                                        ))}
                                    </div>
                                    <span
                                        className="text-sm text-muted-foreground"
                                        suppressHydrationWarning
                                    >
                                        {t("adminDashboard.oauthClients.createdAt", {
                                            date: formatShortDate(client.createdAt, i18n.language),
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditTarget(client)}
                                    aria-label={t("adminDashboard.oauthClients.editAriaLabel", {
                                        client: client.clientName,
                                    })}
                                    disabled={deleteClient.isPending}
                                >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                    {t("adminDashboard.actions.edit")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(client)}
                                    aria-label={t("adminDashboard.oauthClients.deleteAriaLabel", {
                                        client: client.clientName,
                                    })}
                                    disabled={deleteClient.isPending}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    {t("adminDashboard.oauthClients.actions.delete")}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.oauthClients.clientId")}
                                </span>
                                <span className="break-all font-mono text-sm">
                                    {client.clientId}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.oauthClients.scope")}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {client.scope.length > 0 ? (
                                        client.scope.map((scope) => (
                                            <Badge key={scope} variant="secondary">
                                                {scope}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </div>
                            </div>

                            {[
                                {
                                    key: "client-uri",
                                    label: t("adminDashboard.oauthClients.fields.clientUri"),
                                    value: client.clientUri,
                                },
                                {
                                    key: "logo-uri",
                                    label: t("adminDashboard.oauthClients.fields.logoUri"),
                                    value: client.logoUri,
                                },
                                {
                                    key: "tos-uri",
                                    label: t("adminDashboard.oauthClients.fields.tosUri"),
                                    value: client.tosUri,
                                },
                                {
                                    key: "policy-uri",
                                    label: t("adminDashboard.oauthClients.fields.policyUri"),
                                    value: client.policyUri,
                                },
                            ].map((item) => (
                                <div key={item.key} className="flex flex-col gap-1">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <a
                                        href={item.value}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="break-all text-sm underline underline-offset-2"
                                        title={item.value}
                                    >
                                        {item.value}
                                    </a>
                                </div>
                            ))}

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.oauthClients.redirectUris")}
                                </span>
                                {client.redirectUris.length > 0 ? (
                                    <ul className="flex flex-col gap-1 text-sm">
                                        {client.redirectUris.map((uri) => (
                                            <li
                                                key={uri}
                                                className="flex items-start gap-2 break-all"
                                            >
                                                <Globe
                                                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <span>{uri}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-sm text-muted-foreground">—</span>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                    <H1>{t("adminDashboard.oauthClients.title")}</H1>
                    <p className="text-base text-muted-foreground">
                        {t("adminDashboard.oauthClients.description")}
                    </p>
                </div>
                <Button type="button" onClick={() => setCreateOpen(true)}>
                    {t("adminDashboard.oauthClients.actions.create")}
                </Button>
            </header>

            {renderClients()}

            <AdminOAuthClientCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            <AdminOAuthClientEditDialog
                client={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditTarget(null);
                    }
                }}
            />
        </section>
    );
}
