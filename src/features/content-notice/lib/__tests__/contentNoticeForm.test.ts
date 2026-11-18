import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
    buildContentNoticeRequest,
    type ContentNoticeFormValues,
    EMPTY_CONTENT_NOTICE_FORM,
    fieldForPointer,
    getContentNoticeSchema,
    isNoticeEmail,
    reasonsForRole,
} from "../contentNoticeForm.ts";
import type {
    ContentNoticeListingTarget,
    ContentNoticeProviderTarget,
} from "../contentNoticeTarget.ts";
import { validateContentNoticeSearch } from "../contentNoticeSearch.ts";

const t = ((key: string) => key) as unknown as TFunction;
const schema = getContentNoticeSchema(t);

const listing: ContentNoticeListingTarget = {
    kind: "listing",
    productListingId: "pl_1",
    productListingTitleSlugId: "vase-pl_1",
    title: "Vase",
    listingSourceId: "ls_1",
    providerName: "Hartley & Finch",
    providerSlugId: "hartley-finch",
    partner: false,
};

const provider: ContentNoticeProviderTarget = {
    kind: "provider",
    listingSourceId: "ls_1",
    providerName: "Hartley & Finch",
    providerSlugId: "hartley-finch",
    partner: true,
};

const valid: ContentNoticeFormValues = {
    ...EMPTY_CONTENT_NOTICE_FORM,
    submitterRole: "RIGHTS_HOLDER",
    reasonCategory: "RIGHTS_INFRINGEMENT",
    explanation: "  The photograph is mine.  ",
    name: " Marie Roth ",
    email: " marie@example.com ",
    goodFaithConfirmed: true,
};

function issues(values: ContentNoticeFormValues) {
    const result = schema.safeParse(values);
    return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("validateContentNoticeSearch", () => {
    it("keeps one well-formed slug, preferring the listing", () => {
        expect(
            validateContentNoticeSearch({ listing: "vase-pl_1", provider: "x" } as never),
        ).toEqual({
            listing: "vase-pl_1",
        });
        expect(validateContentNoticeSearch({ provider: " hartley-finch " } as never)).toEqual({
            provider: "hartley-finch",
        });
        expect(validateContentNoticeSearch({ listing: "../etc", provider: 3 } as never)).toEqual(
            {},
        );
    });
});

describe("reasonsForRole", () => {
    it("offers the opt-out only to the provider", () => {
        expect(reasonsForRole("PROVIDER")[0]).toBe("PROVIDER_OPT_OUT");
        expect(reasonsForRole("RIGHTS_HOLDER")).not.toContain("PROVIDER_OPT_OUT");
        expect(reasonsForRole("ILLEGAL_CONTENT_REPORTER")).not.toContain("PROVIDER_OPT_OUT");
        expect(reasonsForRole("")).not.toContain("PROVIDER_OPT_OUT");
        expect(reasonsForRole("OTHER")[0]).toBe("INCORRECT_INFORMATION");
        expect(reasonsForRole("OTHER")).not.toContain("PROVIDER_OPT_OUT");
    });
});

describe("getContentNoticeSchema", () => {
    it("requires role, reason, explanation, name, e-mail and the good-faith statement", () => {
        expect(issues(EMPTY_CONTENT_NOTICE_FORM)).toEqual([
            "submitterRole",
            "reasonCategory",
            "explanation",
            "name",
            "email",
            "goodFaithConfirmed",
        ]);
        expect(issues(valid)).toEqual([]);
    });

    it("lets a provider opt out without an explanation", () => {
        expect(
            issues({
                ...valid,
                submitterRole: "PROVIDER",
                reasonCategory: "PROVIDER_OPT_OUT",
                explanation: "",
            }),
        ).toEqual([]);
    });

    it("rejects an over-long explanation, invalid and duplicate links and a non-ASCII local part", () => {
        expect(issues({ ...valid, explanation: "x".repeat(5001) })).toEqual(["explanation"]);
        expect(
            issues({
                ...valid,
                additionalUrls: [
                    { value: "hartleyfinch.co.uk/lot" },
                    { value: "https://example.com/a" },
                    { value: "https://example.com/a" },
                    { value: "" },
                ],
            }),
        ).toEqual(["additionalUrls.0.value", "additionalUrls.2.value"]);
        expect(issues({ ...valid, email: "mär@example.com" })).toEqual(["email"]);
    });
});

describe("anonymous reports (backend#3011)", () => {
    const anonymous: ContentNoticeFormValues = {
        ...valid,
        submitterRole: "ILLEGAL_CONTENT_REPORTER",
        reasonCategory: "ILLEGAL_CONTENT",
        name: " ",
        email: "",
    };

    it("lets only a report of illegal content leave name and e-mail empty", () => {
        expect(issues(anonymous)).toEqual([]);
        expect(issues({ ...anonymous, email: "not-an-address" })).toEqual(["email"]);
        expect(issues({ ...anonymous, submitterRole: "OTHER" })).toEqual(["name", "email"]);
        expect(issues({ ...anonymous, submitterRole: "RIGHTS_HOLDER" })).toEqual(["name", "email"]);
    });

    it("leaves blank contact fields out of the request", () => {
        const { body } = buildContentNoticeRequest(anonymous, listing, "de");
        expect(body).not.toHaveProperty("name");
        expect(body).not.toHaveProperty("email");
        expect(body.language).toBe("de");
        expect(
            buildContentNoticeRequest({ ...anonymous, email: "marie@example.com" }, listing, "de")
                .body,
        ).toMatchObject({ email: "marie@example.com" });
    });
});

describe("buildContentNoticeRequest", () => {
    it("sends the listing ID, trimmed text and non-empty links with their form positions", () => {
        const request = buildContentNoticeRequest(
            { ...valid, additionalUrls: [{ value: "" }, { value: " https://example.com/a " }] },
            listing,
            "de",
        );
        expect(request.body).toEqual({
            target: { type: "PRODUCT_LISTING", productListingId: "pl_1" },
            submitterRole: "RIGHTS_HOLDER",
            reasonCategory: "RIGHTS_INFRINGEMENT",
            explanation: "The photograph is mine.",
            additionalUrls: ["https://example.com/a"],
            name: "Marie Roth",
            email: "marie@example.com",
            language: "de",
            goodFaithConfirmed: true,
        });
        expect(request.urlFormIndexes).toEqual([1]);
    });

    it("sends the source ID for all listings of the provider and omits an empty opt-out explanation", () => {
        const fromListing = buildContentNoticeRequest(
            { ...valid, scope: "provider" },
            listing,
            "en",
        );
        expect(fromListing.body.target).toEqual({
            type: "LISTING_SOURCE",
            listingSourceId: "ls_1",
        });

        const optOut = buildContentNoticeRequest(
            {
                ...valid,
                submitterRole: "PROVIDER",
                reasonCategory: "PROVIDER_OPT_OUT",
                explanation: " ",
            },
            provider,
            "en",
        );
        expect(optOut.body.target).toEqual({ type: "LISTING_SOURCE", listingSourceId: "ls_1" });
        expect(optOut.body).not.toHaveProperty("explanation");
    });
});

describe("fieldForPointer", () => {
    it("maps backend JSON pointers to form fields, links by their form position", () => {
        expect(fieldForPointer("/explanation", [])).toBe("explanation");
        expect(fieldForPointer("/goodFaithConfirmed", [])).toBe("goodFaithConfirmed");
        expect(fieldForPointer("/additionalUrls/1", [0, 3])).toBe("additionalUrls.3.value");
        expect(fieldForPointer("/target/productListingId", [])).toBeUndefined();
        expect(fieldForPointer(undefined, [])).toBeUndefined();
    });
});

describe("isNoticeEmail", () => {
    it("accepts a bare address with an ASCII local part and a dotted domain", () => {
        expect(isNoticeEmail("marie@example.com")).toBe(true);
        expect(isNoticeEmail("m.roth+notice@mail.example.co.uk")).toBe(true);
        for (const invalid of [
            "",
            "marie",
            "@example.com",
            "marie@example",
            "marie@.com",
            "marie@example.",
            "ma rie@example.com",
            "marie@exa mple.com",
            "marie@@example.com",
            "mär@example.com",
        ]) {
            expect(isNoticeEmail(invalid), invalid).toBe(false);
        }
    });
});
