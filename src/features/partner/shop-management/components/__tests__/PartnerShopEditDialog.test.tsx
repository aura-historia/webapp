import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerShopEditDialog } from "../PartnerShopEditDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
}));

vi.mock("@/features/partner/shop-management/api/usePatchMyPartnerShop.ts", () => ({
    usePatchMyPartnerShop: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("PartnerShopEditDialog", () => {
    const shop = {
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
    });

    it("renders nothing when no shop is given", () => {
        const { container } = render(
            <PartnerShopEditDialog shop={null} open={false} onOpenChange={vi.fn()} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("prefills the form from the given shop and submits the edited values", async () => {
        const onOpenChange = vi.fn();
        const user = userEvent.setup();

        render(<PartnerShopEditDialog shop={shop} open onOpenChange={onOpenChange} />);

        await waitFor(() =>
            expect(screen.getByDisplayValue("https://aurora.example.com")).toBeInTheDocument(),
        );
        expect(screen.getByDisplayValue("aurora.myshopify.com")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                shopId: "shop-1",
                shopType: "AUCTION_HOUSE",
                domains: ["aurora.example.com"],
                shopifyDomain: "aurora.myshopify.com",
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                woocommerceCurrency: "USD",
                woocommerceLanguage: "en",
                url: "https://aurora.example.com",
                phone: "+49 30 123456",
                email: "contact@aurora.example.com",
            }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );

        const { onSuccess } = mockMutate.mock.calls[0][1];
        onSuccess();

        expect(mockToast.success).toHaveBeenCalledWith("Shop wurde aktualisiert.");
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("closes the dialog on cancel", async () => {
        const onOpenChange = vi.fn();
        const user = userEvent.setup();

        render(<PartnerShopEditDialog shop={shop} open onOpenChange={onOpenChange} />);

        await user.click(screen.getByRole("button", { name: "Abbrechen" }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("submits null for optional fields left empty on a minimal shop", async () => {
        const minimalShop = {
            shopId: "shop-2",
            shopSlugId: "minimal-shop",
            name: "Minimal Shop",
            partnerStatus: "PARTNERED" as const,
            domains: ["minimal.example.com", "minimal.example.com"],
            created: new Date("2024-01-01T00:00:00Z"),
            updated: new Date("2024-01-02T00:00:00Z"),
        };
        const user = userEvent.setup();

        render(<PartnerShopEditDialog shop={minimalShop} open onOpenChange={vi.fn()} />);

        await waitFor(() => expect(screen.getByDisplayValue("shop-2")).toBeInTheDocument());

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                shopId: "shop-2",
                shopType: undefined,
                domains: ["minimal.example.com"],
                shopifyDomain: null,
                shopifyCurrency: null,
                shopifyLanguage: null,
                woocommerceCurrency: null,
                woocommerceLanguage: null,
                url: null,
                image: null,
                phone: null,
                email: null,
                structuredAddress: null,
            }),
            expect.anything(),
        );
    });

    it("maps the shopify/woocommerce/country selects when the user picks a value", async () => {
        const shopWithDifferentDefaults = {
            ...shop,
            shopifyCurrency: "USD" as const,
            shopifyLanguage: "en" as const,
            woocommerceCurrency: "EUR" as const,
            woocommerceLanguage: "de" as const,
            structuredAddress: { ...shop.structuredAddress, country: "FR" as const },
        };
        const user = userEvent.setup();

        render(
            <PartnerShopEditDialog shop={shopWithDifferentDefaults} open onOpenChange={vi.fn()} />,
        );

        await waitFor(() =>
            expect(screen.getByDisplayValue("https://aurora.example.com")).toBeInTheDocument(),
        );

        await user.click(screen.getByRole("combobox", { name: "Shopify-Währung" }));
        await user.click(screen.getByRole("option", { name: "Euro (EUR)" }));

        await user.click(screen.getByRole("combobox", { name: "Shopify-Sprache" }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));

        await user.click(screen.getByRole("combobox", { name: "WooCommerce-Währung" }));
        await user.click(screen.getByRole("option", { name: "US-Dollar (USD)" }));

        await user.click(screen.getByRole("combobox", { name: "WooCommerce-Sprache" }));
        await user.click(screen.getByRole("option", { name: "Englisch" }));

        await user.click(screen.getByRole("combobox", { name: "Land" }));
        await user.click(screen.getByRole("option", { name: "Deutschland" }));

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                woocommerceCurrency: "USD",
                woocommerceLanguage: "en",
                structuredAddress: expect.objectContaining({ country: "DE" }),
            }),
            expect.anything(),
        );
    }, 15000);
});
