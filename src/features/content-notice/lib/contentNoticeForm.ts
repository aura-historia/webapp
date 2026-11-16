import type { TFunction } from "i18next";
import { z } from "zod";
import type {
    ContentNoticeReasonCategoryData,
    ContentNoticeSubmitterRoleData,
    LanguageData,
    SubmitContentNoticeData,
} from "@/client";
import {
    type ContentNoticeScope,
    type ContentNoticeTarget,
    effectiveScope,
} from "@/features/content-notice/lib/contentNoticeTarget.ts";

export type ContentNoticeRole = ContentNoticeSubmitterRoleData;
export type ContentNoticeReason = ContentNoticeReasonCategoryData;

/** Backend limits of `SubmitContentNoticeData`. */
export const MAX_ADDITIONAL_URLS = 10;
export const MAX_URL_LENGTH = 2048;
export const MAX_EXPLANATION_LENGTH = 5000;
export const MAX_NAME_LENGTH = 200;
export const MAX_EMAIL_LENGTH = 320;

export const CONTENT_NOTICE_ROLES = [
    "PROVIDER",
    "RIGHTS_HOLDER",
    "ILLEGAL_CONTENT_REPORTER",
] as const satisfies readonly ContentNoticeRole[];

/** Reasons in the order shown for a role; only a provider may opt out. */
export function reasonsForRole(role: ContentNoticeRole | ""): readonly ContentNoticeReason[] {
    switch (role) {
        case "PROVIDER":
            return [
                "PROVIDER_OPT_OUT",
                "RIGHTS_INFRINGEMENT",
                "INCORRECT_INFORMATION",
                "ILLEGAL_CONTENT",
                "OTHER",
            ];
        case "ILLEGAL_CONTENT_REPORTER":
            return ["ILLEGAL_CONTENT", "RIGHTS_INFRINGEMENT", "INCORRECT_INFORMATION", "OTHER"];
        default:
            return ["RIGHTS_INFRINGEMENT", "ILLEGAL_CONTENT", "INCORRECT_INFORMATION", "OTHER"];
    }
}

export type ContentNoticeFormValues = {
    scope: ContentNoticeScope;
    additionalUrls: { value: string }[];
    submitterRole: ContentNoticeRole | "";
    reasonCategory: ContentNoticeReason | "";
    explanation: string;
    name: string;
    email: string;
    goodFaithConfirmed: boolean;
};

export const EMPTY_CONTENT_NOTICE_FORM: ContentNoticeFormValues = {
    scope: "listing",
    additionalUrls: [{ value: "" }],
    submitterRole: "",
    reasonCategory: "",
    explanation: "",
    name: "",
    email: "",
    goodFaithConfirmed: false,
};

/** Field paths in page order, for the error summary and focus. */
export type ContentNoticeFieldPath =
    | `additionalUrls.${number}.value`
    | "submitterRole"
    | "reasonCategory"
    | "explanation"
    | "name"
    | "email"
    | "goodFaithConfirmed";

// The receipt e-mail cannot be sent to a local part with non-ASCII characters (backend rule).
const EMAIL_LOCAL_PART = /^[\x21-\x3f\x41-\x7e]+$/;
const WHITESPACE = /\s/;

/** A bare address: an ASCII local part, one `@` and a dotted domain, without whitespace. */
export function isNoticeEmail(value: string): boolean {
    const at = value.indexOf("@");
    if (at <= 0 || at !== value.lastIndexOf("@")) return false;
    const domain = value.slice(at + 1);
    const dot = domain.indexOf(".");
    return (
        EMAIL_LOCAL_PART.test(value.slice(0, at)) &&
        !WHITESPACE.test(domain) &&
        dot > 0 &&
        dot < domain.length - 1 &&
        !domain.endsWith(".")
    );
}

function isHttpUrl(value: string): boolean {
    if (!/^https?:\/\//i.test(value) || WHITESPACE.test(value)) return false;
    try {
        const url = new URL(value);
        return (
            (url.protocol === "http:" || url.protocol === "https:") &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
}

export function getContentNoticeSchema(t: TFunction) {
    return z
        .object({
            scope: z.enum(["listing", "provider"]),
            additionalUrls: z.array(z.object({ value: z.string() })),
            submitterRole: z.enum([...CONTENT_NOTICE_ROLES, ""]),
            reasonCategory: z.enum([
                "PROVIDER_OPT_OUT",
                "RIGHTS_INFRINGEMENT",
                "ILLEGAL_CONTENT",
                "INCORRECT_INFORMATION",
                "OTHER",
                "",
            ]),
            explanation: z.string(),
            name: z.string(),
            email: z.string(),
            goodFaithConfirmed: z.boolean(),
        })
        .superRefine((values, ctx) => {
            const seen = new Set<string>();
            values.additionalUrls.forEach(({ value }, index) => {
                const url = value.trim();
                if (!url) return;
                const path = ["additionalUrls", index, "value"];
                if (url.length > MAX_URL_LENGTH) {
                    ctx.addIssue({
                        code: "custom",
                        path,
                        message: t("contentNotice.errors.urlTooLong"),
                    });
                } else if (!isHttpUrl(url)) {
                    ctx.addIssue({
                        code: "custom",
                        path,
                        message: t("contentNotice.errors.urlInvalid"),
                    });
                } else if (seen.has(url)) {
                    ctx.addIssue({
                        code: "custom",
                        path,
                        message: t("contentNotice.errors.urlDuplicate"),
                    });
                }
                seen.add(url);
            });
            if (!values.submitterRole) {
                ctx.addIssue({
                    code: "custom",
                    path: ["submitterRole"],
                    message: t("contentNotice.errors.role"),
                });
            }
            if (!values.reasonCategory) {
                ctx.addIssue({
                    code: "custom",
                    path: ["reasonCategory"],
                    message: t("contentNotice.errors.reason"),
                });
            }
            const explanation = values.explanation.trim();
            if (values.reasonCategory !== "PROVIDER_OPT_OUT" && explanation.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["explanation"],
                    message: t("contentNotice.errors.explanation"),
                });
            } else if (explanation.length > MAX_EXPLANATION_LENGTH) {
                ctx.addIssue({
                    code: "custom",
                    path: ["explanation"],
                    message: t("contentNotice.errors.explanationTooLong"),
                });
            }
            const name = values.name.trim();
            if (name.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["name"],
                    message: t("contentNotice.errors.name"),
                });
            } else if (name.length > MAX_NAME_LENGTH) {
                ctx.addIssue({
                    code: "custom",
                    path: ["name"],
                    message: t("contentNotice.errors.nameTooLong"),
                });
            }
            const email = values.email.trim();
            if (email.length > MAX_EMAIL_LENGTH || !isNoticeEmail(email)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["email"],
                    message: t("contentNotice.errors.email"),
                });
            }
            if (!values.goodFaithConfirmed) {
                ctx.addIssue({
                    code: "custom",
                    path: ["goodFaithConfirmed"],
                    message: t("contentNotice.errors.goodFaith"),
                });
            }
        });
}

export type ContentNoticeRequest = {
    readonly body: SubmitContentNoticeData;
    /** Form index of each sent additional URL, so a `/additionalUrls/N` error finds its field. */
    readonly urlFormIndexes: readonly number[];
};

/** Builds the request from valid form values: the target's ID, never a URL of it. */
export function buildContentNoticeRequest(
    values: ContentNoticeFormValues,
    target: ContentNoticeTarget,
    language: LanguageData,
): ContentNoticeRequest {
    const scope = effectiveScope(target, values.scope);
    const urls: string[] = [];
    const urlFormIndexes: number[] = [];
    values.additionalUrls.forEach(({ value }, index) => {
        const url = value.trim();
        if (url) {
            urls.push(url);
            urlFormIndexes.push(index);
        }
    });
    const explanation = values.explanation.trim();
    return {
        body: {
            target:
                scope === "listing" && target.kind === "listing"
                    ? { type: "PRODUCT_LISTING", productListingId: target.productListingId }
                    : { type: "LISTING_SOURCE", listingSourceId: target.listingSourceId },
            submitterRole: values.submitterRole as ContentNoticeRole,
            reasonCategory: values.reasonCategory as ContentNoticeReason,
            ...(explanation ? { explanation } : {}),
            additionalUrls: urls,
            name: values.name.trim(),
            email: values.email.trim(),
            language,
            goodFaithConfirmed: true,
        },
        urlFormIndexes,
    };
}

const POINTER_FIELDS: Record<string, ContentNoticeFieldPath> = {
    "/submitterRole": "submitterRole",
    "/reasonCategory": "reasonCategory",
    "/explanation": "explanation",
    "/name": "name",
    "/email": "email",
    "/goodFaithConfirmed": "goodFaithConfirmed",
};

/** Maps a backend `source.field` JSON pointer to the form field it names. */
export function fieldForPointer(
    pointer: string | undefined,
    urlFormIndexes: readonly number[],
): ContentNoticeFieldPath | undefined {
    if (!pointer) return undefined;
    const direct = POINTER_FIELDS[pointer];
    if (direct) return direct;
    const url = /^\/additionalUrls(?:\/(\d+))?$/.exec(pointer);
    if (url) {
        const sent = url[1] === undefined ? 0 : Number(url[1]);
        const formIndex = urlFormIndexes[sent] ?? urlFormIndexes[0] ?? 0;
        return `additionalUrls.${formIndex}.value`;
    }
    return undefined;
}
