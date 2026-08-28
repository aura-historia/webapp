import { EDITABLE_SHOP_TYPES } from "@/features/shop/common/lib/shopFormUtils.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import type { PartnerApplicationCreateFormData } from "@/features/partner/application-management/components/PartnerApplicationCreateForm.ts";
import {
    FieldMessage,
    RequiredFieldMarker,
} from "@/features/partner/application-management/components/PartnerApplicationCreateFieldHelpers.tsx";
import type { UseFormReturn } from "react-hook-form";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface PartnerApplicationNewShopFieldsProps {
    readonly form: UseFormReturn<PartnerApplicationCreateFormData>;
}

export function PartnerApplicationNewShopFields({ form }: PartnerApplicationNewShopFieldsProps) {
    const { t } = useTranslation();
    const shopTypeField = useController({ control: form.control, name: "shopType" }).field;
    const errors = form.formState.errors;

    return (
        <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-name" className="gap-0">
                        {t("partnerApplications.create.fields.shopName")}
                        <RequiredFieldMarker />
                    </Label>
                    <Input
                        id="partner-application-shop-name"
                        {...form.register("shopName")}
                        aria-invalid={!!errors.shopName}
                    />
                    <FieldMessage message={errors.shopName?.message} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-type" className="gap-0">
                        {t("partnerApplications.create.fields.shopType")}
                        <RequiredFieldMarker />
                    </Label>
                    <Select value={shopTypeField.value} onValueChange={shopTypeField.onChange}>
                        <SelectTrigger
                            id="partner-application-shop-type"
                            className="w-full"
                            aria-invalid={!!errors.shopType}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDITABLE_SHOP_TYPES.map((shopType) => (
                                <SelectItem key={shopType} value={shopType}>
                                    {t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldMessage message={errors.shopType?.message} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="partner-application-shop-domains" className="gap-0">
                    {t("partnerApplications.create.fields.shopDomains")}
                    <RequiredFieldMarker />
                </Label>
                <Textarea
                    id="partner-application-shop-domains"
                    className="min-h-24"
                    {...form.register("shopDomains")}
                    aria-invalid={!!errors.shopDomains}
                />
                <p className="text-sm text-muted-foreground">
                    {t("partnerApplications.create.fields.shopDomainsHint")}
                </p>
                <FieldMessage message={errors.shopDomains?.message} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-url">
                        {t("partnerApplications.create.fields.shopUrl")}
                    </Label>
                    <Input
                        id="partner-application-shop-url"
                        type="url"
                        placeholder="https://shop.example.com"
                        {...form.register("shopUrl")}
                        aria-invalid={!!errors.shopUrl}
                    />
                    <FieldMessage message={errors.shopUrl?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-image">
                        {t("partnerApplications.create.fields.shopImage")}
                    </Label>
                    <Input
                        id="partner-application-shop-image"
                        type="url"
                        placeholder="https://..."
                        {...form.register("shopImage")}
                        aria-invalid={!!errors.shopImage}
                    />
                    <FieldMessage message={errors.shopImage?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-phone">
                        {t("partnerApplications.create.fields.shopPhone")}
                    </Label>
                    <Input
                        id="partner-application-shop-phone"
                        type="tel"
                        {...form.register("shopPhone")}
                    />
                    <FieldMessage />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="partner-application-shop-email">
                        {t("partnerApplications.create.fields.shopEmail")}
                    </Label>
                    <Input
                        id="partner-application-shop-email"
                        type="email"
                        {...form.register("shopEmail")}
                        aria-invalid={!!errors.shopEmail}
                    />
                    <FieldMessage message={errors.shopEmail?.message} />
                </div>
            </div>

            <section className="grid gap-4">
                <h3 className="font-medium">{t("partnerApplications.create.fields.address")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-addressline">
                            {t("partnerApplications.create.fields.addressline")}
                        </Label>
                        <Input
                            id="partner-application-addressline"
                            {...form.register("addressline")}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-addressline-extra">
                            {t("partnerApplications.create.fields.addresslineExtra")}
                        </Label>
                        <Input
                            id="partner-application-addressline-extra"
                            {...form.register("addresslineExtra")}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-locality">
                            {t("partnerApplications.create.fields.locality")}
                        </Label>
                        <Input id="partner-application-locality" {...form.register("locality")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-region">
                            {t("partnerApplications.create.fields.region")}
                        </Label>
                        <Input id="partner-application-region" {...form.register("region")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-postal-code">
                            {t("partnerApplications.create.fields.postalCode")}
                        </Label>
                        <Input
                            id="partner-application-postal-code"
                            {...form.register("postalCode")}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-application-country">
                            {t("partnerApplications.create.fields.country")}
                        </Label>
                        <Input id="partner-application-country" {...form.register("country")} />
                    </div>
                </div>
            </section>
        </div>
    );
}
