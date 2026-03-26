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
});
