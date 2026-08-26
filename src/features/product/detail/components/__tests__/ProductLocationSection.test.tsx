import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductLocationSection } from "../ProductLocationSection.tsx";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import type { UserPreferences } from "@/features/preferences/types/UserPreferences.ts";
import type { GeoAddress, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";

type MockProductLocation = {
    readonly title: string;
    readonly structuredAddress?: StructuredAddress;
    readonly geoAddress?: GeoAddress;
};

const mockProduct: MockProductLocation = {
    title: "Vintage Vase",
};

function renderProductLocation(
    product: MockProductLocation,
    initialPreferences: Partial<UserPreferences> = { externalMapConsent: false },
) {
    return render(
        <UserPreferencesProvider initialPreferences={initialPreferences} locale="de-DE">
            <ProductLocationSection {...product} />
        </UserPreferencesProvider>,
    );
}

describe("ProductLocationSection", () => {
    it("renders a structured postal address using item-focused copy", () => {
        renderProductLocation({
            ...mockProduct,
            structuredAddress: {
                addressline: "8 King St",
                locality: "London",
                postalCode: "SW1Y 6QT",
                country: "GB",
            },
        });

        expect(
            screen.getByRole("heading", { name: "Wo sich dieser Artikel befindet" }),
        ).toBeInTheDocument();
        expect(screen.getByText("8 King St")).toBeInTheDocument();
        expect(screen.getByText("SW1Y 6QT London")).toBeInTheDocument();
    });

    it("never renders a contact block, since products have no contact data", () => {
        renderProductLocation({
            ...mockProduct,
            structuredAddress: { locality: "London", country: "GB" },
        });

        expect(screen.queryByText("Kontakt")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /mailto:/i })).not.toBeInTheDocument();
    });

    it("does not load Google Maps before map consent", async () => {
        const user = userEvent.setup();
        renderProductLocation({
            ...mockProduct,
            structuredAddress: { locality: "London", country: "GB" },
            geoAddress: { lat: 51.5074, lon: -0.1278 },
        });

        expect(
            screen.queryByTitle("Karte mit dem Standort von Vintage Vase"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Karte erst nach Zustimmung laden")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Karte anzeigen" }));

        expect(screen.getByTitle("Karte mit dem Standort von Vintage Vase")).toHaveAttribute(
            "src",
            expect.stringContaining("google.com/maps"),
        );
    });

    it("uses a localized Google Maps embed when coordinates exist", () => {
        renderProductLocation(
            {
                ...mockProduct,
                structuredAddress: { locality: "London", country: "GB" },
                geoAddress: { lat: 51.5074, lon: -0.1278 },
            },
            { externalMapConsent: true },
        );

        const iframe = screen.getByTitle("Karte mit dem Standort von Vintage Vase");
        expect(iframe).toHaveAttribute("src", expect.stringContaining("google.com/maps"));
        expect(iframe).toHaveAttribute("src", expect.stringContaining("q=51.5074%2C-0.1278"));
    });

    it("shows an item-focused empty state when neither address nor coordinates exist", () => {
        renderProductLocation(mockProduct);

        expect(
            screen.getByText("Wir haben noch keine Standortinformationen für diesen Artikel."),
        ).toBeInTheDocument();
        expect(
            screen.queryByTitle("Karte mit dem Standort von Vintage Vase"),
        ).not.toBeInTheDocument();
    });
});
