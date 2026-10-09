import { useState, type ReactNode } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import {
    ADMIN_USER_PATCH_MUTATION_KEY,
    useAdminUser,
    useDeleteAdminUser,
} from "../api/useAdminUsers.ts";
import { AdminUserProfileForm } from "./AdminUserProfileForm.tsx";
import { AdminUserRoleForm } from "./AdminUserRoleForm.tsx";
import { AdminUserTierForm } from "./AdminUserTierForm.tsx";

export function AdminUserDetailDialog({
    userId,
    onOpenChange,
    securityActions,
}: {
    readonly userId?: string;
    readonly onOpenChange: (open: boolean) => void;
    /** Extension slot for the separately owned suspension/session/token controls. */
    readonly securityActions?: ReactNode;
}) {
    const { t } = useTranslation();
    const open = Boolean(userId);
    const user = useAdminUser(userId, open);
    const deleteUser = useDeleteAdminUser();
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            deleteUser.reset();
            setConfirmDelete(false);
        }
        onOpenChange(nextOpen);
    };

    const handleDelete = async (account: AdminUserAccount) => {
        try {
            await deleteUser.mutateAsync(account.userId);
            toast.success(t("adminUsers.success.deleted"));
            setConfirmDelete(false);
            onOpenChange(false);
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
                closeLabel={t("adminUsers.detail.close")}
            >
                <DialogHeader>
                    <DialogTitle>{t("adminUsers.detail.title")}</DialogTitle>
                    <DialogDescription>{t("adminUsers.detail.description")}</DialogDescription>
                </DialogHeader>
                {user.isLoading && (
                    <div className="flex justify-center py-12" role="status" aria-live="polite">
                        <span className="sr-only">{t("adminUsers.loadingDetail")}</span>
                        <Spinner />
                    </div>
                )}
                {user.isError && (
                    <div className="grid gap-3" role="alert">
                        <p className="text-sm text-destructive">{user.error.message}</p>
                        <div>
                            <Button variant="outline" onClick={() => void user.refetch()}>
                                {t("adminUsers.actions.retry")}
                            </Button>
                        </div>
                    </div>
                )}
                {user.data && (
                    <AdminUserDetails
                        account={user.data}
                        confirmDelete={confirmDelete}
                        deletePending={deleteUser.isPending}
                        patchPending={patchPending}
                        deleteError={deleteUser.error?.message}
                        securityActions={securityActions}
                        onConfirmDelete={() => {
                            deleteUser.reset();
                            setConfirmDelete(true);
                        }}
                        onCancelDelete={() => setConfirmDelete(false)}
                        onDelete={() => void handleDelete(user.data)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function AdminUserDetails({
    account,
    confirmDelete,
    deletePending,
    patchPending,
    deleteError,
    securityActions,
    onConfirmDelete,
    onCancelDelete,
    onDelete,
}: {
    readonly account: AdminUserAccount;
    readonly confirmDelete: boolean;
    readonly deletePending: boolean;
    readonly patchPending: boolean;
    readonly deleteError?: string;
    readonly securityActions?: ReactNode;
    readonly onConfirmDelete: () => void;
    readonly onCancelDelete: () => void;
    readonly onDelete: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid min-w-0 gap-6">
            <section className="grid gap-2 border-b pb-4">
                <h3 className="font-semibold break-all">{account.email}</h3>
                <p className="text-xs text-muted-foreground">
                    {t("adminUsers.fields.userId")}:{" "}
                    <code className="break-all">{account.userId}</code>
                </p>
            </section>

            <AdminUserProfileForm
                key={JSON.stringify([
                    account.email,
                    account.firstName,
                    account.lastName,
                    account.language,
                    account.currency,
                    account.measurementUnit,
                    account.showUnassessedOrSensitiveContent,
                ])}
                account={account}
            />

            <section className="grid gap-5 border-y py-5 sm:grid-cols-2">
                <AdminUserRoleForm key={account.role} account={account} />
                <AdminUserTierForm key={account.tier} account={account} />
            </section>

            {securityActions}

            <section className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
                <div>
                    <h3 className="font-semibold text-destructive">
                        {t("adminUsers.delete.title")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("adminUsers.delete.description")}
                    </p>
                </div>
                {deleteError && (
                    <p role="alert" className="text-sm text-destructive">
                        {deleteError}
                    </p>
                )}
                {confirmDelete ? (
                    <>
                        <p className="text-sm">{t("adminUsers.delete.confirm")}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deletePending || patchPending}
                                onClick={onDelete}
                            >
                                {deletePending
                                    ? t("adminUsers.actions.deleting")
                                    : t("adminUsers.actions.confirmDelete")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={deletePending || patchPending}
                                onClick={onCancelDelete}
                            >
                                {t("adminUsers.actions.cancel")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={patchPending}
                            onClick={onConfirmDelete}
                        >
                            {t("adminUsers.actions.delete")}
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
