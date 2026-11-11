import type { ReactNode } from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import {
    buildUpdatePartyData,
    type Party,
    type PartyFormValues,
} from "@/data/internal/party/Party.ts";
import { useCreateAdminParty, useUpdateAdminParty } from "../api/useAdminParties.ts";

const partyFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "adminParties.validation.nameRequired" })
        .refine((value) => new TextEncoder().encode(value).length <= 255, {
            message: "adminParties.validation.nameTooLong",
        }),
    phone: z.string().trim(),
    email: z
        .string()
        .trim()
        .pipe(z.union([z.literal(""), z.email("adminParties.validation.invalidEmail")])),
});

type FormValues = z.infer<typeof partyFormSchema>;

export function AdminPartyFormDialog({
    party,
    open,
    onOpenChange,
    onCreated,
}: {
    readonly party?: Party;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onCreated?: (partyId: string) => void;
}) {
    const { t } = useTranslation();
    const create = useCreateAdminParty();
    const update = useUpdateAdminParty();
    const defaultValues: FormValues = {
        name: party?.name ?? "",
        phone: party?.contact.phone ?? "",
        email: party?.contact.email ?? "",
    };
    const form = useForm<FormValues>({
        resolver: zodResolver(partyFormSchema),
        defaultValues,
    });
    const pending = create.isPending || update.isPending;
    const requestError = party ? update.error : create.error;
    const [showRequestError, setShowRequestError] = useState(false);
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            create.reset();
            update.reset();
        } else {
            // The dialog stays mounted, so drop abandoned or submitted values before it reopens.
            form.reset(defaultValues);
        }
        setShowRequestError(false);
        onOpenChange(nextOpen);
    };

    const submit = (values: FormValues) => {
        setShowRequestError(false);
        const formValues: PartyFormValues = values;
        if (party) {
            const patch = buildUpdatePartyData(party, formValues);
            if (Object.keys(patch).length === 0) {
                handleOpenChange(false);
                return;
            }
            update.mutate(
                { partyId: party.partyId, patch },
                {
                    onError: () => setShowRequestError(true),
                    onSuccess: () => {
                        toast.success(t("adminParties.success.updated"));
                        handleOpenChange(false);
                    },
                },
            );
            return;
        }

        create.mutate(formValues, {
            onError: () => setShowRequestError(true),
            onSuccess: (partyId) => {
                toast.success(t("adminParties.success.created"));
                handleOpenChange(false);
                onCreated?.(partyId);
            },
        });
    };

    const fieldError = (name: keyof FormValues) => {
        const message = form.formState.errors[name]?.message;
        return message ? t(message) : undefined;
    };

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={handleOpenChange}
            width="sm"
            eyebrow={t("adminParties.detail.eyebrow")}
            title={t(party ? "adminParties.form.editTitle" : "adminParties.form.createTitle")}
        >
            <form noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
                <FormField
                    id="admin-party-name"
                    label={t("adminParties.fields.name")}
                    error={fieldError("name")}
                >
                    <input
                        id="admin-party-name"
                        autoComplete="organization"
                        aria-invalid={Boolean(form.formState.errors.name)}
                        aria-describedby={
                            form.formState.errors.name ? "admin-party-name-error" : undefined
                        }
                        className={FIELD_CLASS}
                        {...form.register("name")}
                    />
                </FormField>
                <FormField
                    id="admin-party-phone"
                    label={t("adminParties.fields.phone")}
                    error={fieldError("phone")}
                >
                    <input
                        id="admin-party-phone"
                        type="tel"
                        autoComplete="tel"
                        aria-invalid={Boolean(form.formState.errors.phone)}
                        aria-describedby={
                            form.formState.errors.phone ? "admin-party-phone-error" : undefined
                        }
                        className={FIELD_CLASS}
                        {...form.register("phone")}
                    />
                </FormField>
                <FormField
                    id="admin-party-email"
                    label={t("adminParties.fields.email")}
                    error={fieldError("email")}
                >
                    <input
                        id="admin-party-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(form.formState.errors.email)}
                        aria-describedby={
                            form.formState.errors.email ? "admin-party-email-error" : undefined
                        }
                        className={FIELD_CLASS}
                        {...form.register("email")}
                    />
                </FormField>
                {requestError && showRequestError && open && (
                    <p role="alert" className={INLINE_ALERT_CLASS}>
                        {requestError.message}
                    </p>
                )}
                <div className="flex flex-col-reverse gap-2.5 border-t border-line-subtle pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.cancel")}
                    </button>
                    <button type="submit" disabled={pending} className={PRIMARY_PILL_CLASS}>
                        {pending && (
                            <Loader2
                                aria-hidden="true"
                                className="size-[15px] animate-spin motion-reduce:animate-none"
                            />
                        )}
                        {t(party ? "adminCommon.save" : "adminParties.actions.create")}
                    </button>
                </div>
            </form>
        </AdminRecordDialog>
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
    return (
        <div className="flex flex-col gap-2">
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
