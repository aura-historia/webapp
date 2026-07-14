import { parseShopDomains } from "@/components/admin/adminShopFormUtils.ts";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import type { PartnerApplicationShopSearchItem } from "@/features/partner/application-management/api/usePartnerApplications.ts";
import { useCreatePartnerApplication } from "@/features/partner/application-management/api/usePartnerApplications.ts";
import {
    buildPartnerApplicationStructuredAddress,
    createPartnerApplicationFormSchema,
    optionalTrimmedValue,
    PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    type PartnerApplicationCreateFormData,
} from "@/features/partner/application-management/components/PartnerApplicationCreateForm.ts";
import { PartnerApplicationExistingShopField } from "@/features/partner/application-management/components/PartnerApplicationExistingShopField.tsx";
import { PartnerApplicationNewShopFields } from "@/features/partner/application-management/components/PartnerApplicationNewShopFields.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PartnerApplicationCreateDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function PartnerApplicationCreateDialog({
    open,
    onOpenChange,
}: PartnerApplicationCreateDialogProps) {
    const { t } = useTranslation();
    const createPartnerApplication = useCreatePartnerApplication();
    const form = useForm<PartnerApplicationCreateFormData>({
        resolver: zodResolver(createPartnerApplicationFormSchema(t)),
        defaultValues: PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    });
    const [selectedExistingShop, setSelectedExistingShop] =
        useState<PartnerApplicationShopSearchItem | null>(null);
    const typeField = useController({ control: form.control, name: "type" }).field;
    const shopIdField = useController({ control: form.control, name: "shopId" }).field;
    const selectedType = form.watch("type");
    const errors = form.formState.errors;
    const existingShopSelected = shopIdField.value.trim() !== "";
    const submitDisabled =
        createPartnerApplication.isPending ||
        (selectedType === "EXISTING" && !existingShopSelected);

    const resetForm = () => {
        form.reset(PARTNER_APPLICATION_CREATE_DEFAULT_VALUES);
        setSelectedExistingShop(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (createPartnerApplication.isPending) {
            return;
        }

        if (!nextOpen) {
            resetForm();
        }

        onOpenChange(nextOpen);
    };

    const handleCreateSuccess = () => {
        toast.success(t("partnerApplications.create.success"));
        resetForm();
        onOpenChange(false);
    };

    const onSubmit = (values: PartnerApplicationCreateFormData) => {
        if (values.type === "EXISTING") {
            createPartnerApplication.mutate(
                {
                    type: "EXISTING",
                    shopId: values.shopId.trim(),
                },
                { onSuccess: handleCreateSuccess },
            );
            return;
        }

        createPartnerApplication.mutate(
            {
                type: "NEW",
                shopName: values.shopName.trim(),
                shopType: values.shopType,
                shopDomains: parseShopDomains(values.shopDomains),
                shopUrl: optionalTrimmedValue(values.shopUrl),
                shopImage: optionalTrimmedValue(values.shopImage),
                shopStructuredAddress: buildPartnerApplicationStructuredAddress(values),
                shopPhone: optionalTrimmedValue(values.shopPhone),
                shopEmail: optionalTrimmedValue(values.shopEmail),
            },
            { onSuccess: handleCreateSuccess },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("partnerApplications.create.title")}</DialogTitle>
                    <DialogDescription>
                        {t("partnerApplications.create.description")}
                    </DialogDescription>
                </DialogHeader>

                <form
                    noValidate
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5"
                >
                    <div className="grid gap-2 pb-5">
                        <Label htmlFor="partner-application-type">
                            {t("partnerApplications.create.fields.type")}
                        </Label>
                        <Select
                            value={typeField.value}
                            onValueChange={(nextType) => {
                                typeField.onChange(nextType);
                                shopIdField.onChange("");
                                setSelectedExistingShop(null);
                            }}
                        >
                            <SelectTrigger id="partner-application-type" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NEW">
                                    {t("partnerApplications.create.type.new")}
                                </SelectItem>
                                <SelectItem value="EXISTING">
                                    {t("partnerApplications.create.type.existing")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedType === "EXISTING" ? (
                        <PartnerApplicationExistingShopField
                            id="partner-application-shop-id"
                            value={shopIdField.value}
                            selectedShop={selectedExistingShop}
                            onChange={(shop) => {
                                setSelectedExistingShop(shop);
                                shopIdField.onChange(shop?.shopId ?? "");
                            }}
                            errorMessage={errors.shopId?.message}
                        />
                    ) : (
                        <PartnerApplicationNewShopFields form={form} />
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={createPartnerApplication.isPending}
                            onClick={() => handleOpenChange(false)}
                        >
                            {t("partnerApplications.create.cancel")}
                        </Button>
                        <Button type="submit" disabled={submitDisabled}>
                            {createPartnerApplication.isPending
                                ? t("partnerApplications.create.submitting")
                                : t("partnerApplications.create.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
