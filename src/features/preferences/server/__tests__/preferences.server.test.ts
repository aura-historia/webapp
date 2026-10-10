import { describe, it, expect, vi } from "vitest";
import { getServerPreferences } from "../preferences.ts";
import { getCookie } from "@tanstack/react-start/server";

vi.mock("@tanstack/react-start", () => ({
    createServerFn: vi.fn().mockReturnValue({
        handler: (cb: (...args: unknown[]) => unknown) => cb,
    }),
}));

vi.mock("@tanstack/react-start/server", () => ({
    getCookie: vi.fn(),
}));

describe("getServerPreferences", () => {
    it("returns an empty object when the cookie is absent", async () => {
        vi.mocked(getCookie).mockReturnValue(undefined);

        const result = await getServerPreferences();

        expect(result).toEqual({});
    });

    it("returns parsed preferences when a valid JSON cookie is present", async () => {
        vi.mocked(getCookie).mockReturnValue(JSON.stringify({ trackingConsent: true }));

        const result = await getServerPreferences();

        expect(result).toEqual({ trackingConsent: true });
        expect(getCookie).toHaveBeenCalledWith("user-preferences");
    });

    it("returns an empty object when the cookie contains malformed JSON", async () => {
        vi.mocked(getCookie).mockReturnValue("not-valid-json{{{");

        const result = await getServerPreferences();

        expect(result).toEqual({});
    });

    it("returns an empty object when the cookie is an empty string", async () => {
        vi.mocked(getCookie).mockReturnValue("");

        const result = await getServerPreferences();

        expect(result).toEqual({});
    });

    it.each(["ZAR", "SEK", "DKK", "NOK", "KRW", "INR", "TWD", "HUF", "RON", "MXN", "THB"])(
        "keeps the newly supported currency %s from the cookie",
        async (currency) => {
            vi.mocked(getCookie).mockReturnValue(
                encodeURIComponent(JSON.stringify({ currency, unitSystem: "METRIC" })),
            );

            const result = await getServerPreferences();

            expect(result).toEqual({ currency, unitSystem: "METRIC" });
        },
    );

    it.each(["XYZ", "sek", "krw", "", "EURO"])(
        "drops the unsupported currency %j but keeps other preferences",
        async (currency) => {
            vi.mocked(getCookie).mockReturnValue(
                encodeURIComponent(JSON.stringify({ currency, trackingConsent: true })),
            );

            const result = await getServerPreferences();

            expect(result).toEqual({ trackingConsent: true });
        },
    );

    it("drops a non-string currency value", async () => {
        vi.mocked(getCookie).mockReturnValue(JSON.stringify({ currency: 978 }));

        const result = await getServerPreferences();

        expect(result).toEqual({});
    });
});
