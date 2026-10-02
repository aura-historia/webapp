import { vi } from "vitest";
import { useState } from "react";
import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import type { PartnerApplication } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

const applicationState = vi.hoisted(() => ({
    data: [] as PartnerApplication[],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
}));
vi.mock("@/features/partner/application-management/api/usePartnerApplications.ts", () => ({
    usePartnerApplications: () => applicationState,
}));

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
            "/listing-sources/shop-2/product-listings",
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
        applicationState.data = [];
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

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("shows pending existing-source proposals with an application-management link", async () => {
        cleanup();
        listingSourceState.data = [];
        applicationState.data = [
            {
                id: "pa_existing",
                state: "SUBMITTED",
                proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_canonical" },
            },
        ];
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(screen.getByRole("link", { name: "ls_canonical" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("shows proposed source names without inventing source access", async () => {
        cleanup();
        listingSourceState.data = [];
        applicationState.data = [
            {
                id: "pa_proposed",
                state: "IN_REVIEW",
                proposal: {
                    type: "PROPOSED_LISTING_SOURCE",
                    party: { name: "Operator" },
                    listingSource: { name: "Proposed Source", requestedIngestionMethods: [] },
                },
            },
        ];
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(screen.getByRole("link", { name: "Proposed Source" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(screen.getByText("In Prüfung")).toBeInTheDocument();
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it.each(["APPROVED", "REJECTED", "WITHDRAWN"] as const)(
        "does not treat %s applications as pending or granted sources",
        async (state) => {
            cleanup();
            listingSourceState.data = [];
            applicationState.data = [
                {
                    id: "pa_terminal",
                    state,
                    proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_terminal" },
                },
            ];
            await act(async () => {
                renderWithRouter(<PartnerCustomIntegrationPage />);
            });
            expect(screen.queryByText("ls_terminal")).not.toBeInTheDocument();
            expect(screen.queryByRole("radio")).not.toBeInTheDocument();
        },
    );

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
            "/listing-sources/shop-2/product-listings",
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
            "/listing-sources/shop-1/product-listings",
        );
    });

    it("links to application management when no sources are granted", async () => {
        cleanup();
        listingSourceState.data = [];
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(screen.getByRole("link", { name: "Partner-Shop beantragen" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows a cURL example with highlighted token and unselected-shop placeholders", () => {
        expect(screen.getByTestId("partner-product-code-example")).toBeInTheDocument();
        expect(screen.getByText("YOUR_USER_ACCESS_TOKEN").tagName).toBe("MARK");
        expect(screen.getByText("YOUR_LISTING_SOURCE_ID").tagName).toBe("MARK");
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

    it("explains completed synchronous batches and separate webhook admission", () => {
        expect(screen.getByText("Synchrone Angebots-Batches")).toBeInTheDocument();
        expect(screen.getByText(/HTTP 200 · Schreibvorgänge abgeschlossen/)).toBeInTheDocument();
        expect(screen.getByText(/maxItems 100/)).toBeInTheDocument();
        expect(screen.getByText(/x-wc-webhook-signature/)).toHaveTextContent("HTTP 204");
        expect(screen.getByText(/auctionId muss/)).toHaveTextContent("derselben Angebotsquelle");
        expect(screen.queryByText(/202 Accepted/)).not.toBeInTheDocument();
    });

    it("embeds the interactive partner API reference without redundant endpoint cards", () => {
        expect(screen.getByTestId("partner-products-api-reference")).toBeInTheDocument();
        expect(
            screen.queryByText("Die drei Endpunkte für den Produkt-Sync"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Endpunkt separat öffnen")).not.toBeInTheDocument();
    });

    it("exposes every contract topic through level-three heading navigation", () => {
        for (const name of [
            "Batch-Ergebnisse",
            "Erstellungsfelder und Preise",
            "PATCH: beibehalten oder löschen",
            "PUT: Upsert-Semantik",
            "Auktionszuordnung und Loszeiten",
            "Batch-Rücknahme und Wiederherstellung",
            "WooCommerce: Server zu Server",
        ]) {
            expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
        }
    });

    it("uses the source collection path and avoids unsupported shop verification links", () => {
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/listing-sources/shop-2/product-listings",
        );
        expect(
            screen.queryByRole("link", { name: /Meine Shop-Seite öffnen/i }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Batch-Ergebnis prüfen" })).toBeInTheDocument();
    });
});
