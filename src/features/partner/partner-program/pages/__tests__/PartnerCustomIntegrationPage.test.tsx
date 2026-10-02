import { vi } from "vitest";
import { useState } from "react";
import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";

const authState = vi.hoisted(() => ({
    isAuthenticated: true,
    isResolved: true,
}));

const listingSourceState = vi.hoisted(() => ({
    data: [
        { listingSourceId: "shop-1", listingSourceSlugId: "erster-shop", name: "Erster Shop" },
        { listingSourceId: "shop-2", listingSourceSlugId: "zweiter-shop", name: "Zweiter Shop" },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
}));

const partnerApplicationState = vi.hoisted(() => ({
    data: [] as Array<{
        id: string;
        businessState: "SUBMITTED" | "IN_REVIEW";
        payload: { shopName: string };
    }>,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
}));

vi.mock(
    "@/features/partner/partner-program/components/api-reference/PartnerProductsApiReference.tsx",
    () => ({
        default: () => (
            <div data-testid="partner-products-api-reference">Partner API reference</div>
        ),
    }),
);

vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => authState,
}));

vi.mock("@/features/partner/common/api/useOwnListingSources.ts", () => ({
    useOwnListingSources: () => listingSourceState,
}));

vi.mock(
    "@/features/partner/application-management/api/usePartnerApplications.ts",
    async (importOriginal) => ({
        ...(await importOriginal<
            typeof import("@/features/partner/application-management/api/usePartnerApplications.ts")
        >()),
        usePartnerApplications: () => partnerApplicationState,
    }),
);

function RefreshableIntegrationPage() {
    const [, refresh] = useState(0);
    return (
        <>
            <button type="button" onClick={() => refresh((value) => value + 1)}>
                Refresh view
            </button>
            <PartnerCustomIntegrationPage />
        </>
    );
}

describe("PartnerCustomIntegrationPage", () => {
    it("clears selection and source links when a grant is revoked", async () => {
        cleanup();
        await act(async () => {
            renderWithRouter(<RefreshableIntegrationPage />);
        });
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        listingSourceState.data = [];
        fireEvent.click(screen.getByRole("button", { name: "Refresh view" }));
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /Meine Shop-Seite öffnen/i }),
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("partner-product-code-example")).not.toHaveTextContent(
            "/shops/shop-2/products",
        );
        expect(
            screen.getByText(
                "Sie haben derzeit keinen Zugriff auf Angebotsquellen. Eine frühere Freigabe wurde möglicherweise widerrufen.",
            ),
        ).toBeInTheDocument();
    });

    it("withholds cached source choices and links after a denied refresh", async () => {
        cleanup();
        await act(async () => {
            renderWithRouter(<RefreshableIntegrationPage />);
        });
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        listingSourceState.isError = true;
        fireEvent.click(screen.getByRole("button", { name: "Refresh view" }));
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /Meine Shop-Seite öffnen/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText("Der Zugriff auf Angebotsquellen konnte nicht geprüft werden."),
        ).toBeInTheDocument();
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        authState.isAuthenticated = true;
        authState.isResolved = true;
        listingSourceState.data = [
            { listingSourceId: "shop-1", listingSourceSlugId: "erster-shop", name: "Erster Shop" },
            {
                listingSourceId: "shop-2",
                listingSourceSlugId: "zweiter-shop",
                name: "Zweiter Shop",
            },
        ];
        listingSourceState.isPending = false;
        listingSourceState.isError = false;
        partnerApplicationState.data = [];
        partnerApplicationState.isPending = false;
        partnerApplicationState.isError = false;

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("links the primary CTA to access-token management", () => {
        expect(screen.getByRole("heading", { name: "Shop per API anbinden" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Zugriffstoken verwalten/i })).toHaveAttribute(
            "href",
            "/de/partners/access-tokens",
        );
    });

    it("opens the pre-filled access-token form from the token step", () => {
        expect(screen.queryByText("Zugangsdaten erstellen und sichern")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Benutzer-Zugriffstoken erstellen" }));

        expect(screen.getByLabelText("Name")).toHaveValue("Produktsynchronisation per eigener API");
        expect(screen.getByLabelText("Produktangebote schreiben")).toBeChecked();
        expect(
            screen
                .getAllByRole("checkbox")
                .filter((checkbox) => checkbox.getAttribute("data-state") === "checked"),
        ).toHaveLength(1);
        expect(screen.queryByLabelText("Shops verwalten")).not.toBeInTheDocument();
    });

    it("adds granted listing-source selection as the first step and keeps the choice locally", () => {
        expect(
            screen.getByRole("heading", { name: "Freigegebene Angebotsquelle auswählen" }),
        ).toBeInTheDocument();

        const selectedShop = screen.getByRole("radio", { name: "Zweiter Shop" });
        fireEvent.click(selectedShop);

        expect(selectedShop).toBeChecked();
        expect(selectedShop).not.toHaveClass("sr-only");
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/shops/shop-2/products",
        );
    });

    it("selects the only granted source by default", async () => {
        cleanup();
        listingSourceState.data = [
            { listingSourceId: "shop-1", listingSourceSlugId: "erster-shop", name: "Erster Shop" },
        ];

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });

        expect(screen.getByRole("radio", { name: "Erster Shop" })).toBeChecked();
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/shops/shop-1/products",
        );
        expect(screen.getByRole("link", { name: /Meine Shop-Seite öffnen/i })).toHaveAttribute(
            "href",
            "/de/shops/erster-shop",
        );
    });

    it("offers the partner application form when the account has no approved shops", async () => {
        cleanup();
        listingSourceState.data = [];

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });

        fireEvent.click(screen.getByRole("button", { name: "Partner-Shop beantragen" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Partnerantrag einreichen" }),
        ).toBeInTheDocument();
    });

    it("shows pending partner applications by shop name", async () => {
        cleanup();
        listingSourceState.data = [];
        partnerApplicationState.data = [
            {
                id: "application-1",
                businessState: "IN_REVIEW",
                payload: { shopName: "Antiquitäten am Markt" },
            },
        ];

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });

        expect(screen.getByText("Offene Partner-Anträge")).toBeInTheDocument();
        expect(screen.getByText("Antiquitäten am Markt")).toBeInTheDocument();
        expect(screen.getByText("In Prüfung")).toBeInTheDocument();
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("shows a cURL example with highlighted token and unselected-shop placeholders", () => {
        expect(screen.getByTestId("partner-product-code-example")).toBeInTheDocument();
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

    it("links directly to the selected partner shop in the final step", () => {
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));

        expect(screen.getByRole("link", { name: /Meine Shop-Seite öffnen/i })).toHaveAttribute(
            "href",
            "/de/shops/zweiter-shop",
        );
    });
});
