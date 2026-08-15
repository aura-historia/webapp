import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPreferredLocale } from "../i18n.ts";
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

describe("getPreferredLocale", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getCookie).mockReturnValue(undefined);
    });

    it("uses an explicitly saved language before the browser language", async () => {
        vi.mocked(getCookie).mockReturnValue("de");
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: () => "fr-CH, fr;q=0.9",
        } as unknown as Headers);

        const result = await getPreferredLocale();

        expect(result).toBe("de");
    });

    it("ignores an unsupported saved language", async () => {
        vi.mocked(getCookie).mockReturnValue("nl");
        vi.mocked(getRequestHeaders).mockReturnValue({
            get: () => "fr-CH, fr;q=0.9",
        } as unknown as Headers);

        const result = await getPreferredLocale();

        expect(result).toBe("fr");
    });

    describe("Accept-Language header fallback", () => {
        it("uses the preferred supported browser language", async () => {
            vi.mocked(getRequestHeaders).mockReturnValue({
                get: (key: string) =>
                    key === "accept-language" ? "fr-CH, fr;q=0.9, en;q=0.8" : null,
            } as unknown as Headers);

            const result = await getPreferredLocale();

            expect(result).toBe("fr");
        });

        it("falls back to default language if accept-language header has no match", async () => {
            vi.mocked(getRequestHeaders).mockReturnValue({
                get: (key: string) => (key === "accept-language" ? "zh-CN" : null),
            } as unknown as Headers);

            const result = await getPreferredLocale();

            expect(result).toBe("en");
        });

        it("falls back to default language if no header is present", async () => {
            vi.mocked(getRequestHeaders).mockReturnValue({
                get: () => null,
            } as unknown as Headers);

            const result = await getPreferredLocale();

            expect(result).toBe("en");
        });
    });
});
