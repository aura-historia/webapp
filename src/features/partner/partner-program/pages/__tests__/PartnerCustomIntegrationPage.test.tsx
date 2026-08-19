import { vi } from "vitest";
import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";

const authState = vi.hoisted(() => ({
    isAuthenticated: true,
    isResolved: true,
}));

const partnerShopState = vi.hoisted(() => ({
    data: [
        { shopId: "shop-1", shopSlugId: "erster-shop", name: "Erster Shop" },
        { shopId: "shop-2", shopSlugId: "zweiter-shop", name: "Zweiter Shop" },
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

vi.mock("@/features/partner/common/api/usePartnerShops.ts", () => ({
    usePartnerShops: () => partnerShopState,
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

describe("PartnerCustomIntegrationPage", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        authState.isAuthenticated = true;
        authState.isResolved = true;
        partnerShopState.data = [
            { shopId: "shop-1", shopSlugId: "erster-shop", name: "Erster Shop" },
            { shopId: "shop-2", shopSlugId: "zweiter-shop", name: "Zweiter Shop" },
        ];
        partnerShopState.isPending = false;
        partnerShopState.isError = false;
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
        expect(screen.getByLabelText("Produkte schreiben")).toBeChecked();
        expect(screen.getByLabelText("Shops verwalten")).not.toBeChecked();
    });

    it("adds approved partner-shop selection as the first step and keeps the choice locally", () => {
        expect(
            screen.getByRole("heading", { name: "Freigegebenen Partner-Shop auswählen" }),
        ).toBeInTheDocument();

        const selectedShop = screen.getByRole("radio", { name: "Zweiter Shop" });
        fireEvent.click(selectedShop);

        expect(selectedShop).toBeChecked();
        expect(selectedShop).not.toHaveClass("sr-only");
        expect(screen.getByTestId("partner-product-code-example")).toHaveTextContent(
            "/shops/shop-2/products",
        );
    });

    it("selects the only approved shop by default", async () => {
        cleanup();
        partnerShopState.data = [
            { shopId: "shop-1", shopSlugId: "erster-shop", name: "Erster Shop" },
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
        partnerShopState.data = [];

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
        partnerShopState.data = [];
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
