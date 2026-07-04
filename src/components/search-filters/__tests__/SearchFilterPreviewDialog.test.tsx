import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchFilterPreviewDialog } from "../SearchFilterPreviewDialog.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";

const mockUseSearchFilterLiveProducts = vi.fn();

vi.mock("@/hooks/search-filters/useSearchFilterLiveProducts.ts", () => ({
    useSearchFilterLiveProducts: (...args: unknown[]) => mockUseSearchFilterLiveProducts(...args),
}));

vi.mock("@/components/product/overview/ProductCard.tsx", () => ({
    ProductCard: ({ product }: { product: OverviewProduct }) => (
        <div data-testid="product-card">{product.title}</div>
    ),
}));

const mockFilter: UserSearchFilter = {
    userId: "user-1",
    id: "filter-1",
    name: "Barock Möbel",
    notifications: false,
    state: "ACTIVE",
    search: { q: "Tisch" },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-03-01T00:00:00Z"),
};

const baseProduct: OverviewProduct = {
    productId: "product-id-1",
    eventId: "event-1",
    shopId: "shop-1",
    shopsProductId: "prod-1",
    shopSlugId: "shop-slug",
    productSlugId: "prod-slug",
    title: "Barocktisch",
    shopName: "Antik AG",
    sellerName: "Antik AG",
    shopType: "AUCTION_HOUSE",
    state: "AVAILABLE",
    url: null,
    images: [],
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
};

describe("SearchFilterPreviewDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
    });

    it("renders the trigger button with label 'Live-Vorschau'", async () => {
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        expect(screen.getByRole("button", { name: /Live-Vorschau/i })).toBeInTheDocument();
    });

    it("dialog is not visible before button click", async () => {
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens dialog and shows filter name on button click", async () => {
        const user = userEvent.setup();
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByText("Barock Möbel")).toBeInTheDocument();
    });

    it("shows loading spinner when isLoading is true and dialog is open", async () => {
        const user = userEvent.setup();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByRole("status", { name: /Loading/i })).toBeInTheDocument();
    });

    it("shows error message when isError is true", async () => {
        const user = userEvent.setup();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByText(/Vorschau konnte nicht geladen werden/i)).toBeInTheDocument();
    });

    it("shows empty message when data is an empty array", async () => {
        const user = userEvent.setup();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByText(/Keine Treffer/i)).toBeInTheDocument();
    });

    it("shows product cards when data has products", async () => {
        const user = userEvent.setup();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: [baseProduct],
            isLoading: false,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByTestId("product-card")).toBeInTheDocument();
        expect(screen.getByText("Barocktisch")).toBeInTheDocument();
    });

    it("shows matchReason when product has userData.searchFilterData.matchReason", async () => {
        const user = userEvent.setup();
        const productWithReason: OverviewProduct = {
            ...baseProduct,
            userData: {
                watchlistData: { isWatching: false, isNotificationEnabled: false },
                notificationData: { hasUnseenNotification: false },
                restrictedContentData: { consentGiven: true },
                searchFilterData: {
                    matched: true,
                    hidden: false,
                    matchReason: "Passt zu Ihrem Suchauftrag",
                },
            },
        };
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: [productWithReason],
            isLoading: false,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByText("Passt zu Ihrem Suchauftrag")).toBeInTheDocument();
    });

    it("does not show matchReason paragraph when matchReason is absent", async () => {
        const user = userEvent.setup();
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: [baseProduct],
            isLoading: false,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.queryByText(/Passt zu/i)).not.toBeInTheDocument();
    });

    it("shows multiple product cards when data has multiple items", async () => {
        const user = userEvent.setup();
        const secondProduct: OverviewProduct = {
            ...baseProduct,
            productId: "product-id-2",
            title: "Barockstuhl",
        };
        mockUseSearchFilterLiveProducts.mockReturnValue({
            data: [baseProduct, secondProduct],
            isLoading: false,
            isError: false,
        });
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    });

    it("does not close dialog when clicking outside", async () => {
        const user = userEvent.setup();
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));
        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        fireEvent.pointerDown(document.body);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls hook with filter.id and open=false initially, then open=true after click", async () => {
        const user = userEvent.setup();
        await act(() => renderWithRouter(<SearchFilterPreviewDialog filter={mockFilter} />));

        expect(mockUseSearchFilterLiveProducts).toHaveBeenCalledWith("filter-1", false);

        await user.click(screen.getByRole("button", { name: /Live-Vorschau/i }));

        expect(mockUseSearchFilterLiveProducts).toHaveBeenCalledWith("filter-1", true);
    });
});
