import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { type Control, type FieldValues, type Path, useController, useForm } from "react-hook-form";
import { AdminSelect } from "@/features/admin/common/components/AdminDirectory.tsx";
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
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    PRIMARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
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
                    control={form.control}
                    name="language"
                    options={LANGUAGES.map((language) => ({
                        value: language,
                        label: t(`adminUsers.options.languages.${language}`),
                    }))}
                />
                <SelectField
                    id="admin-user-currency"
                    label={t("adminUsers.fields.currency")}
                    emptyLabel={t("adminUsers.options.notSet")}
                    control={form.control}
                    name="currency"
                    options={CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
                />
                <SelectField
                    id="admin-user-measurement-unit"
                    label={t("adminUsers.fields.measurementUnit")}
                    emptyLabel={t("adminUsers.options.notSet")}
                    control={form.control}
                    name="measurementUnit"
                    options={UNIT_SYSTEMS.map((system) => ({
                        value: system,
                        label: t(`adminUsers.options.measurementUnits.${system}`),
                    }))}
                />
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

/** A styled select bound to a form field (the shared admin select). "" stands for "not set". */
export function AdminUserSelect<T extends FieldValues>({
    id,
    control,
    name,
    options,
    raised = false,
}: {
    readonly id: string;
    readonly control: Control<T>;
    readonly name: Path<T>;
    readonly options: readonly { readonly value: string; readonly label: string }[];
    readonly raised?: boolean;
}) {
    const { field } = useController({ control, name });
    return (
        <AdminSelect
            id={id}
            value={(field.value as string | undefined) ?? ""}
            onChange={field.onChange}
            options={options}
            raised={raised}
        />
    );
}

function SelectField({
    id,
    label,
    emptyLabel,
    control,
    name,
    options,
}: {
    readonly id: string;
    readonly label: string;
    readonly emptyLabel: string;
    readonly control: Control<ProfileValues>;
    readonly name: Path<ProfileValues>;
    readonly options: readonly { readonly value: string; readonly label: string }[];
}) {
    return (
        <Field id={id} label={label}>
            <AdminUserSelect
                id={id}
                control={control}
                name={name}
                options={[{ value: "", label: emptyLabel }, ...options]}
            />
        </Field>
    );
}
