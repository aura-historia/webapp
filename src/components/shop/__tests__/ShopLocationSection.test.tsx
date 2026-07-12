import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopLocationSection } from "../ShopLocationSection.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";

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

describe("ShopLocationSection", () => {
    it("renders a structured postal address", () => {
        render(
            <ShopLocationSection
                shop={{
                    ...mockShop,
                    structuredAddress: {
                        addressline: "8 King St",
                        addresslineExtra: "St. James's",
                        locality: "London",
                        region: "England",
                        postalCode: "SW1Y 6QT",
                        country: "GB",
                    },
                }}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Wo Sie dieses Auktionshaus finden" }),
        ).toBeInTheDocument();
        expect(screen.getByText("8 King St")).toBeInTheDocument();
        expect(screen.getByText("St. James's")).toBeInTheDocument();
        expect(screen.getByText("SW1Y 6QT London")).toBeInTheDocument();
        expect(screen.getByText("England")).toBeInTheDocument();
        expect(screen.getByText("Vereinigtes Königreich")).toBeInTheDocument();
    });

    it("uses an OpenStreetMap embed when coordinates exist", () => {
        render(
            <ShopLocationSection
                shop={{
                    ...mockShop,
                    structuredAddress: { locality: "London", country: "GB" },
                    geoAddress: { lat: 51.5074, lon: -0.1278 },
                }}
            />,
        );

        const iframe = screen.getByTitle("Karte mit dem Standort von Christie's");
        expect(iframe).toHaveAttribute(
            "src",
            expect.stringContaining("openstreetmap.org/export/embed.html"),
        );
        expect(screen.queryByText("51.50740")).not.toBeInTheDocument();
        expect(screen.queryByText("-0.12780")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Karte öffnen" })).toHaveAttribute(
            "href",
            expect.stringContaining("openstreetmap.org"),
        );
    });

    it("falls back to a textual Google Maps embed when only the address exists", () => {
        render(
            <ShopLocationSection
                shop={{
                    ...mockShop,
                    structuredAddress: {
                        addressline: "8 King St",
                        locality: "London",
                        postalCode: "SW1Y 6QT",
                        country: "GB",
                    },
                }}
            />,
        );

        const iframe = screen.getByTitle("Karte mit dem Standort von Christie's");
        expect(iframe).toHaveAttribute("src", expect.stringContaining("google.com/maps"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("output=embed"));
    });

    it("shows an empty state when neither address nor coordinates exist", () => {
        render(<ShopLocationSection shop={mockShop} />);

        expect(
            screen.getByText("Wir haben noch keine Standortinformationen für dieses Auktionshaus."),
        ).toBeInTheDocument();
        expect(
            screen.queryByTitle("Karte mit dem Standort von Christie's"),
        ).not.toBeInTheDocument();
    });
});
