import type { ReactNode } from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
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
}: {
    readonly party?: Party;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const create = useCreateAdminParty();
    const update = useUpdateAdminParty();
    const form = useForm<FormValues>({
        resolver: zodResolver(partyFormSchema),
        defaultValues: {
            name: party?.name ?? "",
            phone: party?.contact.phone ?? "",
            email: party?.contact.email ?? "",
        },
    });
    const pending = create.isPending || update.isPending;
    const requestError = party ? update.error : create.error;
    const [showRequestError, setShowRequestError] = useState(false);
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            create.reset();
            update.reset();
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
            onSuccess: () => {
                toast.success(t("adminParties.success.created"));
                handleOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t(party ? "adminParties.form.editTitle" : "adminParties.form.createTitle")}
                    </DialogTitle>
                    <DialogDescription>{t("adminParties.form.description")}</DialogDescription>
                </DialogHeader>
                <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-4">
                    <FormField
                        id="admin-party-name"
                        label={t("adminParties.fields.name")}
                        errorText={
                            form.formState.errors.name?.message
                                ? t(form.formState.errors.name.message)
                                : undefined
                        }
                    >
                        <Input
                            id="admin-party-name"
                            autoComplete="organization"
                            aria-invalid={Boolean(form.formState.errors.name)}
                            aria-describedby={
                                form.formState.errors.name ? "admin-party-name-error" : undefined
                            }
                            {...form.register("name")}
                        />
                    </FormField>
                    <FormField
                        id="admin-party-phone"
                        label={t("adminParties.fields.phone")}
                        errorText={
                            form.formState.errors.phone?.message
                                ? t(form.formState.errors.phone.message)
                                : undefined
                        }
                    >
                        <Input
                            id="admin-party-phone"
                            type="tel"
                            autoComplete="tel"
                            aria-invalid={Boolean(form.formState.errors.phone)}
                            aria-describedby={
                                form.formState.errors.phone ? "admin-party-phone-error" : undefined
                            }
                            {...form.register("phone")}
                        />
                    </FormField>
                    <FormField
                        id="admin-party-email"
                        label={t("adminParties.fields.email")}
                        errorText={
                            form.formState.errors.email?.message
                                ? t(form.formState.errors.email.message)
                                : undefined
                        }
                    >
                        <Input
                            id="admin-party-email"
                            type="email"
                            autoComplete="email"
                            aria-invalid={Boolean(form.formState.errors.email)}
                            aria-describedby={
                                form.formState.errors.email ? "admin-party-email-error" : undefined
                            }
                            {...form.register("email")}
                        />
                    </FormField>
                    {requestError && showRequestError && open && (
                        <p role="alert" className="text-sm text-destructive">
                            {requestError.message}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            {t("adminParties.actions.cancel")}
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending
                                ? t("adminParties.actions.saving")
                                : t(
                                      party
                                          ? "adminParties.actions.save"
                                          : "adminParties.actions.create",
                                  )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function FormField({
    id,
    label,
    errorText,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly errorText?: string;
    readonly children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {errorText && (
                <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {errorText}
                </p>
            )}
        </div>
    );
}
