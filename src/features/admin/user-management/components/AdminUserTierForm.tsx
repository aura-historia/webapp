import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { SUBSCRIPTION_TYPES } from "@/data/internal/account/SubscriptionType.ts";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import { mapToAdminUserTierPatch } from "@/data/internal/admin/AdminUser.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserTier } from "../api/useAdminUsers.ts";
import { AdminUserAccessCard } from "./AdminUserAccessCard.tsx";
import { AdminUserSelect } from "./AdminUserProfileForm.tsx";

const tierSchema = z.object({ tier: z.enum(SUBSCRIPTION_TYPES) });
type TierValues = z.infer<typeof tierSchema>;

/** The tier card: saves on its own and sends only the tier. */
export function AdminUserTierForm({ account }: { readonly account: AdminUserAccount }) {
    const { t } = useTranslation();
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;
    const updateTier = useUpdateAdminUserTier();
    const form = useForm<TierValues>({
        resolver: zodResolver(tierSchema),
        defaultValues: { tier: account.tier },
    });

    const submit = async ({ tier }: TierValues) => {
        updateTier.reset();
        if (tier === account.tier) return;
        try {
            const updated = await updateTier.mutateAsync({
                userId: account.userId,
                patch: mapToAdminUserTierPatch(tier),
            });
            form.reset({ tier: updated.tier });
            toast.success(t("adminUsers.success.tierUpdated"));
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    };

    return (
        <AdminUserAccessCard
            id="admin-user-tier"
            label={t("adminUsers.fields.tier")}
            saveLabel={t("adminUsers.actions.saveTier")}
            saving={updateTier.isPending}
            disabled={patchPending || updateTier.isPending || !form.formState.isDirty}
            error={updateTier.error?.message}
            onSubmit={form.handleSubmit(submit)}
        >
            <AdminUserSelect id="admin-user-tier" register={form.register("tier")} raised>
                {SUBSCRIPTION_TYPES.map((tier) => (
                    <option key={tier} value={tier}>
                        {t(`adminUsers.options.tiers.${tier.toUpperCase()}`)}
                    </option>
                ))}
            </AdminUserSelect>
        </AdminUserAccessCard>
    );
}
