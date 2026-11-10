import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { USER_ROLES } from "@/data/internal/account/UserRole.ts";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import { mapToAdminUserRolePatch } from "@/data/internal/admin/AdminUser.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserRole } from "../api/useAdminUsers.ts";
import { AdminUserAccessCard } from "./AdminUserAccessCard.tsx";
import { AdminUserSelect } from "./AdminUserProfileForm.tsx";

const roleSchema = z.object({ role: z.enum(USER_ROLES) });
type RoleValues = z.infer<typeof roleSchema>;

/** The role card: saves on its own and sends only the role. */
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
        <AdminUserAccessCard
            id="admin-user-role"
            label={t("adminUsers.fields.role")}
            saveLabel={t("adminUsers.actions.saveRole")}
            saving={updateRole.isPending}
            disabled={patchPending || updateRole.isPending || !form.formState.isDirty}
            error={updateRole.error?.message}
            onSubmit={form.handleSubmit(submit)}
        >
            <AdminUserSelect id="admin-user-role" register={form.register("role")} raised>
                {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                        {t(`adminUsers.options.roles.${role}`)}
                    </option>
                ))}
            </AdminUserSelect>
        </AdminUserAccessCard>
    );
}
