import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import { mapToAdminUserTierPatch } from "@/data/internal/admin/AdminUser.ts";
import { SUBSCRIPTION_TYPES } from "@/data/internal/account/SubscriptionType.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserTier } from "../api/useAdminUsers.ts";

const tierSchema = z.object({ tier: z.enum(SUBSCRIPTION_TYPES) });
type TierValues = z.infer<typeof tierSchema>;

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
        <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-3">
            <h3 className="font-semibold">{t("adminUsers.tier.title")}</h3>
            <div className="grid gap-2">
                <Label htmlFor="admin-user-tier">{t("adminUsers.fields.tier")}</Label>
                <select
                    id="admin-user-tier"
                    className="h-9 w-full border bg-background px-3 text-sm"
                    {...form.register("tier")}
                >
                    {SUBSCRIPTION_TYPES.map((tier) => (
                        <option key={tier} value={tier}>
                            {t(`adminUsers.options.tiers.${tier.toUpperCase()}`)}
                        </option>
                    ))}
                </select>
            </div>
            {updateTier.error && (
                <p role="alert" className="text-sm text-destructive">
                    {updateTier.error.message}
                </p>
            )}
            <div>
                <Button
                    type="submit"
                    disabled={patchPending || updateTier.isPending || !form.formState.isDirty}
                >
                    {updateTier.isPending
                        ? t("adminUsers.actions.saving")
                        : t("adminUsers.actions.saveTier")}
                </Button>
            </div>
        </form>
    );
}
