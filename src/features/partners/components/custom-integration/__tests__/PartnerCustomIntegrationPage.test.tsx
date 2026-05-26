import { vi } from "vitest";
import PartnerCustomIntegrationPage from "@/features/partners/components/custom-integration/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, fireEvent, screen } from "@testing-library/react";

vi.mock("@/features/partners/components/PartnerProductsApiReference.tsx", () => ({
    default: () => <div data-testid="partner-products-api-reference">Partner API reference</div>,
}));

describe("PartnerCustomIntegrationPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("renders the custom integration guide hero and primary CTA", () => {
        expect(screen.getByRole("heading", { name: "Shop per API anbinden" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /API-Key anfragen/i })).toHaveAttribute(
            "href",
            "/partners/apply",
        );
    });

    it("explains the asynchronous event-sink concept", () => {
        expect(screen.getByText("Für asynchrone Produktimporte gebaut")).toBeInTheDocument();
        expect(screen.getByText(/202 Accepted/i)).toBeInTheDocument();
    });

    it("embeds the interactive partner API reference without redundant endpoint cards", () => {
        expect(screen.getByTestId("partner-products-api-reference")).toBeInTheDocument();
        expect(
            screen.queryByText("Die drei Endpunkte für den Produkt-Sync"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Endpunkt separat öffnen")).not.toBeInTheDocument();
    });

    it("builds the final shop-page CTA from the entered shop slug", () => {
        const input = screen.getByLabelText("Ihr Shop-Slug");

        fireEvent.change(input, { target: { value: "mein-laden" } });

        expect(screen.getByRole("link", { name: /Meine Shop-Seite öffnen/i })).toHaveAttribute(
            "href",
            "/shops/mein-laden",
        );
    });
});
