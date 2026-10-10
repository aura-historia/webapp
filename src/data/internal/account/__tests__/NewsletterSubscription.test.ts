import { describe, expect, it } from "vitest";
import { mapToBackendNewsletterSubscription } from "../NewsletterSubscription.ts";

describe("mapToBackendNewsletterSubscription", () => {
    it.each(["KRW", "SEK", "ZAR", "CHF", "TWD"] as const)(
        "sends the currency %s unchanged",
        (currency) => {
            expect(
                mapToBackendNewsletterSubscription({ email: "user@example.com", currency }),
            ).toEqual({ email: "user@example.com", currency });
        },
    );

    it("omits an undefined currency and preserves an explicit null", () => {
        expect(mapToBackendNewsletterSubscription({ email: "user@example.com" })).toEqual({
            email: "user@example.com",
        });
        expect(
            mapToBackendNewsletterSubscription({ email: "user@example.com", currency: null }),
        ).toEqual({ email: "user@example.com", currency: null });
    });
});
