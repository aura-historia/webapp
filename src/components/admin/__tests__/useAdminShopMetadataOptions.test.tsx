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
    it("returns readable country options", () => {
        const { result } = renderHook(() => useAdminShopMetadataOptions());

        expect(result.current.countryOptions).toContainEqual({
            value: "DE",
            label: "Germany",
        });
    });
});
