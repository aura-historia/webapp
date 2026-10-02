import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    INGESTION_METHODS,
    type ApplicationListingSource,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { useCreatePartnerApplication } from "../api/usePartnerApplications.ts";
import { ApplicationListingSourceField } from "./ApplicationListingSourceField.tsx";
import {
    buildApplicationProposal,
    createPartnerApplicationFormSchema,
    PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    type PartnerApplicationCreateFormData,
} from "./PartnerApplicationCreateForm.ts";

const PROPOSED_FIELDS = [
    "partyName",
    "partyPhone",
    "partyEmail",
    "sourceName",
    "sourceUrl",
    "sourceImage",
] as const;
export function PartnerApplicationCreateDialog({
    open,
    onOpenChange,
}: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const mutation = useCreatePartnerApplication();
    const form = useForm<PartnerApplicationCreateFormData>({
        resolver: zodResolver(createPartnerApplicationFormSchema(t)),
        defaultValues: PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    });
    const [selected, setSelected] = useState<ApplicationListingSource | null>(null);
    const sourceField = useController({
        control: form.control,
        name: "listingSourceId",
        defaultValue: "",
    }).field;
    const methodsField = useController({
        control: form.control,
        name: "requestedIngestionMethods",
        defaultValue: [],
    }).field;
    const type = form.watch("type");
    const reset = () => {
        form.reset(PARTNER_APPLICATION_CREATE_DEFAULT_VALUES);
        setSelected(null);
        mutation.reset();
    };
    const close = (next: boolean) => {
        if (mutation.isPending) return;
        if (!next) reset();
        onOpenChange(next);
    };
    const submit = form.handleSubmit((values) =>
        mutation.mutate(buildApplicationProposal(values), {
            onSuccess: () => {
                toast.success(t("partnerApplications.create.success"));
                reset();
                onOpenChange(false);
            },
        }),
    );
    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("partnerApplications.create.title")}</DialogTitle>
                    <DialogDescription>
                        {t("partnerApplications.proposals.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <fieldset disabled={mutation.isPending} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="application-proposal-type">
                                {t("partnerApplications.proposals.type")}
                            </Label>
                            <select
                                id="application-proposal-type"
                                className="border bg-background p-2"
                                value={type}
                                onChange={(event) => {
                                    form.reset(
                                        event.target.value === "EXISTING_LISTING_SOURCE"
                                            ? {
                                                  type: "EXISTING_LISTING_SOURCE",
                                                  listingSourceId: "",
                                              }
                                            : PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
                                    );
                                    setSelected(null);
                                    mutation.reset();
                                }}
                            >
                                <option value="PROPOSED_LISTING_SOURCE">
                                    {t("partnerApplications.proposals.proposed")}
                                </option>
                                <option value="EXISTING_LISTING_SOURCE">
                                    {t("partnerApplications.proposals.existing")}
                                </option>
                            </select>
                        </div>
                        {type === "EXISTING_LISTING_SOURCE" ? (
                            <>
                                <ApplicationListingSourceField
                                    value={selected}
                                    onChange={(source) => {
                                        setSelected(source);
                                        sourceField.onChange(source?.listingSourceId ?? "");
                                    }}
                                />
                                <p className="text-sm text-destructive">
                                    {
                                        form.getFieldState("listingSourceId", form.formState).error
                                            ?.message
                                    }
                                </p>
                            </>
                        ) : (
                            <>
                                {PROPOSED_FIELDS.map((name) => (
                                    <div key={name} className="grid gap-2">
                                        <Label htmlFor={`application-${name}`}>
                                            {t(`partnerApplications.proposals.${name}`)}
                                        </Label>
                                        <Input
                                            id={`application-${name}`}
                                            {...form.register(name)}
                                            type={
                                                name === "partyEmail"
                                                    ? "email"
                                                    : name === "partyPhone"
                                                      ? "tel"
                                                      : name === "sourceUrl" ||
                                                          name === "sourceImage"
                                                        ? "url"
                                                        : "text"
                                            }
                                            aria-required={
                                                name === "partyName" || name === "sourceName"
                                            }
                                            aria-invalid={Boolean(
                                                form.getFieldState(name, form.formState).error,
                                            )}
                                        />
                                        <p className="text-sm text-destructive">
                                            {
                                                form.getFieldState(name, form.formState).error
                                                    ?.message
                                            }
                                        </p>
                                    </div>
                                ))}
                                <fieldset className="grid gap-2">
                                    <legend>{t("partnerApplications.proposals.methods")}</legend>
                                    {INGESTION_METHODS.map((method) => (
                                        <label key={method} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    methodsField.value?.includes(method) ?? false
                                                }
                                                onChange={(event) =>
                                                    methodsField.onChange(
                                                        event.target.checked
                                                            ? [
                                                                  ...(methodsField.value ?? []),
                                                                  method,
                                                              ]
                                                            : methodsField.value.filter(
                                                                  (item) => item !== method,
                                                              ),
                                                    )
                                                }
                                            />
                                            {t(`partnerApplications.proposals.ingestion.${method}`)}
                                        </label>
                                    ))}
                                </fieldset>
                            </>
                        )}
                    </fieldset>
                    {mutation.error && (
                        <p role="alert" className="text-sm text-destructive">
                            {mutation.error.message}
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={mutation.isPending}
                            onClick={() => close(false)}
                        >
                            {t("partnerApplications.create.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                mutation.isPending ||
                                (type === "EXISTING_LISTING_SOURCE" && !selected)
                            }
                        >
                            {t(
                                mutation.isPending
                                    ? "partnerApplications.create.submitting"
                                    : "partnerApplications.create.submit",
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
