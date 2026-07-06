import { vi } from "vitest";
import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";

const authState = vi.hoisted(() => ({
    isAuthenticated: true,
    isResolved: true,
}));

vi.mock(
    "@/features/partner/partner-program/components/api-reference/PartnerProductsApiReference.tsx",
    () => ({
        default: () => (
            <div data-testid="partner-products-api-reference">Partner API reference</div>
        ),
    }),
);

vi.mock("@/hooks/auth/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => authState,
}));

describe("PartnerCustomIntegrationPage", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        authState.isAuthenticated = true;
        authState.isResolved = true;

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("links the primary CTA to access-token management", () => {
        expect(screen.getByRole("heading", { name: "Shop per API anbinden" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Zugriffstoken verwalten/i })).toHaveAttribute(
            "href",
            "/partners/access-tokens",
        );
    });

    it("opens the pre-filled access-token form from Step 1", () => {
        expect(screen.queryByText("Zugangsdaten erstellen und sichern")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Benutzer-Zugriffstoken erstellen" }));

        expect(screen.getByLabelText("Name")).toHaveValue("Produktsynchronisation per eigener API");
        expect(screen.getByLabelText("Produkte schreiben")).toBeChecked();
        expect(screen.getByLabelText("Shops verwalten")).not.toBeChecked();
    });

    it("shows a cURL example with highlighted user token and shop ID placeholders", () => {
        expect(screen.getByTestId("partner-product-code-example")).toBeInTheDocument();
        expect(
            screen.getByText(/YOUR_USER_ACCESS_TOKEN im Authorization-Header/),
        ).toBeInTheDocument();
        expect(screen.getByText(/YOUR_SHOP_ID in der Request-URL/)).toBeInTheDocument();
        expect(screen.getByText("YOUR_USER_ACCESS_TOKEN").tagName).toBe("MARK");
        expect(screen.getByText("YOUR_SHOP_ID").tagName).toBe("MARK");
    });

    it("renders the cURL example for signed-out users", async () => {
        cleanup();
        authState.isAuthenticated = false;

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });

        expect(screen.getByTestId("partner-product-code-example")).toBeInTheDocument();
    });

    it("omits the decorative visuals from the guide steps", () => {
        expect(screen.queryByText("Produkt-Batch senden")).not.toBeInTheDocument();
        expect(screen.queryByText("Sync aktualisieren")).not.toBeInTheDocument();
        expect(screen.queryByText("Shop-Seite prüfen")).not.toBeInTheDocument();
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
