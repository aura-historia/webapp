import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLocale } from "../i18n.server.ts";
import { getCookie, getRequestHeaders } from "@tanstack/react-start/server";

vi.mock("@tanstack/react-start", () => ({
    createServerFn: vi.fn().mockReturnValue({
        handler: (cb: (...args: unknown[]) => unknown) => cb,
    }),
}));

vi.mock("@tanstack/react-start/server", () => ({
    getCookie: vi.fn(),
    getRequestHeaders: vi.fn(),
}));

vi.mock("@/i18n/languages.ts", () => ({
    DEFAULT_LANGUAGE: "en",
    SUPPORTED_LANGUAGES: [{ code: "en" }, { code: "de" }, { code: "fr" }],
}));

describe("getLocale", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the language from cookie if it is supported", async () => {
        vi.mocked(getCookie).mockReturnValue("de");

        const result = await getLocale();

        expect(result).toBe("de");
        expect(getCookie).toHaveBeenCalledWith("i18next");
    });

    it("ignores the cookie if the language is not supported", async () => {
        vi.mocked(getCookie).mockReturnValue("es"); // 'es' is not in mocked supported languages
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: () => null,
        } as unknown as Headers);

        const result = await getLocale();

        expect(result).toBe("en"); // Fallback to default
    });

    it("uses accept-language header if cookie is missing", async () => {
        vi.mocked(getCookie).mockReturnValue(undefined);
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: (key: string) => (key === "accept-language" ? "fr-CH, fr;q=0.9, en;q=0.8" : null),
        } as unknown as Headers);

        const result = await getLocale();

        expect(result).toBe("fr");
    });

    it("falls back to default language if accept-language header has no match", async () => {
        vi.mocked(getCookie).mockReturnValue(undefined);
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: (key: string) => (key === "accept-language" ? "zh-CN" : null),
        } as unknown as Headers);

        const result = await getLocale();

        expect(result).toBe("en");
    });

    it("falls back to default language if no cookie and no header present", async () => {
        vi.mocked(getCookie).mockReturnValue(undefined);
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: () => null,
        } as unknown as Headers);

        const result = await getLocale();

        expect(result).toBe("en");
    });
});
