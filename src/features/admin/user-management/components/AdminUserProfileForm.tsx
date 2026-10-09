import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";
import {
    mapToAdminUserProfilePatch,
    toAdminUserProfileFormValues,
    type AdminUserAccount,
} from "@/data/internal/admin/AdminUser.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserProfile } from "../api/useAdminUsers.ts";

const profileSchema = z.object({
    email: z.email("adminUsers.validation.invalidEmail"),
    firstName: z.string().trim().max(64, "adminUsers.validation.nameTooLong"),
    lastName: z.string().trim().max(64, "adminUsers.validation.nameTooLong"),
    language: z.union([z.enum(LANGUAGES), z.literal("")]),
    currency: z.union([z.enum(CURRENCIES), z.literal("")]),
    measurementUnit: z.union([z.enum(UNIT_SYSTEMS), z.literal("")]),
    showUnassessedOrSensitiveContent: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AdminUserProfileForm({ account }: { readonly account: AdminUserAccount }) {
    const { t } = useTranslation();
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;
    const updateProfile = useUpdateAdminUserProfile();
    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: toAdminUserProfileFormValues(account),
    });

    const submit = async (values: ProfileValues) => {
        updateProfile.reset();
        const patch = mapToAdminUserProfilePatch(account, values);
        if (Object.keys(patch).length === 0) return;
        try {
            const updated = await updateProfile.mutateAsync({ userId: account.userId, patch });
            form.reset(toAdminUserProfileFormValues(updated));
            toast.success(t("adminUsers.success.profileUpdated"));
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    };

    return (
        <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-4">
            <h3 className="font-semibold">{t("adminUsers.profile.title")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    id="admin-user-email"
                    label={t("adminUsers.fields.email")}
                    error={form.formState.errors.email?.message}
                >
                    <Input
                        id="admin-user-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(form.formState.errors.email)}
                        aria-describedby={
                            form.formState.errors.email ? "admin-user-email-error" : undefined
                        }
                        {...form.register("email")}
                    />
                </FormField>
                <FormField
                    id="admin-user-first-name"
                    label={t("adminUsers.fields.firstName")}
                    error={form.formState.errors.firstName?.message}
                >
                    <Input
                        id="admin-user-first-name"
                        autoComplete="given-name"
                        aria-invalid={Boolean(form.formState.errors.firstName)}
                        aria-describedby={
                            form.formState.errors.firstName
                                ? "admin-user-first-name-error"
                                : undefined
                        }
                        {...form.register("firstName")}
                    />
                </FormField>
                <FormField
                    id="admin-user-last-name"
                    label={t("adminUsers.fields.lastName")}
                    error={form.formState.errors.lastName?.message}
                >
                    <Input
                        id="admin-user-last-name"
                        autoComplete="family-name"
                        aria-invalid={Boolean(form.formState.errors.lastName)}
                        aria-describedby={
                            form.formState.errors.lastName
                                ? "admin-user-last-name-error"
                                : undefined
                        }
                        {...form.register("lastName")}
                    />
                </FormField>
                <SelectField
                    id="admin-user-language"
                    label={t("adminUsers.fields.language")}
                    emptyLabel={t("adminUsers.options.notSet")}
                    register={form.register("language")}
                >
                    {LANGUAGES.map((language) => (
                        <option key={language} value={language}>
                            {t(`adminUsers.options.languages.${language}`)}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    id="admin-user-currency"
                    label={t("adminUsers.fields.currency")}
                    emptyLabel={t("adminUsers.options.notSet")}
                    register={form.register("currency")}
                >
                    {CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                            {currency}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    id="admin-user-measurement-unit"
                    label={t("adminUsers.fields.measurementUnit")}
                    emptyLabel={t("adminUsers.options.notSet")}
                    register={form.register("measurementUnit")}
                >
                    {UNIT_SYSTEMS.map((system) => (
                        <option key={system} value={system}>
                            {t(`adminUsers.options.measurementUnits.${system}`)}
                        </option>
                    ))}
                </SelectField>
            </div>
            <label className="flex items-start gap-3 border p-3 text-sm">
                <input
                    type="checkbox"
                    className="mt-1"
                    {...form.register("showUnassessedOrSensitiveContent")}
                />
                <span className="grid gap-1">
                    <span className="font-medium">
                        {t("adminUsers.fields.showUnassessedOrSensitiveContent")}
                    </span>
                    <span className="text-muted-foreground">
                        {t("adminUsers.profile.sensitiveContentHelp")}
                    </span>
                </span>
            </label>
            {updateProfile.error && (
                <p role="alert" className="text-sm text-destructive">
                    {updateProfile.error.message}
                </p>
            )}
            <div>
                <Button
                    type="submit"
                    disabled={patchPending || updateProfile.isPending || !form.formState.isDirty}
                >
                    {updateProfile.isPending
                        ? t("adminUsers.actions.saving")
                        : t("adminUsers.actions.saveProfile")}
                </Button>
            </div>
        </form>
    );
}

function FormField({
    id,
    label,
    error,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly error?: string;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function SelectField({
    id,
    label,
    emptyLabel,
    register,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly emptyLabel: string;
    readonly register: UseFormRegisterReturn;
    readonly children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <select id={id} className="h-9 border bg-background px-3 text-sm" {...register}>
                <option value="">{emptyLabel}</option>
                {children}
            </select>
        </div>
    );
}
