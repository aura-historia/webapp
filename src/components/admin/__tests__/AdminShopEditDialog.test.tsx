import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShopEditDialog } from "../AdminShopEditDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());
const mockUseAdminShop = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
}));

vi.mock("@/hooks/admin/usePatchAdminShop.ts", () => ({
    usePatchAdminShop: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("@/components/admin/useAdminShopMetadataOptions.ts", () => ({
    useAdminShopMetadataOptions: () => ({
        countryOptions: [{ value: "DE", label: "Deutschland" }],
        currencyOptions: [
            { value: "EUR", label: "Euro (EUR)" },
            { value: "USD", label: "US Dollar (USD)" },
        ],
        languageOptions: [
            { value: "de", label: "Deutsch" },
            { value: "en", label: "English" },
        ],
    }),
}));

vi.mock("@/hooks/admin/useAdminShops.ts", () => ({
    useAdminShop: mockUseAdminShop,
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("AdminShopEditDialog", () => {
    const loadedShop = {
        shopId: "shop-1",
        shopSlugId: "aurora-antiques",
        name: "Aurora Antiques",
        shopType: "AUCTION_HOUSE" as const,
        partnerStatus: "PARTNERED" as const,
        domains: ["aurora.example.com"],
        shopifyDomain: "aurora.myshopify.com",
        shopifyCurrency: "EUR" as const,
        shopifyLanguage: "de" as const,
        woocommerceCurrency: "USD" as const,
        woocommerceLanguage: "en" as const,
        url: "https://aurora.example.com",
        image: "https://example.com/logo.png",
        phone: "+49 30 123456",
        email: "contact@aurora.example.com",
        structuredAddress: {
            addressline: "Main Street 1",
            locality: "Berlin",
            country: "DE" as const,
        },
        created: new Date("2024-01-01T00:00:00Z"),
        updated: new Date("2024-01-02T00:00:00Z"),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAdminShop.mockReturnValue({
            data: loadedShop,
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("loads shop detail and displays saved platform metadata values", async () => {
        const user = userEvent.setup();

        render(
            <AdminShopEditDialog
                shop={{
                    shopId: "shop-1",
                    shopSlugId: "aurora-antiques",
                    name: "Aurora Antiques",
                    shopType: "AUCTION_HOUSE",
                    partnerStatus: "PARTNERED",
                    domains: ["aurora.example.com"],
                    created: new Date("2024-01-01T00:00:00Z"),
                    updated: new Date("2024-01-02T00:00:00Z"),
                }}
                open
                onOpenChange={vi.fn()}
            />,
        );

        await waitFor(() =>
            expect(screen.getByDisplayValue("https://aurora.example.com")).toBeInTheDocument(),
        );
        expect(screen.getByDisplayValue("aurora.myshopify.com")).toBeInTheDocument();
        expect(
            screen.getAllByRole("combobox").map((combobox) => combobox.textContent?.trim()),
        ).toEqual(expect.arrayContaining(["Euro (EUR)", "Deutsch", "US Dollar (USD)", "English"]));

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            {
                shopId: "shop-1",
                shopType: "AUCTION_HOUSE",
                domains: ["aurora.example.com"],
                shopifyDomain: "aurora.myshopify.com",
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                woocommerceCurrency: "USD",
                woocommerceLanguage: "en",
                url: "https://aurora.example.com",
                image: "https://example.com/logo.png",
                phone: "+49 30 123456",
                email: "contact@aurora.example.com",
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });
});
