import { describe, expect, it } from "vitest";
import {
    mapToAdminUserAccount,
    mapToAdminUserProfilePatch,
    mapToAdminUserSummary,
    toAdminUserProfileFormValues,
} from "../AdminUser.ts";

const summaryFixture = {
    userId: "opaque/user+01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    tier: "PRO" as const,
    role: "USER" as const,
};

const detailFixture = {
    userId: "opaque/user+01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: null,
    language: "en" as const,
    currency: "EUR" as const,
    measurementUnit: "METRIC" as const,
    showUnassessedOrSensitiveContent: true,
    tier: "PRO" as const,
    role: "USER" as const,
    created: "2020-01-01T00:00:00.000Z",
    updated: "2026-01-01T00:00:00.000Z",
    structuredAddress: { city: "London" },
};

describe("admin user DTO mapping", () => {
    it("maps a reduced search summary without fabricating detail-only fields", () => {
        const summary = mapToAdminUserSummary(summaryFixture);

        expect(summary).toEqual({
            userId: "opaque/user+01",
            email: "ada@example.test",
            firstName: "Ada",
            lastName: "Lovelace",
            role: "USER",
            tier: "pro",
        });
        expect(summary).not.toHaveProperty("language");
        expect(summary).not.toHaveProperty("created");
        expect(summary).not.toHaveProperty("showUnassessedOrSensitiveContent");
        expect(summary).not.toHaveProperty("stripeCustomerId");
    });

    it("maps account detail fields while dropping absent audit and address contract fields", () => {
        const account = mapToAdminUserAccount(detailFixture);

        expect(account).toEqual({
            userId: "opaque/user+01",
            email: "ada@example.test",
            firstName: "Ada",
            lastName: null,
            language: "en",
            currency: "EUR",
            measurementUnit: "METRIC",
            showUnassessedOrSensitiveContent: true,
            role: "USER",
            tier: "pro",
        });
        expect(account).not.toHaveProperty("created");
        expect(account).not.toHaveProperty("updated");
        expect(account).not.toHaveProperty("structuredAddress");
        expect(account).not.toHaveProperty("stripeCustomerId");
    });

    it("builds only changed nullable profile fields and never includes role or tier", () => {
        const account = mapToAdminUserAccount({ ...detailFixture, lastName: "Byron" });
        const formValues = toAdminUserProfileFormValues(account);
        const patch = mapToAdminUserProfilePatch(account, {
            ...formValues,
            email: "ada.new@example.test",
            lastName: "",
            currency: "GBP",
            showUnassessedOrSensitiveContent: false,
        });

        expect(patch).toEqual({
            email: "ada.new@example.test",
            lastName: null,
            currency: "GBP",
            showUnassessedOrSensitiveContent: false,
        });
        expect(patch).not.toHaveProperty("role");
        expect(patch).not.toHaveProperty("tier");
        expect(patch).not.toHaveProperty("stripeCustomerId");
        expect(patch).not.toHaveProperty("structuredAddress");
    });

    it.each(["KRW", "SEK", "ZAR"] as const)(
        "maps and patches the backend currency %s unchanged",
        (currency) => {
            const account = mapToAdminUserAccount({ ...detailFixture, currency });
            expect(account.currency).toBe(currency);

            const formValues = toAdminUserProfileFormValues(account);
            expect(formValues.currency).toBe(currency);
            expect(mapToAdminUserProfilePatch(account, formValues)).toEqual({});

            const fromEuro = mapToAdminUserAccount(detailFixture);
            expect(
                mapToAdminUserProfilePatch(fromEuro, {
                    ...toAdminUserProfileFormValues(fromEuro),
                    currency,
                }),
            ).toEqual({ currency });
        },
    );

    it("clears a new currency with an explicit null and keeps an unset currency unset", () => {
        const account = mapToAdminUserAccount({ ...detailFixture, currency: "SEK" });
        expect(
            mapToAdminUserProfilePatch(account, {
                ...toAdminUserProfileFormValues(account),
                currency: "",
            }),
        ).toEqual({ currency: null });

        const unset = mapToAdminUserAccount({ ...detailFixture, currency: null });
        expect(unset.currency).toBeNull();
        expect(toAdminUserProfileFormValues(unset).currency).toBe("");
        expect(mapToAdminUserProfilePatch(unset, toAdminUserProfileFormValues(unset))).toEqual({});
    });
});
