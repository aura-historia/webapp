import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import { mapToAdminUserRolePatch } from "@/data/internal/admin/AdminUser.ts";
import { USER_ROLES } from "@/data/internal/account/UserRole.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserRole } from "../api/useAdminUsers.ts";

const roleSchema = z.object({ role: z.enum(USER_ROLES) });
type RoleValues = z.infer<typeof roleSchema>;

export function AdminUserRoleForm({ account }: { readonly account: AdminUserAccount }) {
    const { t } = useTranslation();
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;
    const updateRole = useUpdateAdminUserRole();
    const form = useForm<RoleValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { role: account.role },
    });

    const submit = async ({ role }: RoleValues) => {
        updateRole.reset();
        if (role === account.role) return;
        try {
            const updated = await updateRole.mutateAsync({
                userId: account.userId,
                patch: mapToAdminUserRolePatch(role),
            });
            form.reset({ role: updated.role });
            toast.success(t("adminUsers.success.roleUpdated"));
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    };

    return (
        <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-3">
            <h3 className="font-semibold">{t("adminUsers.role.title")}</h3>
            <div className="grid gap-2">
                <Label htmlFor="admin-user-role">{t("adminUsers.fields.role")}</Label>
                <select
                    id="admin-user-role"
                    className="h-9 w-full border bg-background px-3 text-sm"
                    {...form.register("role")}
                >
                    {USER_ROLES.map((role) => (
                        <option key={role} value={role}>
                            {t(`adminUsers.options.roles.${role}`)}
                        </option>
                    ))}
                </select>
            </div>
            {updateRole.error && (
                <p role="alert" className="text-sm text-destructive">
                    {updateRole.error.message}
                </p>
            )}
            <div>
                <Button
                    type="submit"
                    disabled={patchPending || updateRole.isPending || !form.formState.isDirty}
                >
                    {updateRole.isPending
                        ? t("adminUsers.actions.saving")
                        : t("adminUsers.actions.saveRole")}
                </Button>
            </div>
        </form>
    );
}
