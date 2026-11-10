import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
    mapToAdminUserProfilePatch,
    toAdminUserProfileFormValues,
    type AdminUserAccount,
} from "@/data/internal/admin/AdminUser.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";
import {
    ADMIN_SELECT_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    PRIMARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { ADMIN_USER_PATCH_MUTATION_KEY, useUpdateAdminUserProfile } from "../api/useAdminUsers.ts";

const profileSchema = z.object({
    firstName: z.string().trim().max(64, "adminUsers.validation.nameTooLong"),
    lastName: z.string().trim().max(64, "adminUsers.validation.nameTooLong"),
    language: z.union([z.enum(LANGUAGES), z.literal("")]),
    currency: z.union([z.enum(CURRENCIES), z.literal("")]),
    measurementUnit: z.union([z.enum(UNIT_SYSTEMS), z.literal("")]),
    showUnassessedOrSensitiveContent: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;

/** Profile fields and the sensitive-content preference; sends only what changed. */
export function AdminUserProfileForm({ account }: { readonly account: AdminUserAccount }) {
    const { t } = useTranslation();
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;
    const updateProfile = useUpdateAdminUserProfile();
    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: toAdminUserProfileFormValues(account),
    });
    const { errors } = form.formState;

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
        <form noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field
                    id="admin-user-first-name"
                    label={t("adminUsers.fields.firstName")}
                    error={errors.firstName?.message && t(errors.firstName.message)}
                >
                    <input
                        id="admin-user-first-name"
                        autoComplete="off"
                        aria-invalid={errors.firstName ? true : undefined}
                        aria-describedby={
                            errors.firstName ? "admin-user-first-name-error" : undefined
                        }
                        className={FIELD_CLASS}
                        {...form.register("firstName")}
                    />
                </Field>
                <Field
                    id="admin-user-last-name"
                    label={t("adminUsers.fields.lastName")}
                    error={errors.lastName?.message && t(errors.lastName.message)}
                >
                    <input
                        id="admin-user-last-name"
                        autoComplete="off"
                        aria-invalid={errors.lastName ? true : undefined}
                        aria-describedby={
                            errors.lastName ? "admin-user-last-name-error" : undefined
                        }
                        className={FIELD_CLASS}
                        {...form.register("lastName")}
                    />
                </Field>
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
            <label className="flex cursor-pointer items-start gap-3 rounded-md bg-surface px-4 py-3.5 shadow-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass">
                <input
                    type="checkbox"
                    className="mt-0.5 size-[18px] shrink-0 accent-oxblood"
                    {...form.register("showUnassessedOrSensitiveContent")}
                />
                <span className="text-sm font-medium">
                    {t("adminUsers.fields.showUnassessedOrSensitiveContent")}
                </span>
            </label>
            {updateProfile.error && (
                <p role="alert" className={INLINE_ALERT_CLASS}>
                    {updateProfile.error.message}
                </p>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={patchPending || updateProfile.isPending || !form.formState.isDirty}
                    className={PRIMARY_PILL_CLASS}
                >
                    {updateProfile.isPending
                        ? t("adminCommon.saving")
                        : t("adminUsers.actions.saveAccountProfile")}
                </button>
            </div>
        </form>
    );
}

function Field({
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
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
        </div>
    );
}

/** A native select bound to the form, styled as a field with the design's chevron. */
export function AdminUserSelect({
    id,
    register,
    raised = false,
    children,
}: {
    readonly id: string;
    readonly register: UseFormRegisterReturn;
    readonly raised?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <div className="relative">
            <select
                id={id}
                className={cn(ADMIN_SELECT_CLASS, raised && "bg-surface-raised")}
                {...register}
            >
                {children}
            </select>
            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-[14px] right-3 size-[15px] text-ink-muted"
                strokeWidth={1.8}
            />
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
        <Field id={id} label={label}>
            <AdminUserSelect id={id} register={register}>
                <option value="">{emptyLabel}</option>
                {children}
            </AdminUserSelect>
        </Field>
    );
}
