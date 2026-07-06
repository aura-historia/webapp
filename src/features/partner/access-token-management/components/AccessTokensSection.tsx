import { Clock3, KeyRound, Pencil, Plus, RefreshCw, SearchX, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import {
    useAccessTokens,
    useDeleteAccessToken,
    useDeleteAllAccessTokens,
} from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenCreateDialog } from "@/features/partner/access-token-management/components/AccessTokenCreateDialog.tsx";
import { AccessTokenEditDialog } from "@/features/partner/access-token-management/components/AccessTokenEditDialog.tsx";
import type { AccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { toast } from "sonner";

const SCOPE_TRANSLATION_KEYS = {
    "shops:manage": "partnerAccessTokens.scopes.shopsManage",
    "products:write": "partnerAccessTokens.scopes.productsWrite",
} as const;

export function AccessTokensSection() {
    const { t, i18n } = useTranslation();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AccessToken | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AccessToken | null>(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const { data: accessTokens = [], isPending, isError, refetch } = useAccessTokens();
    const deleteAccessToken = useDeleteAccessToken();
    const deleteAllAccessTokens = useDeleteAllAccessTokens();

    const renderContent = () => {
        if (isPending) {
            return <AccessTokensSkeleton />;
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("partnerAccessTokens.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {t("partnerAccessTokens.actions.retry")}
                    </Button>
                </div>
            );
        }

        if (accessTokens.length === 0) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                        {t("partnerAccessTokens.empty")}
                    </p>
                </div>
            );
        }

        return (
            <ul className="flex flex-col gap-4">
                {accessTokens.map((accessToken) => (
                    <AccessTokenListItem
                        key={accessToken.id}
                        accessToken={accessToken}
                        locale={i18n.language}
                        onEdit={() => setEditTarget(accessToken)}
                        onDelete={() => setDeleteTarget(accessToken)}
                        actionsDisabled={
                            deleteAccessToken.isPending || deleteAllAccessTokens.isPending
                        }
                    />
                ))}
            </ul>
        );
    };

    return (
        <AccessTokensLayout
            hasAccessTokens={accessTokens.length > 0}
            deletionPending={deleteAllAccessTokens.isPending}
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteAllClick={() => setDeleteAllOpen(true)}
        >
            {renderContent()}
            {createDialogOpen && (
                <AccessTokenCreateDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                />
            )}
            <AccessTokenEditDialog
                accessToken={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditTarget(null);
                    }
                }}
            />
            <DeleteConfirmationDialog
                open={deleteTarget !== null}
                isPending={deleteAccessToken.isPending}
                title={t("partnerAccessTokens.delete.title", { name: deleteTarget?.name })}
                description={t("partnerAccessTokens.delete.description")}
                confirmLabel={t("partnerAccessTokens.delete.confirm")}
                cancelLabel={t("partnerAccessTokens.delete.cancel")}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                onConfirm={() => {
                    if (!deleteTarget) {
                        return;
                    }
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
                title={t("partnerAccessTokens.deleteAll.title")}
                description={t("partnerAccessTokens.deleteAll.description", {
                    count: accessTokens.length,
                })}
                confirmLabel={t("partnerAccessTokens.deleteAll.confirm")}
                cancelLabel={t("partnerAccessTokens.deleteAll.cancel")}
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
        </AccessTokensLayout>
    );
}

function AccessTokensLayout({
    children,
    hasAccessTokens,
    deletionPending,
    onCreateClick,
    onDeleteAllClick,
}: {
    readonly children: React.ReactNode;
    readonly hasAccessTokens: boolean;
    readonly deletionPending: boolean;
    readonly onCreateClick: () => void;
    readonly onDeleteAllClick: () => void;
}) {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-access-tokens-title">
            <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-1">
                    <H2 id="partner-access-tokens-title">{t("partnerAccessTokens.title")}</H2>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {t("partnerAccessTokens.description")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!hasAccessTokens || deletionPending}
                        onClick={onDeleteAllClick}
                    >
                        <Trash2 data-icon="inline-start" aria-hidden="true" />
                        {t("partnerAccessTokens.deleteAll.open")}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCreateClick}>
                        <Plus data-icon="inline-start" aria-hidden="true" />
                        {t("partnerAccessTokens.create.open")}
                    </Button>
                </div>
            </header>
            {children}
        </section>
    );
}

function AccessTokenListItem({
    accessToken,
    locale,
    onEdit,
    onDelete,
    actionsDisabled,
}: {
    readonly accessToken: AccessToken;
    readonly locale: string;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
    readonly actionsDisabled: boolean;
}) {
    const { t } = useTranslation();

    return (
        <li className="relative flex flex-col gap-2 border bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:pr-64">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <KeyRound
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <span className="truncate font-medium" title={accessToken.name}>
                        {accessToken.name}
                    </span>
                    <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-primary"
                    >
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {accessToken.expiresAt
                            ? t("partnerAccessTokens.expiresAt", {
                                  date: formatDateTime(accessToken.expiresAt, locale),
                              })
                            : t("partnerAccessTokens.noExpiration")}
                    </Badge>
                </div>
            </div>

            <code className="w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-muted px-2 py-1 text-xs">
                {accessToken.maskedToken}
            </code>

            <div className="flex justify-between items-end">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t("partnerAccessTokens.createdAt", {
                            date: formatDateTime(accessToken.created, locale),
                        })}
                    </span>
                    <span>
                        {t("partnerAccessTokens.updatedAt", {
                            date: formatDateTime(accessToken.updated, locale),
                        })}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {accessToken.scopes.length > 0 ? (
                        accessToken.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary">
                                {t(SCOPE_TRANSLATION_KEYS[scope])}
                            </Badge>
                        ))
                    ) : (
                        <Badge variant="outline">{t("partnerAccessTokens.noScopes")}</Badge>
                    )}
                </div>
            </div>

            <div className="mt-2 flex w-full gap-2 md:absolute md:top-4 md:right-4 md:mt-0 md:w-auto">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 md:flex-none"
                    disabled={actionsDisabled}
                    onClick={onEdit}
                    aria-label={t("partnerAccessTokens.edit.openAriaLabel", {
                        name: accessToken.name,
                    })}
                >
                    <Pencil aria-hidden="true" />
                    {t("partnerAccessTokens.edit.open")}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="flex-1 md:flex-none"
                    disabled={actionsDisabled}
                    onClick={onDelete}
                    aria-label={t("partnerAccessTokens.delete.openAriaLabel", {
                        name: accessToken.name,
                    })}
                >
                    <Trash2 aria-hidden="true" />
                    {t("partnerAccessTokens.delete.open")}
                </Button>
            </div>
        </li>
    );
}

function DeleteConfirmationDialog({
    open,
    isPending,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onOpenChange,
    onConfirm,
}: {
    readonly open: boolean;
    readonly isPending: boolean;
    readonly title: string;
    readonly description: string;
    readonly confirmLabel: string;
    readonly cancelLabel: string;
    readonly onOpenChange: (open: boolean) => void;
    readonly onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isPending}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {isPending && <Spinner data-icon="inline-start" />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function AccessTokensSkeleton() {
    const { t } = useTranslation();

    return (
        <div role="status" aria-live="polite">
            <span className="sr-only">{t("partnerAccessTokens.loading")}</span>
            <ul className="flex flex-col gap-3">
                {["access-token-skeleton-1", "access-token-skeleton-2"].map((id) => (
                    <li
                        key={id}
                        className="flex flex-col gap-3 border bg-surface-container-low p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-5 w-full max-w-64" />
                            <Skeleton className="h-6 w-28 rounded-none" />
                        </div>
                        <Skeleton className="h-7 w-full max-w-80 rounded-none" />
                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
