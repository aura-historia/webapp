import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAdminShopMetadataOptions } from "../useAdminShopMetadataOptions.ts";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: {
            language: "en",
            resolvedLanguage: "en",
        },
    }),
}));

describe("useAdminShopMetadataOptions", () => {
    it("returns readable country, currency, and language options", () => {
        const { result } = renderHook(() => useAdminShopMetadataOptions());

        expect(result.current.countryOptions).toContainEqual({
            value: "DE",
            label: "Germany",
        });
        expect(result.current.currencyOptions).toContainEqual({
            value: "EUR",
            label: "Euro (EUR)",
        });
        expect(result.current.languageOptions).toContainEqual({
            value: "de",
            label: "German",
        });
    });
});
