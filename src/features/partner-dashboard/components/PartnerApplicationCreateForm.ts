import { EDITABLE_SHOP_TYPES, parseShopDomains } from "@/components/admin/adminShopFormUtils.ts";
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
