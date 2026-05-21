import { vi } from "vitest";
import PartnerCustomIntegrationPage from "@/components/partners/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, fireEvent, screen } from "@testing-library/react";

vi.mock("@/components/partners/PartnerProductsApiReference.tsx", () => ({
    default: () => <div data-testid="partner-products-api-reference">Partner API reference</div>,
}));

describe("PartnerCustomIntegrationPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("renders the custom integration guide hero and primary CTA", () => {
        expect(
            screen.getByRole("heading", { name: "Eigene Integration per API" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /API-Key jetzt holen/i })).toHaveAttribute(
            "href",
            "/partners/apply",
        );
    });

    it("explains the asynchronous event-sink concept", () => {
        expect(screen.getByText("Event-Sink statt klassischer REST-Antworten")).toBeInTheDocument();
        expect(screen.getByText(/202 Accepted/i)).toBeInTheDocument();
    });

    it("embeds all relevant partner API endpoints", () => {
        const methodBadges = screen.getAllByText(/^(PUT|POST|PATCH)$/);

        expect(methodBadges).toHaveLength(3);
        expect(methodBadges.map((badge) => badge.textContent)).toEqual(["PUT", "POST", "PATCH"]);
        expect(screen.getByTestId("partner-products-api-reference")).toBeInTheDocument();
    });

    it("builds the final shop-page CTA from the entered shop slug", () => {
        const input = screen.getByLabelText("Ihre Shop-Slug-ID");

        fireEvent.change(input, { target: { value: "mein-laden" } });

        expect(screen.getByRole("link", { name: /Meine Shop-Seite öffnen/i })).toHaveAttribute(
            "href",
            "/shops/mein-laden",
        );
    });
});
