import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
    EDITABLE_SHOP_TYPES,
    parseShopDomains,
} from "@/features/shop-management-common/lib/shopFormUtils.ts";
import { Button } from "@/components/ui/button.tsx";
import { DialogFooter } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import {
    FieldMessage,
    RequiredFieldMarker,
} from "@/features/partner/application-management/components/PartnerApplicationCreateFieldHelpers.tsx";

function optionalUrlSchema(message: string) {
    return z
        .string()
        .trim()
        .refine((value) => value === "" || URL.canParse(value), message);
}

function optionalEmailSchema(message: string) {
    const emailSchema = z.email();
    return z
        .string()
        .trim()
        .refine((value) => value === "" || emailSchema.safeParse(value).success, message);
}

function createPartnerApplicationEditFormSchema(t: TFunction) {
    return z.object({
        shopName: z
            .string()
            .trim()
            .min(1, t("partnerApplications.create.validation.shopNameRequired")),
        shopType: z.union([z.literal(""), z.enum(EDITABLE_SHOP_TYPES)]),
        shopDomains: z
            .string()
            .trim()
            .refine(
                (value) => parseShopDomains(value).length > 0,
                t("partnerApplications.create.validation.domainsRequired"),
            ),
        shopUrl: optionalUrlSchema(t("partnerApplications.create.validation.urlInvalid")),
        shopImage: optionalUrlSchema(t("partnerApplications.create.validation.imageInvalid")),
        shopPhone: z.string().trim(),
        shopEmail: optionalEmailSchema(t("partnerApplications.create.validation.emailInvalid")),
        addressline: z.string().trim(),
        addresslineExtra: z.string().trim(),
        locality: z.string().trim(),
        region: z.string().trim(),
        postalCode: z.string().trim(),
        country: z.string().trim(),
    });
}

export type PartnerApplicationEditFormData = z.infer<
    ReturnType<typeof createPartnerApplicationEditFormSchema>
>;

function getEditFormDefaultValues(application: PartnerApplication): PartnerApplicationEditFormData {
    const payload = application.payload;

    if (payload.type !== "NEW") {
        return {
            shopName: "",
            shopType: "",
            shopDomains: "",
            shopUrl: "",
            shopImage: "",
            shopPhone: "",
            shopEmail: "",
            addressline: "",
            addresslineExtra: "",
            locality: "",
            region: "",
            postalCode: "",
            country: "",
        };
    }

    return {
        shopName: payload.shopName,
        shopType: payload.shopType ?? "",
        shopDomains: payload.shopDomains.join("\n"),
        shopUrl: payload.shopUrl ?? "",
        shopImage: payload.shopImage ?? "",
        shopPhone: payload.shopPhone ?? "",
        shopEmail: payload.shopEmail ?? "",
        addressline: payload.shopStructuredAddress?.addressline ?? "",
        addresslineExtra: payload.shopStructuredAddress?.addresslineExtra ?? "",
        locality: payload.shopStructuredAddress?.locality ?? "",
        region: payload.shopStructuredAddress?.region ?? "",
        postalCode: payload.shopStructuredAddress?.postalCode ?? "",
        country: payload.shopStructuredAddress?.country ?? "",
    };
}

interface PartnerApplicationEditFormProps {
    readonly application: PartnerApplication;
    readonly isSaving: boolean;
    readonly onCancel: () => void;
    readonly onSave: (values: PartnerApplicationEditFormData) => void;
}

export function PartnerApplicationEditForm({
    application,
    isSaving,
    onCancel,
    onSave,
}: PartnerApplicationEditFormProps) {
    const { t } = useTranslation();
    const form = useForm<PartnerApplicationEditFormData>({
        resolver: zodResolver(createPartnerApplicationEditFormSchema(t)),
        defaultValues: getEditFormDefaultValues(application),
    });
    const shopTypeField = useController({
        control: form.control,
        name: "shopType",
    }).field;
    const errors = form.formState.errors;

    return (
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSave)}>
            <section className="border p-4">
                <h3 className="font-medium">{t("partnerApplications.detail.shopSection")}</h3>
                <div className="mt-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-name" className="gap-0">
                                {t("partnerApplications.detail.shopName")}
                                <RequiredFieldMarker />
                            </Label>
                            <Input
                                id="partner-application-edit-shop-name"
                                {...form.register("shopName")}
                                aria-invalid={!!errors.shopName}
                                disabled={isSaving}
                            />
                            <FieldMessage message={errors.shopName?.message} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-type" className="gap-0">
                                {t("partnerApplications.detail.shopType")}
                                <RequiredFieldMarker />
                            </Label>
                            <Select
                                value={shopTypeField.value}
                                onValueChange={shopTypeField.onChange}
                                disabled={isSaving}
                            >
                                <SelectTrigger
                                    id="partner-application-edit-shop-type"
                                    className="w-full"
                                    aria-invalid={!!errors.shopType}
                                >
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EDITABLE_SHOP_TYPES.map((shopType) => (
                                        <SelectItem key={shopType} value={shopType}>
                                            {t(
                                                SHOP_TYPE_TRANSLATION_CONFIG[shopType]
                                                    .translationKey,
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldMessage message={errors.shopType?.message} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-shop-domains" className="gap-0">
                            {t("partnerApplications.detail.domains")}
                            <RequiredFieldMarker />
                        </Label>
                        <Textarea
                            id="partner-application-edit-shop-domains"
                            className="min-h-24"
                            {...form.register("shopDomains")}
                            aria-invalid={!!errors.shopDomains}
                            disabled={isSaving}
                        />
                        <p className="text-sm text-muted-foreground">
                            {t("partnerApplications.create.fields.shopDomainsHint")}
                        </p>
                        <FieldMessage message={errors.shopDomains?.message} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-url">
                                {t("partnerApplications.detail.shopUrl")}
                            </Label>
                            <Input
                                id="partner-application-edit-shop-url"
                                type="url"
                                placeholder="https://shop.example.com"
                                {...form.register("shopUrl")}
                                aria-invalid={!!errors.shopUrl}
                                disabled={isSaving}
                            />
                            <FieldMessage message={errors.shopUrl?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-image">
                                {t("partnerApplications.detail.shopImage")}
                            </Label>
                            <Input
                                id="partner-application-edit-shop-image"
                                type="url"
                                placeholder="https://..."
                                {...form.register("shopImage")}
                                aria-invalid={!!errors.shopImage}
                                disabled={isSaving}
                            />
                            <FieldMessage message={errors.shopImage?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-phone">
                                {t("partnerApplications.detail.shopPhone")}
                            </Label>
                            <Input
                                id="partner-application-edit-shop-phone"
                                type="tel"
                                {...form.register("shopPhone")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="partner-application-edit-shop-email">
                                {t("partnerApplications.detail.shopEmail")}
                            </Label>
                            <Input
                                id="partner-application-edit-shop-email"
                                type="email"
                                {...form.register("shopEmail")}
                                aria-invalid={!!errors.shopEmail}
                                disabled={isSaving}
                            />
                            <FieldMessage message={errors.shopEmail?.message} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="border p-4">
                <h3 className="font-medium">{t("partnerApplications.detail.address")}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-addressline">
                            {t("partnerApplications.detail.addressline")}
                        </Label>
                        <Input
                            id="partner-application-edit-addressline"
                            {...form.register("addressline")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-addressline-extra">
                            {t("partnerApplications.detail.addresslineExtra")}
                        </Label>
                        <Input
                            id="partner-application-edit-addressline-extra"
                            {...form.register("addresslineExtra")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-locality">
                            {t("partnerApplications.detail.locality")}
                        </Label>
                        <Input
                            id="partner-application-edit-locality"
                            {...form.register("locality")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-region">
                            {t("partnerApplications.detail.region")}
                        </Label>
                        <Input
                            id="partner-application-edit-region"
                            {...form.register("region")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-postal-code">
                            {t("partnerApplications.detail.postalCode")}
                        </Label>
                        <Input
                            id="partner-application-edit-postal-code"
                            {...form.register("postalCode")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-edit-country">
                            {t("partnerApplications.detail.country")}
                        </Label>
                        <Input
                            id="partner-application-edit-country"
                            {...form.register("country")}
                            disabled={isSaving}
                        />
                    </div>
                </div>
            </section>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                    {t("partnerApplications.detail.editCancel")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Spinner className="mr-2 h-4 w-4" />}
                    {t("partnerApplications.detail.editSave")}
                </Button>
            </DialogFooter>
        </form>
    );
}
