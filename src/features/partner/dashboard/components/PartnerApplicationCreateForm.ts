import { EDITABLE_SHOP_TYPES, parseShopDomains } from "@/components/admin/adminShopFormUtils.ts";
import type { StructuredAddressData } from "@/client";
import type { TFunction } from "i18next";
import { z } from "zod";

export const PARTNER_APPLICATION_CREATE_DEFAULT_VALUES: PartnerApplicationCreateFormData = {
    type: "NEW",
    shopId: "",
    shopName: "",
    shopType: "MARKETPLACE",
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

export function createPartnerApplicationFormSchema(t: TFunction) {
    return z
        .object({
            type: z.enum(["NEW", "EXISTING"]),
            shopId: z.string(),
            shopName: z.string(),
            shopType: z.enum(EDITABLE_SHOP_TYPES),
            shopDomains: z.string(),
            shopUrl: optionalUrlSchema(t("partnerDashboard.create.validation.urlInvalid")),
            shopImage: optionalUrlSchema(t("partnerDashboard.create.validation.imageInvalid")),
            shopPhone: z.string(),
            shopEmail: optionalEmailSchema(t("partnerDashboard.create.validation.emailInvalid")),
            addressline: z.string().trim(),
            addresslineExtra: z.string().trim(),
            locality: z.string().trim(),
            region: z.string().trim(),
            postalCode: z.string().trim(),
            country: z.string().trim(),
        })
        .superRefine((values, ctx) => {
            if (values.type === "EXISTING" && values.shopId.trim() === "") {
                ctx.addIssue({
                    code: "custom",
                    path: ["shopId"],
                    message: t("partnerDashboard.create.validation.shopIdRequired"),
                });
            }

            if (values.type === "NEW") {
                if (values.shopName.trim() === "") {
                    ctx.addIssue({
                        code: "custom",
                        path: ["shopName"],
                        message: t("partnerDashboard.create.validation.shopNameRequired"),
                    });
                }

                if (parseShopDomains(values.shopDomains).length === 0) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["shopDomains"],
                        message: t("partnerDashboard.create.validation.domainsRequired"),
                    });
                }
            }
        });
}

export type PartnerApplicationCreateFormData = z.infer<
    ReturnType<typeof createPartnerApplicationFormSchema>
>;

export function optionalTrimmedValue(value: string): string | null {
    const trimmedValue = value.trim();
    return trimmedValue === "" ? null : trimmedValue;
}

type PartnerApplicationStructuredAddressFormData = Pick<
    PartnerApplicationCreateFormData,
    "addressline" | "addresslineExtra" | "locality" | "region" | "postalCode" | "country"
>;

export function buildPartnerApplicationStructuredAddress(
    values: PartnerApplicationStructuredAddressFormData,
): StructuredAddressData | null {
    const hasAddress =
        values.addressline ||
        values.addresslineExtra ||
        values.locality ||
        values.region ||
        values.postalCode ||
        values.country;

    if (!hasAddress) {
        return null;
    }

    return {
        addressline: values.addressline || undefined,
        addresslineExtra: values.addresslineExtra || undefined,
        locality: values.locality || undefined,
        region: values.region || undefined,
        postalCode: values.postalCode || undefined,
        country: (values.country || undefined) as StructuredAddressData["country"],
    };
}
