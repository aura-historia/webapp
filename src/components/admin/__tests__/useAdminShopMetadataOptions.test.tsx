import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminShopMetadataOptions } from "../useAdminShopMetadataOptions.ts";

const mockUseQuery = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-query", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");

    return {
        ...actual,
        useQuery: mockUseQuery,
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: {
            language: "en",
            resolvedLanguage: "en",
        },
    }),
}));

describe("useAdminShopMetadataOptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQuery
            .mockReturnValueOnce({
                data: [
                    {
                        categoryId: "furniture",
                        name: { text: "Furniture", language: "en" },
                    },
                ],
                isPending: false,
            })
            .mockReturnValueOnce({
                data: [
                    {
                        periodId: "baroque",
                        name: { text: "Baroque", language: "en" },
                    },
                ],
                isPending: false,
            });
    });

    it("uses readable labels for category, period, and country options", () => {
        const { result } = renderHook(() => useAdminShopMetadataOptions());

        expect(result.current.categoryOptions).toContainEqual({
            value: "furniture",
            label: "Furniture",
        });
        expect(result.current.periodOptions).toContainEqual({
            value: "baroque",
            label: "Baroque",
        });
        expect(result.current.countryOptions).toContainEqual({
            value: "DE",
            label: "Germany",
        });
    });
});
