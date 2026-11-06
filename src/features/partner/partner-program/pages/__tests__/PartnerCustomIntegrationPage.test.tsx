import { vi } from "vitest";
import { useState } from "react";
import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, cleanup, fireEvent, screen, within } from "@testing-library/react";
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
    sources: [
        { listingSourceId: "shop-1", listingSourceSlugId: "erster-shop", name: "Erster Shop" },
        { listingSourceId: "shop-2", listingSourceSlugId: "zweiter-shop", name: "Zweiter Shop" },
    ],
    isPending: false,
    isError: false,
    hasMore: false,
    canLoadMore: false,
    isLoadingMore: false,
    isLoadMoreError: false,
    loadMore: vi.fn(),
    retry: vi.fn(),
}));
const lastPageSource = {
    listingSourceId: "shop-3",
    listingSourceSlugId: "letzter",
    name: "Letzter Shop",
};

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
    beforeEach(async () => {
        applicationState.data = [];
        vi.clearAllMocks();
        authState.isAuthenticated = true;
        authState.isResolved = true;
        listingSourceState.sources = [
            { listingSourceId: "shop-1", listingSourceSlugId: "erster-shop", name: "Erster Shop" },
            {
                listingSourceId: "shop-2",
                listingSourceSlugId: "zweiter-shop",
                name: "Zweiter Shop",
            },
        ];
        listingSourceState.isPending = false;
        listingSourceState.isError = false;
        listingSourceState.hasMore = false;
        listingSourceState.canLoadMore = false;
        listingSourceState.isLoadingMore = false;
        listingSourceState.isLoadMoreError = false;

        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
    });

    it("clears selection and source links when a grant is revoked", async () => {
        cleanup();
        await act(async () => {
            renderWithRouter(<RefreshableIntegrationPage />);
        });
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        listingSourceState.sources = [];
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
                "Sie haben derzeit keinen Zugriff auf Anbieter. Eine frühere Freigabe wurde möglicherweise widerrufen.",
            ),
        ).toBeInTheDocument();
    });

    it("withholds cached source choices and links after a denied refresh", async () => {
        cleanup();
        await act(async () => {
            renderWithRouter(<RefreshableIntegrationPage />);
        });
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        // The shared hook withholds every loaded page after a failed refresh.
        listingSourceState.isError = true;
        listingSourceState.sources = [];
        fireEvent.click(screen.getByRole("button", { name: "Refresh view" }));
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
        expect(screen.getByTestId("partner-product-code-example")).not.toHaveTextContent(
            "/listing-sources/shop-2/product-listings",
        );
        expect(
            screen.queryByRole("link", { name: /Meine Shop-Seite öffnen/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText("Der Zugriff auf Anbieter konnte nicht geprüft werden."),
        ).toBeInTheDocument();
    });

    it("reaches a provider on the final page and keeps that choice", async () => {
        cleanup();
        listingSourceState.hasMore = true;
        listingSourceState.canLoadMore = true;
        await act(async () => {
            renderWithRouter(<RefreshableIntegrationPage />);
        });
        expect(
            screen.getByText(
                "Weitere Anbieter sind verfügbar. Diese Liste ist noch nicht vollständig.",
            ),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Weitere Anbieter anzeigen" }));
        expect(listingSourceState.loadMore).toHaveBeenCalledOnce();

        listingSourceState.sources = [...listingSourceState.sources, lastPageSource];
        listingSourceState.hasMore = false;
        listingSourceState.canLoadMore = false;
        fireEvent.click(screen.getByRole("button", { name: "Refresh view" }));
        expect(
            screen.queryByRole("button", { name: "Weitere Anbieter anzeigen" }),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("radio", { name: "Letzter Shop" }));
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/listing-sources/shop-3/product-listings",
        );

        // Restarted pages no longer include the choice, so it is neither shown nor used.
        listingSourceState.sources = listingSourceState.sources.slice(0, 2);
        listingSourceState.hasMore = true;
        fireEvent.click(screen.getByRole("button", { name: "Refresh view" }));
        expect(
            screen.getAllByRole("radio").some((radio) => (radio as HTMLInputElement).checked),
        ).toBe(false);
        expect(screen.getByText("YOUR_LISTING_SOURCE_ID").tagName).toBe("MARK");
    });

    it("does not preselect a single loaded provider while more pages exist", async () => {
        cleanup();
        listingSourceState.sources = listingSourceState.sources.slice(0, 1);
        listingSourceState.hasMore = true;
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(screen.getByRole("radio", { name: "Erster Shop" })).not.toBeChecked();
        expect(screen.getByText("YOUR_LISTING_SOURCE_ID").tagName).toBe("MARK");
    });

    it("keeps loaded providers when the next page fails and requests it again", async () => {
        cleanup();
        listingSourceState.hasMore = true;
        listingSourceState.canLoadMore = true;
        listingSourceState.isLoadMoreError = true;
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(screen.getByRole("radio", { name: "Zweiter Shop" })).toBeInTheDocument();
        expect(
            screen.getByText(
                "Weitere Anbieter konnten nicht geladen werden. Diese Liste ist nicht vollständig.",
            ),
        ).toHaveAttribute("role", "alert");
        fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(listingSourceState.loadMore).toHaveBeenCalledOnce();
    });

    it("shows pending existing-source proposals with an application-management link", async () => {
        cleanup();
        listingSourceState.sources = [];
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
        listingSourceState.sources = [];
        applicationState.data = [
            {
                id: "pa_proposed",
                state: "IN_REVIEW",
                proposal: {
                    type: "PROPOSED_LISTING_SOURCE",
                    party: { name: "Operator" },
                    listingSource: {
                        name: "Proposed Source",
                        listingSourceType: "DEALER",
                        requestedIngestionMethods: [],
                    },
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
            listingSourceState.sources = [];
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
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Verbinden Sie Ihren Shop mit unserer API.",
            }),
        ).toBeInTheDocument();
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
            screen.getByRole("heading", { name: "Freigegebenen Anbieter auswählen" }),
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
        listingSourceState.sources = [
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
        listingSourceState.sources = [];
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
        expect(screen.getByText("YOUR_BATCH_KEY").tagName).toBe("MARK");
    });

    it("selects the recommended asynchronous example first and switches modes by tab", () => {
        const asyncTab = screen.getByRole("tab", { name: /^Asynchron/ });
        const syncTab = screen.getByRole("tab", { name: /^Synchron/ });
        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toBe(asyncTab);
        expect(asyncTab).toHaveAttribute("aria-selected", "true");
        expect(asyncTab).toHaveAttribute("tabindex", "0");
        expect(syncTab).toHaveAttribute("tabindex", "-1");
        const example = screen.getByTestId("partner-product-code-example");
        expect(example).toHaveTextContent("/product-listings/async'");
        expect(example).toHaveTextContent("Idempotency-Key: YOUR_BATCH_KEY");
        expect(screen.getByRole("tabpanel")).toHaveTextContent(
            "Liefert 202 · angenommen, für Sie verarbeitet",
        );

        fireEvent.keyDown(asyncTab, { key: "ArrowRight" });
        expect(syncTab).toHaveAttribute("aria-selected", "true");
        expect(syncTab).toHaveFocus();
        expect(screen.getByTestId("partner-product-code-example")).not.toHaveTextContent(
            "Idempotency-Key",
        );
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/product-listings' ",
        );
        expect(screen.getByRole("tabpanel")).toHaveAccessibleName(/^Synchron/);

        fireEvent.keyDown(syncTab, { key: "Home" });
        expect(asyncTab).toHaveAttribute("aria-selected", "true");
        fireEvent.click(syncTab);
        expect(syncTab).toHaveAttribute("aria-selected", "true");
    });

    it("shows both endpoints and the outcomes of each mode in the result step", () => {
        expect(
            screen.getByRole("heading", { name: "Ergebnis für Ihren Modus lesen" }),
        ).toBeInTheDocument();
        const asyncOutcomes = screen.getByText("Asynchron · zur Verarbeitung angenommen");
        const syncOutcomes = screen.getByText("Synchron · abgeschlossene Schreibvorgänge");
        expect(
            asyncOutcomes.compareDocumentPosition(syncOutcomes) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(screen.getByText("Alle angenommen")).toBeInTheDocument();
        expect(screen.getByText("Keiner angenommen")).toBeInTheDocument();
        expect(screen.getByText("Alle geschrieben")).toBeInTheDocument();
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

    it("presents asynchronous batches first and recommended, then synchronous", () => {
        expect(
            screen.getByRole("heading", { name: "Zwei Wege, einen Batch zu senden." }),
        ).toBeInTheDocument();
        const asyncCard = screen.getByRole("article", {
            name: "Jetzt angenommen, für Sie verarbeitet.",
        });
        const syncCard = screen.getByRole("article", {
            name: "Abgeschlossene Schreibvorgänge, direkt in der Antwort.",
        });
        expect(
            asyncCard.compareDocumentPosition(syncCard) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(asyncCard).toHaveAttribute("data-theme", "dark");
        expect(within(asyncCard).getByText("Empfohlen")).toBeInTheDocument();
        expect(within(syncCard).queryByText("Empfohlen")).not.toBeInTheDocument();
        expect(asyncCard).toHaveTextContent("/product-listings/async");
        expect(asyncCard).toHaveTextContent("HTTP 202");
        expect(asyncCard).toHaveTextContent("product-listings:read");
        expect(syncCard).toHaveTextContent("HTTP 200");
        expect(screen.getByText("Zur Verarbeitung angenommen")).toBeInTheDocument();
        expect(screen.getByText("Schreibvorgänge abgeschlossen")).toBeInTheDocument();
        // Both the asynchronous admission and the synchronous outcome topics state the limit.
        expect(screen.getAllByText(/maxItems 100/, { selector: "p" })).toHaveLength(2);
        expect(screen.getByText(/auctionId muss/)).toHaveTextContent("desselben Anbieters");
    });

    it("keeps WooCommerce webhook content off the guide", () => {
        expect(document.body).not.toHaveTextContent(/webhook/i);
        expect(document.body).not.toHaveTextContent(/WooCommerce/);
        expect(document.body).not.toHaveTextContent("x-wc-webhook");
    });

    it("embeds the interactive partner API reference without redundant endpoint cards", () => {
        expect(screen.getByTestId("partner-products-api-reference")).toBeInTheDocument();
        expect(
            screen.queryByText("Die drei Endpunkte für den Produkt-Sync"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Endpunkt separat öffnen")).not.toBeInTheDocument();
    });

    it("exposes every contract topic through level-three heading navigation", () => {
        const names = [
            "Annahmeergebnisse",
            "Idempotenz und Wiederholungen",
            "Ergebnisse abgeschlossener Schreibvorgänge",
            "Erstellungsfelder und Preise",
            "Beibehalten oder löschen",
            "Upsert-Semantik",
            "Auktionszuordnung und Loszeiten",
            "Batch-Rücknahme und Wiederherstellung",
        ];
        const headings = names.map((name) => screen.getByRole("heading", { level: 3, name }));
        // Asynchronous topics lead, in the order listed.
        for (const [index, heading] of headings.slice(1).entries()) {
            expect(
                headings[index].compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        }
        expect(
            screen.queryByRole("heading", { name: "WooCommerce: Server zu Server" }),
        ).not.toBeInTheDocument();
    });

    it("copies the cURL request with the selected provider and confirms it", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText },
            configurable: true,
        });
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Kopieren" }));
        });

        expect(writeText).toHaveBeenCalledWith(
            expect.stringContaining("/listing-sources/shop-2/product-listings/async'"),
        );
        expect(writeText.mock.calls[0]?.[0]).toContain("Bearer YOUR_USER_ACCESS_TOKEN");
        expect(writeText.mock.calls[0]?.[0]).toContain("Idempotency-Key: YOUR_BATCH_KEY");
        expect(screen.getByRole("button", { name: "Kopiert" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("tab", { name: /^Synchron/ }));
        expect(screen.getByRole("button", { name: "Kopieren" })).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Kopieren" }));
        });
        const syncCommand = writeText.mock.calls[1]?.[0];
        expect(syncCommand).toContain("/listing-sources/shop-2/product-listings'");
        expect(syncCommand).not.toContain("Idempotency-Key");
    });

    it("summarises the token with the selected provider", () => {
        expect(screen.getByText("Nicht ausgewählt")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("radio", { name: "Erster Shop" }));
        expect(screen.queryByText("Nicht ausgewählt")).not.toBeInTheDocument();
        expect(screen.getAllByText("Erster Shop")).toHaveLength(2);
    });

    it("explains provider access to signed-out visitors", async () => {
        cleanup();
        authState.isAuthenticated = false;
        await act(async () => {
            renderWithRouter(<PartnerCustomIntegrationPage />);
        });
        expect(
            screen.getByText(
                "Melden Sie sich an, um die Anbieter zu sehen, auf die Ihr Konto Zugriff hat.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Anmelden und Anbieterzugriff prüfen/ }),
        ).toHaveAttribute("href", "/de/partners/applications");
    });

    it("links back to the partner program from the breadcrumb", () => {
        expect(screen.getByRole("link", { name: "Partnerprogramm" })).toHaveAttribute(
            "href",
            "/de/partner-program",
        );
    });

    it("uses the source collection path and avoids unsupported shop verification links", () => {
        fireEvent.click(screen.getByRole("radio", { name: "Zweiter Shop" }));
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/listing-sources/shop-2/product-listings",
        );
        expect(
            screen.queryByRole("link", { name: /Meine Shop-Seite öffnen/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Ergebnis für Ihren Modus lesen" }),
        ).toBeInTheDocument();
    });
});
