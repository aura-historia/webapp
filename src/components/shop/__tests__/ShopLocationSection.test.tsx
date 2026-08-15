import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ShopLocationSection } from "../ShopLocationSection.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { UserPreferencesProvider } from "@/hooks/preferences/useUserPreferences.tsx";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";

const mockShop: ShopDetail = {
    shopId: "shop-uuid-123",
    shopSlugId: "christies",
    name: "Christie's",
    shopType: "AUCTION_HOUSE",
    partnerStatus: "PARTNERED",
    image: "https://example.com/logo.png",
    domains: ["christies.com"],
    url: "https://shop.christies.com",
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

function renderShopLocation(
    shop: ShopDetail,
    initialPreferences: Partial<UserPreferences> = { externalMapConsent: false },
) {
    return render(
        <UserPreferencesProvider initialPreferences={initialPreferences} locale="de-DE">
            <ShopLocationSection shop={shop} />
        </UserPreferencesProvider>,
    );
}

describe("ShopLocationSection", () => {
    it("renders a structured postal address", () => {
        renderShopLocation({
            ...mockShop,
            structuredAddress: {
                addressline: "8 King St",
                addresslineExtra: "St. James's",
                locality: "London",
                region: "England",
                postalCode: "SW1Y 6QT",
                country: "GB",
            },
        });

        expect(
            screen.getByRole("heading", { name: "Wo Sie dieses Auktionshaus finden" }),
        ).toBeInTheDocument();
        expect(screen.getByText("8 King St")).toBeInTheDocument();
        expect(screen.getByText("St. James's")).toBeInTheDocument();
        expect(screen.getByText("SW1Y 6QT London")).toBeInTheDocument();
        expect(screen.getByText("England")).toBeInTheDocument();
        expect(screen.getByText("Vereinigtes Königreich")).toBeInTheDocument();
    });

    it("renders clickable contact links when email and phone exist", () => {
        renderShopLocation({
            ...mockShop,
            email: "contact@christies.example",
            phone: "+44 20 7839 9060",
            structuredAddress: { locality: "London", country: "GB" },
        });

        expect(screen.getByRole("link", { name: /contact@christies\.example/i })).toHaveAttribute(
            "href",
            "mailto:contact@christies.example",
        );
        expect(screen.getByRole("link", { name: /\+44 20 7839 9060/i })).toHaveAttribute(
            "href",
            "tel:+442078399060",
        );
    });

    it("does not load Google Maps before map consent", async () => {
        const user = userEvent.setup();
        renderShopLocation({
            ...mockShop,
            structuredAddress: { locality: "London", country: "GB" },
            geoAddress: { lat: 51.5074, lon: -0.1278 },
        });

        expect(
            screen.queryByTitle("Karte mit dem Standort von Christie's"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Karte erst nach Zustimmung laden")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Cookie-Einstellungen" })).toHaveAttribute(
            "href",
            "/de/consent-settings",
        );

        await user.click(screen.getByRole("button", { name: "Karte anzeigen" }));

        expect(screen.getByTitle("Karte mit dem Standort von Christie's")).toHaveAttribute(
            "src",
            expect.stringContaining("google.com/maps"),
        );
    });

    it("uses a localized Google Maps embed when coordinates exist", () => {
        renderShopLocation(
            {
                ...mockShop,
                structuredAddress: { locality: "London", country: "GB" },
                geoAddress: { lat: 51.5074, lon: -0.1278 },
            },
            { externalMapConsent: true },
        );

        const iframe = screen.getByTitle("Karte mit dem Standort von Christie's");
        expect(iframe).toHaveAttribute("src", expect.stringContaining("google.com/maps"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("hl=de"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("q=51.5074%2C-0.1278"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("z=14"));
        expect(screen.queryByText("51.50740")).not.toBeInTheDocument();
        expect(screen.queryByText("-0.12780")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Karte öffnen" })).not.toBeInTheDocument();
    });

    it("falls back to a textual Google Maps embed when only the address exists", () => {
        renderShopLocation(
            {
                ...mockShop,
                structuredAddress: {
                    addressline: "8 King St",
                    locality: "London",
                    postalCode: "SW1Y 6QT",
                    country: "GB",
                },
            },
            { externalMapConsent: true },
        );

        const iframe = screen.getByTitle("Karte mit dem Standort von Christie's");
        expect(iframe).toHaveAttribute("src", expect.stringContaining("google.com/maps"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("hl=de"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("output=embed"));
    });

    it("shows an empty state when neither address nor coordinates exist", () => {
        renderShopLocation(mockShop);

        expect(
            screen.getByText("Wir haben noch keine Standortinformationen für dieses Auktionshaus."),
        ).toBeInTheDocument();
        expect(
            screen.queryByTitle("Karte mit dem Standort von Christie's"),
        ).not.toBeInTheDocument();
    });
});
