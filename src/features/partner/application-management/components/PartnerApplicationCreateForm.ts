import type { TFunction } from "i18next";
import { z } from "zod";
import { LISTING_SOURCE_TYPES } from "@/data/internal/listing-source/ListingSourceType.ts";
import {
    INGESTION_METHODS,
    type PartnershipProposal,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

export function createPartnerApplicationFormSchema(t: TFunction) {
    const requiredName = z
        .string()
        .trim()
        .min(1, t("partnerApplications.proposals.required"))
        .refine(
            (value) => new TextEncoder().encode(value).length <= 255,
            t("partnerApplications.proposals.nameTooLong"),
        );
    const optionalUrl = z
        .string()
        .trim()
        .refine(
            (value) => value === "" || (/^https?:\/\//i.test(value) && URL.canParse(value)),
            t("partnerApplications.create.validation.urlInvalid"),
        );
    return z.discriminatedUnion("type", [
        z.object({
            type: z.literal("EXISTING_LISTING_SOURCE"),
            listingSourceId: z.string().trim().min(1, t("partnerApplications.proposals.required")),
        }),
        z.object({
            type: z.literal("PROPOSED_LISTING_SOURCE"),
            partyName: requiredName,
            partyPhone: z.string().trim(),
            partyEmail: z
                .string()
                .trim()
                .refine(
                    (value) => value === "" || z.email().safeParse(value).success,
                    t("partnerApplications.create.validation.emailInvalid"),
                ),
            sourceName: requiredName,
            listingSourceType: z
                .enum(["", ...LISTING_SOURCE_TYPES])
                .refine(
                    (value) => value !== "",
                    t("partnerApplications.proposals.listingSourceTypeRequired"),
                ),
            sourceUrl: optionalUrl,
            sourceImage: optionalUrl,
            requestedIngestionMethods: z.array(z.enum(INGESTION_METHODS)),
        }),
    ]);
}
/** What the form holds while editing; the source type starts unchosen. */
export type PartnerApplicationCreateFormValues = z.input<
    ReturnType<typeof createPartnerApplicationFormSchema>
>;
/** What a valid submission carries. */
export type PartnerApplicationCreateFormData = z.output<
    ReturnType<typeof createPartnerApplicationFormSchema>
>;
export const PARTNER_APPLICATION_CREATE_DEFAULT_VALUES: PartnerApplicationCreateFormValues = {
    type: "PROPOSED_LISTING_SOURCE",
    partyName: "",
    partyPhone: "",
    partyEmail: "",
    sourceName: "",
    listingSourceType: "",
    sourceUrl: "",
    sourceImage: "",
    requestedIngestionMethods: [],
};
export function buildApplicationProposal(
    values: PartnerApplicationCreateFormData,
): PartnershipProposal {
    if (values.type === "EXISTING_LISTING_SOURCE")
        return { type: values.type, listingSourceId: values.listingSourceId.trim() };
    return {
        type: values.type,
        party: {
            name: values.partyName.trim(),
            ...(values.partyPhone.trim() ? { phone: values.partyPhone.trim() } : {}),
            ...(values.partyEmail.trim() ? { email: values.partyEmail.trim() } : {}),
        },
        listingSource: {
            name: values.sourceName.trim(),
            listingSourceType: values.listingSourceType,
            ...(values.sourceUrl.trim() ? { url: values.sourceUrl.trim() } : {}),
            ...(values.sourceImage.trim() ? { image: values.sourceImage.trim() } : {}),
            requestedIngestionMethods: [...values.requestedIngestionMethods],
        },
    };
}
